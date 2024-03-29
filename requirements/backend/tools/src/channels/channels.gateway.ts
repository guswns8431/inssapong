import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from 'src/sockets/main.gateway';
import { USER_STATUS } from 'src/sockets/user.component';
import {
  CHANNEL_AUTHORITY,
  CHANNEL_COMMAND,
  MUTE_TIME,
} from './channels.component';
import { ChannelsRepository } from './channels.repository';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { ChannelsService } from './channels.service';

@WebSocketGateway({ cors: true })
export class ChannelsGateway {
  mute_users: string[] = [];
  private readonly logger: Logger = new Logger(ChannelsGateway.name);
  constructor(
    private mainGateway: MainGateway,
    private readonly channelsRepository: ChannelsRepository,
    private readonly channelsService: ChannelsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @SubscribeMessage('channel/checkEntered')
  async checkEntered(client: Socket, data: string) {
    const req = JSON.parse(data);
    const status_code = await this.channelsRepository.checkEnteredChannel(
      req.user_id,
      req.channel_id,
    );
    if (status_code == 400) {
      client.emit('channel/checkEnteredFail');
      return;
    }
    if (status_code == 500) {
      client.emit('DBError');
      return;
    }
    client.emit('channel/checkEnteredSuccess');
    this.sendPreviousChannel(client, req.user_id, req.channel_id);
  }

  @SubscribeMessage('channel/enteredDM')
  async enteredDM(client: Socket, data: string) {
    const req = JSON.parse(data);
    const is_user_exist = await this.channelsRepository.isUserExist(
      req.partner_id,
    );
    if (is_user_exist != 200) {
      client.emit('DBError');
      return;
    }
    this.sendPreviousDM(client, req.user_id, req.partner_id);
  }

  @SubscribeMessage('channel/send')
  sendMessage(client: Socket, data: string) {
    const req = JSON.parse(data);
    if (req.channel_id != undefined) {
      this.sendMessageToChannel(client, req);
    } else if (req.receiver_id != undefined) {
      this.sendMessageDM(client, req);
    }
  }

  async sendPreviousChannel(
    client: Socket,
    user_id: string,
    channel_id: number,
  ) {
    const message = await this.channelsRepository.getAllMessageChannel(
      channel_id,
    );
    if (message == undefined) {
      client.emit('DBError');
      return;
    }
    const block_users = await this.getBlockUsersAmongMember(
      client,
      user_id,
      channel_id,
    );

    message.forEach((element) => {
      const user = block_users.find((user) => user == element.sender_id);
      if (user == undefined) {
        client.emit('channel/send', element.sender_id, element.content, channel_id);
      }
    });
  }

  async sendPreviousDM(client: Socket, user_id: string, partner_id: string) {
    const messages = await this.channelsRepository.getAllMessageDM(
      user_id,
      partner_id,
    );
    if (messages == undefined) {
      client.emit('DBError');
      return;
    }
    const is_block = await this.channelsRepository.isBlockedUser(
      user_id,
      partner_id,
    );
    if (is_block == 500) {
      client.emit('DBError');
      return;
    }

    messages.forEach((element) => {
      if (!(element.sender_id == partner_id && is_block == 200)) {
        client.emit(
          'DM/send',
          element.sender_id,
          element.receiver_id,
          element.content,
        );
      }
    });
  }

  async sendMessageToChannel(client: Socket, req: any) {
    const is_mute = await this.cacheManager.get(`mute_${req.sender_id}`);
    if (is_mute != undefined && is_mute == req.channel_id) {
      client.emit(
        'channel/send',
        'server',
        `음소거 중! 메세지를 보낼 수 없습니다.`,
        req.channel_id,
      );
      return;
    }

    if (await this.isCommand(client, req) == true) return;

    const db_result = await this.channelsRepository.insertChannelMessage(
      req.channel_id,
      req.sender_id,
      req.message,
    );
    if (db_result == 500) {
      client.emit('DBError');
      return;
    }
    this.broadcastToChannel(client, req);
  }

  async sendMessageDM(client: Socket, req: any) {
    const db_result = await this.channelsRepository.insertDM(
      req.sender_id,
      req.receiver_id,
      req.message,
    );
    if (db_result == 500) {
      client.emit('DBError');
      return;
    }
    this.broadcastToDM(client, req);
  }

  async broadcastToChannel(client: Socket, req: any) {
    const roomMembers = await this.channelsRepository.getRoomMembers(
      req.channel_id,
    );
    if (roomMembers == undefined) {
      client.emit('DBError');
      return;
    }
    roomMembers.forEach((element) =>
      this.sendToNonBlockedUser(element.user_id, req),
    );
  }

  async broadcastToDM(client: Socket, req: any) {
    const receiver = this.mainGateway.users.find(
      (user) => user.id == req.receiver_id,
    );
    if (receiver == undefined) {
      this.logger.log(
        `[broadcastToDM] : ${req.receiver_id}가 없음. 있을 수 없는 일!`,
      );
    }
    const is_block = await this.channelsRepository.isBlockedUser(
      receiver.id,
      req.sender_id,
    );
    if (is_block == 400 && receiver.status == USER_STATUS.ONLINE) {
      receiver.socket.emit(
        'DM/send',
        req.sender_id,
        req.receiver_id,
        req.message,
      );
    }
    client.emit('DM/send', req.sender_id, req.receiver_id, req.message);
  }

  async getBlockUsersAmongMember(
    client: Socket,
    user_id: string,
    channel_id: number,
  ) {
    const block_user: string[] = [];
    const roomMembers = await this.channelsRepository.getRoomMembers(
      channel_id,
    );
    if (roomMembers == undefined) {
      client.emit('DBError');
      return;
    }
    for (const member of roomMembers) {
      const is_block = await this.channelsRepository.isBlockedUser(
        user_id,
        member.user_id,
      );
      if (is_block == 200) {
        block_user.push(member.user_id);
      }
      if (is_block == 500) {
        client.emit('DBError');
        return;
      }
    }
    return block_user;
  }

  async sendToNonBlockedUser(receiver: string, req: any) {
    const member = this.mainGateway.users.find((user) => user.id == receiver);
    if (member == undefined) {
      this.logger.log(
        `[sendToNonBlockedUser] : ${receiver}가 없음. 있을 수 없는 일!`,
      );
      return;
    }
    const is_block = await this.channelsRepository.isBlockedUser(
      receiver,
      req.sender_id,
    );
    if (is_block == 400 && member.status == USER_STATUS.ONLINE) {
      member.socket.emit('channel/send', req.sender_id, req.message, req.channel_id);
    }
  }

  async isCommand(client: Socket, req: any) {
    if (!(req.message[0] == '[' && -1 < req.message.search(']'))) {
      return false;
    }
    const keyword = req.message
      .slice(1, req.message.search(']'))
      .replace(/\s/g, '')
      .toLowerCase();
    const content = req.message
      .slice(req.message.search(']') + 1, req.message.length)
      .replace(/\s/g, '')
      .toLowerCase();

    if (this.is_me(req.sender_id, content) == true) {
      client.emit('channel/commandFailed', '자기 자신은 설정할 수 없습니다.');
      return true;
    }
    switch (keyword) {
      case CHANNEL_COMMAND.CHPWD:
        this.changeChannelPassword(client, req, content);
        return true;
      case CHANNEL_COMMAND.ADMIN:
        this.insertChannelAdmin(client, req, content);
        return true;
      case CHANNEL_COMMAND.KICK:
        this.kickChannel(client, req, content);
        return true;
      case CHANNEL_COMMAND.MUTE:
        this.muteChannel(client, req, content);
        return true;
      case CHANNEL_COMMAND.BAN:
        this.banChannel(client, req, content);
        return true;
      default:
        return false;
    }
  }

  async changeChannelPassword(client: Socket, req: any, password: string) {
    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority != CHANNEL_AUTHORITY.OWNER) {
      client.emit('channel/commandFailed', '권한이 없습니다.');
      return;
    }

    const salt_password = await this.getSaltPassword(password);
    if (salt_password == undefined) {
      client.emit('channel/commandFailed', '잘못된 비밀번호입니다.');
      return;
    }

    const db_result = await this.channelsRepository.changeChannelPassword(
      req.channel_id,
      salt_password,
    );
    if (db_result == 500) {
      client.emit('DBError');
    } else {
      this.mainGateway.changedChannelList();
      client.emit('channel/send', 'server', `변경 성공!`, req.channel_id);
    }
  }

