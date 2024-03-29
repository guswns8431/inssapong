import {
  ImATeapotException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CHANNEL_AUTHORITY } from './channels.component';
import { ChannelMemberTableDto } from './dto/channels.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(ChannelsRepository.name);

  // Description: 채널 생성
  async insertChannel(
    channel_name: string,
    channel_password: string,
  ): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "channel" (name, password)
          VALUES ($1, $2);
        `,
        [channel_name, channel_password],
      );
    } catch (error) {
      this.logger.error(`[${this.insertChannel.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널 이름을 통해 채널 ID를 가져오기
  async getChannelIdByChannelName(channel_name: string): Promise<number> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT id FROM "channel"
            WHERE name=$1;
          `,
          [channel_name],
        );
      return databaseResponse[0].id;
    } catch (error) {
      this.logger.error(`[${this.getChannelIdByChannelName.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널 ID를 통해 채널 이름을 가져오기
  async getChannelNameByChannelId(channel_id: number): Promise<string> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT name FROM "channel"
            WHERE id=$1;
          `,
          [channel_id],
        );
      return databaseResponse[0].name;
    } catch (error) {
      this.logger.error(`[${this.getChannelNameByChannelId.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널 멤버에 추가 (Owner)
  async insertOwnerToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "channel_member" (user_id, channel_id, ban_status, authority)
          VALUES ($1, $2, $3, $4);
        `,
        [user_id, channel_id, false, CHANNEL_AUTHORITY.OWNER],
      );
    } catch (error) {
      this.logger.error(`[${this.insertOwnerToChannelMember.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널 멤버에 추가 (Owner)
  async insertGuestToChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "channel_member" (user_id, channel_id, ban_status, authority)
          VALUES ($1, $2, $3, $4);
        `,
        [user_id, channel_id, false, CHANNEL_AUTHORITY.GUEST],
      );
    } catch (error) {
      this.logger.error(`[${this.insertGuestToChannelMember.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널 목록 가져오기
  async getAllChannelListIncludePrivate(): Promise<ChannelMemberTableDto[]> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT id, name, password FROM "channel";
          `,
        );
      return databaseResponse;
    } catch (error) {
      this.logger.error(
        `[${this.getAllChannelListIncludePrivate.name}] ${error}`,
      );
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 참여 중인 채널인지 확인
  async isJoinedChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT channel_id FROM "channel_member"
            WHERE user_id=$1 AND channel_id=$2;
          `,
          [user_id, channel_id],
        );
      return databaseResponse.length === 0 ? false : true;
    } catch (error) {
      this.logger.error(`[${this.isJoinedChannel.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 유저 ID를 통해 참가 중인 채널 아이디 목록 가져오기
  async getJoinedChannelIdListByUserId(
    user_id: string,
  ): Promise<ChannelMemberTableDto[]> {
    try {
      const databaseResopnse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT channel_id, ban_status FROM "channel_member"
            WHERE user_id=$1 AND ban_status=false;
          `,
          [user_id],
        );
      return databaseResopnse;
    } catch (error) {
      this.logger.error(
        `[${this.getJoinedChannelIdListByUserId.name}] ${error}`,
      );
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널이 존재하는지 여부 확인
  async isChannelExistById(channel_id: number): Promise<boolean> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT id FROM "channel"
            WHERE id=$1;
          `,
          [channel_id],
        );
      return databaseResponse.length === 0 ? false : true;
    } catch (error) {
      this.logger.error(`[${this.isChannelExistById.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async isChannelExistByName(channel_name: string): Promise<boolean> {
    try {
      const databaseResopnse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT name FROM "channel"
            WHERE name=$1;
          `,
          [channel_name],
        );
      if (databaseResopnse.length === 0) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`[${this.isChannelExistByName.name}] ${error}`);
      throw error;
    }
  }

  // Description: 접근하려는 채널의 밴 여부 확인
  async isBannedChannel(user_id: string, channel_id: number): Promise<boolean> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT ban_status FROM "channel_member"
            WHERE user_id=$1 AND channel_id=$2;
          `,
          [user_id, channel_id],
        );
      if (databaseResponse.length === 0) {
        return false;
      }
      return databaseResponse[0].ban_status;
    } catch (error) {
      this.logger.error(`[${this.isBannedChannel.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  // Description: 채널 비밀번호 유효성 검사.
  async isValidChannelPassword(
    channel_id: number,
    input_password: string,
  ): Promise<boolean> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT password FROM "channel"
            WHERE id=$1;
          `,
          [channel_id],
        );
      const password = databaseResponse[0].password;
      if (password) {
        const isValidPw = await bcrypt.compare(input_password, password);
        return isValidPw;
      }
      return !input_password ? true : false;
    } catch (error) {
      this.logger.error(`[${this.isValidChannelPassword.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async getUserIdListInChannelMember(
    channel_id: number,
  ): Promise<ChannelMemberTableDto[]> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT user_id FROM "channel_member"
            WHERE channel_id=$1 AND ban_status=false;
          `,
          [channel_id],
        );
      return databaseResponse;
    } catch (error) {
      this.logger.error(`[${this.getUserIdListInChannelMember.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async getUserAuthorityFromChannel(
    user_id: string,
    channel_id: number,
  ): Promise<number> {
    try {
      const databaseResponse: ChannelMemberTableDto[] =
        await this.databaseService.runQuery(
          `
            SELECT authority FROM "channel_member"
            WHERE user_id=$1 AND channel_id=$2;
          `,
          [user_id, channel_id],
        );
      return databaseResponse[0].authority;
    } catch (error) {
      this.logger.error(`[${this.getUserAuthorityFromChannel.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async deleteAllMessageInChannel(channel_id: number): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          DELETE FROM "message"
          WHERE channel_id=$1;
        `,
        [channel_id],
      );
    } catch (error) {
      this.logger.error(`[${this.deleteAllMessageInChannel.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async deleteOneUserInChannelMember(
    user_id: string,
    channel_id: number,
  ): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          DELETE FROM "channel_member"
          WHERE user_id=$1 AND channel_id=$2;
        `,
        [user_id, channel_id],
      );
    } catch (error) {
      this.logger.error(`[${this.deleteOneUserInChannelMember.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async deleteAllUserInChannelMember(channel_id: number): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          DELETE FROM "channel_member"
          WHERE channel_id=$1;
        `,
        [channel_id],
      );
    } catch (error) {
      this.logger.error(`[${this.deleteAllUserInChannelMember.name}] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async deleteChannel(channel_id: number): Promise<void> {
    try {
      await this.databaseService.runQuery(
        `
          DELETE FROM "channel"
          WHERE id=$1;
        `,
        [channel_id],
      );
    } catch (error) {
      this.logger.error(`[${this.deleteChannel.name}(channel_id)] ${error}`);
      throw new ImATeapotException('ㅇㅡㅇ');
    }
  }

  async checkEnteredChannel(user_id: string, channel_id: number) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT user_id, ban_status
          FROM "channel_member"
          WHERE user_id=$1 AND channel_id=$2 AND ban_status=false;
        `,
        [user_id, channel_id],
      );
      if (
        databaseResponse.length == 1 &&
        databaseResponse[0].ban_status == false
      )
        return 200;
      else return 400;
    } catch (err) {
      this.logger.log(`[checkEnteredChannel] : ${err}`);
      return 500;
    }
  }

  async getRoomMembers(channel_id: number) {
    // todo any 형식 dto로 변경
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
          SELECT user_id FROM "channel_member"
          WHERE channel_id=$1;
        `,
        [channel_id],
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[getRoomMembers] : ${err}`);
      return databaseResponse;
    }
  }

  async insertChannelMessage(
    channel_id: string,
    sender_id: string,
    content: string,
  ) {
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "message" (channel_id, sender_id, content)
          VALUES ($1, $2, $3);
        `,
        [channel_id, sender_id, content],
      );
      return 201;
    } catch (err) {
      this.logger.log(`[insertChannelMessage] : ${err}`);
      return 500;
    }
  }

  async insertDM(sender_id: string, receiver_id: string, content: string) {
    try {
      await this.databaseService.runQuery(
        `
          INSERT INTO "message" (sender_id, receiver_id, content)
          VALUES ($1, $2, $3);
        `,
        [sender_id, receiver_id, content],
      );
      return 201;
    } catch (err) {
      this.logger.log(`[insertDM] : ${err}`);
      return 500;
    }
  }

  async getAllMessageChannel(channel_id: number) {
    // todo any 형식 dto로 변경
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
          SELECT * FROM "message"
          WHERE channel_id=$1;
        `,
        [channel_id],
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[getAllMessageChannel] : ${err}`);
      return databaseResponse;
    }
  }

  async getAllMessageDM(user_id: string, partner_id: string) {
    // todo any 형식 dto로 변경
    let databaseResponse: any[];
    try {
      databaseResponse = await this.databaseService.runQuery(
        `
          SELECT * FROM "message"
          WHERE (sender_id=$1 AND receiver_id=$2)
          OR (sender_id=$2 AND receiver_id=$1);
        `,
        [user_id, partner_id],
      );
      return databaseResponse;
    } catch (err) {
      this.logger.log(`[getAllMessageDM] : ${err}`);
      return databaseResponse;
    }
  }

  async isBlockedUser(user_id: string, partner_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT block_status
          FROM "user_relation"
          WHERE user_id=$1 AND partner_id=$2;
        `,
        [user_id, partner_id],
      );
      if (
        databaseResponse.length == 1 &&
        databaseResponse[0].block_status == true
      )
        return 200;
      else return 400;
    } catch (err) {
      this.logger.log(`[isBlockedUser] : ${err}`);
      return 500;
    }
  }

  async getAuthority(user_id: string, channel_id: number): Promise<number> {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT authority
          FROM "channel_member"
          WHERE user_id=$1 AND channel_id=$2;
        `,
        [user_id, channel_id],
      );
      return databaseResponse[0].authority;
    } catch (err) {
      this.logger.log(`[getAuthority] : ${err}`);
      return 500;
    }
  }

  async changeChannelPassword(id: number, password: string): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel"
          SET password=NULLIF($2, '')::varchar
          WHERE id=$1;
        `,
        [id, password],
      );
      return 200;
    } catch (err) {
      this.logger.log(`[changeChannelPassword] : ${err}`);
      return 500;
    }
  }

  async changeChannelAuthority(
    user_id: string,
    channel_id: number,
    authority: number,
  ): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel_member"
          SET authority = $3
          WHERE user_id=$1 AND channel_id=$2;
        `,
        [user_id, channel_id, authority],
      );
      return 200;
    } catch (err) {
      this.logger.log(`[changeChannelAuthority] : ${err}`);
      return 500;
    }
  }

  async patchBanStatus(
    user_id: string,
    channel_id: number,
    ban_status: boolean,
  ): Promise<number> {
    try {
      await this.databaseService.runQuery(
        `
          UPDATE "channel_member"
          SET ban_status=$3
          WHERE user_id=$1 AND channel_id=$2;
        `,
        [user_id, channel_id, ban_status],
      );
      return 200;
    } catch (err) {
      this.logger.log(`[patchBanStatus] : ${err}`);
      return 500;
    }
  }

  async isUserExist(id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
          SELECT *
          FROM "user"
          WHERE id=$1;
        `,
        [id],
      );
      if (databaseResponse.length == 1) return 200;
      else return 404;
    } catch (err) {
      this.logger.error(`[isUserExist] : ${err}`);
      return 500;
    }
  }
}