  async insertChannelAdmin(client: Socket, req: any, admin_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(admin_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }
    if (await this.isChannelMember(client, req, admin_id) == false) {
      client.emit('channel/commandFailed', '채널에 없는 사용자입니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == CHANNEL_AUTHORITY.GUEST) {
      client.emit('channel/commandFailed', '권한이 없습니다.');
      return;
    }

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      admin_id,
      req.channel_id,
    );
    if (possible_authority == false) {
      client.emit('channel/commandFailed', `${admin_id}의 권한이 더 높습니다.`);
      return;
    }

    const db_result = await this.channelsRepository.changeChannelAuthority(
      admin_id,
      req.channel_id,
      CHANNEL_AUTHORITY.ADMIN,
    );
    if (db_result == 500) {
      client.emit('DBError');
    } else {
      client.emit(
        'channel/send',
        'server',
        `${admin_id}를 관리자로 등록 완료!`,
        req.channel_id,
      );
    }
  }

  async kickChannel(client: Socket, req: any, kick_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(kick_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }
    if (await this.isChannelMember(client, req, kick_id) == false) {
      client.emit('channel/commandFailed', '채널에 없는 사용자입니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == CHANNEL_AUTHORITY.GUEST) {
      client.emit('channel/commandFailed', '권한이 없습니다.');
      return;
    }

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      kick_id,
      req.channel_id,
    );
    if (possible_authority == false) {
      client.emit('channel/commandFailed', `${kick_id}의 권한이 더 높습니다.`);
      return;
    }

    try {
      await this.channelsService.exitChannel(req.channel_id, kick_id);
      this.exitSocketEvent(kick_id, 'kick');
      client.emit('channel/send', 'server', `${kick_id}를 kick 완료!`, req.channel_id);
      this.mainGateway.changedChannelMember(req.channel_id);
    } catch {
      client.emit('DBError');
    }
  }

  async muteChannel(client: Socket, req: any, mute_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(mute_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }
    if (await this.isChannelMember(client, req, mute_id) == false) {
      client.emit('channel/commandFailed', '채널에 없는 사용자입니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == CHANNEL_AUTHORITY.GUEST) {
      client.emit('channel/commandFailed', '권한이 없습니다.');
      return;
    }

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      mute_id,
      req.channel_id,
    );
    if (possible_authority == false) {
      client.emit('channel/commandFailed', `${mute_id}의 권한이 더 높습니다.`);
      return;
    }

    await this.cacheManager.set(
      `mute_${mute_id}`,
      `${req.channel_id}`,
      MUTE_TIME,
    );
    client.emit('channel/send', 'server', `${mute_id}를 음소거 시킴!`, req.channel_id);
  }

  async banChannel(client: Socket, req: any, ban_id: string) {
    const is_user_exist = await this.channelsRepository.isUserExist(ban_id);
    if (is_user_exist == 404) {
      client.emit('channel/commandFailed', '아이디가 존재하지 않습니다.');
      return;
    }
    if (await this.isChannelMember(client, req, ban_id) == false) {
      client.emit('channel/commandFailed', '채널에 없는 사용자입니다.');
      return;
    }

    const authority = await this.getAuthority(
      client,
      req.sender_id,
      req.channel_id,
    );
    if (authority == CHANNEL_AUTHORITY.GUEST) {
      client.emit('channel/commandFailed', '권한이 없습니다.');
      return;
    }

    const possible_authority = await this.checkHighAuthority(
      client,
      req.sender_id,
      ban_id,
      req.channel_id,
    );
    if (possible_authority == false) {
      client.emit('channel/commandFailed', `${ban_id}의 권한이 더 높습니다.`);
      return;
    }

    const db_result = await this.channelsRepository.patchBanStatus(
      ban_id,
      req.channel_id,
      true,
    );
    if (db_result == 500) {
      client.emit('DBError');
    } else {
      this.exitSocketEvent(ban_id, 'ban');
      client.emit('channel/send', 'server', `${ban_id}를 ban 함!`, req.channel_id);
      this.mainGateway.changedChannelMember(req.channel_id);
    }
  }

  async getAuthority(client: Socket, id: string, channel_id: number) {
    const authority = await this.channelsRepository.getAuthority(
      id,
      channel_id,
    );
    if (authority == 500) {
      client.emit('DBError');
      return 500;
    }
    return authority;
  }

  async checkHighAuthority(
    client: Socket,
    user1: string,
    user2: string,
    channel_id: number,
  ) {
    const user1_authority = await this.getAuthority(client, user1, channel_id);
    const user2_authority = await this.getAuthority(client, user2, channel_id);

    if (user1_authority <= user2_authority) return true;
    else return false;
  }

  exitSocketEvent(user_id: string, command: string) {
    const user = this.mainGateway.users.find((user) => user.id == user_id);
    if (user == undefined) {
      this.logger.log(`[exitSocketEvent] ${user_id} 그럴 일 없음...`);
    }
    user.socket.emit('channel/exit', command);
  }

  async getSaltPassword(password: string) {
    if (password.length == 4 && password.match(/^[0-9]+$/) != null) {
      const salt = await bcrypt.genSalt();
      return await bcrypt.hash(password, salt);
    } else if (password.length == 0) {
      return '';
    }
    return;
  }

  is_me(user_id: string, partner_id: string) {
    if (user_id == partner_id) {
      return true;
    }
    else {
      return false;
    }
  }

  async isChannelMember(client: Socket, req: any, user: string) {
    const status_code = await this.channelsRepository.checkEnteredChannel(
      user,
      req.channel_id,
    );
    if (status_code == 400) {
      return false;
    }
    if (status_code == 500) {
      client.emit('DBError');
      return false;
    }
    return true;
  }
}
