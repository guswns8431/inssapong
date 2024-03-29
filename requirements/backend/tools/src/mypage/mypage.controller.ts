import {
  Controller,
  Get,
  Patch,
  Body,
  Logger,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import {
  GameHistoryDto,
  MypageInfoDto,
  GameStatDto,
  FollowsDto,
  OneGameHistoryDto,
} from './dto/create-mypage.dto';
import { UpdateMypageInfoDto } from './dto/update-mypage.dto';
import { MypageRepository } from './mypage.repository';
import { MypageService } from './mypage.service';
import { Response } from 'express';
import { User } from 'src/login/user.decorator';
import { FtUserDto } from 'src/login/dto/login.dto';

// 2-2
@ApiTags('마이페이지 API')
@ApiResponse({ status: 200, description: '성공' })
@Controller('/mypage')
export class MypageController {
  private readonly logger = new Logger(MypageController.name);
  constructor(
    private readonly mypageService: MypageService,
    private readonly mypageRepository: MypageRepository,
  ) {}

  @ApiOperation({
    summary: 'mypage 유저 정보 가져오기',
    description: '현재 클라이언트에 접속 중인 유저의 정보를 반환',
  })
  @ApiOkResponse({
    description: '성공',
    type: MypageInfoDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get()
  async getUserInfo(@User() user: FtUserDto, @Res() res: Response) {
    const userInfoDB = await this.mypageRepository.getUserInfo(user.id);
    if (userInfoDB.length <= 0) {
      this.logger.error(
        `[${this.getUserInfo.name}] ${user.id}: 존재하지 않는 유저`,
      );
      throw new NotFoundException(`${user.id}: 존재하지 않는 유저`);
    }
    if (userInfoDB[0][`avatar`] == null)
      userInfoDB[0][`avatar`] = this.mypageService.getDefaultImage();
    const userinfo: MypageInfoDto = {
      id: userInfoDB[0]['id'],
      nickname: userInfoDB[0]['nickname'],
      avatar: `${userInfoDB[0]['avatar']}`,
      twofactor_status: userInfoDB[0]['twofactor_status'],
    };
    this.logger.log(`${userinfo.id}의 정보를 가져오는데 성공`);
    res.status(200).send(userinfo);
  }

  @ApiOperation({
    summary: 'nickname or avatar or twoFacktor_status 업데이트',
    description:
      'UserInfo를 업데이트 하는 API.\
	  \n request body에 UserInfo의 {nickname | avatar | twoFacktor_status} 해당 요소들 중 최소 하나만 존재하면 됨',
  })
  @ApiBody({
    type: UpdateMypageInfoDto,
  })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiConflictResponse({
    description: '중복된 닉네임',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Patch()
  async patchUserInfo(
    @User() user: FtUserDto,
    @Body() body: UpdateMypageInfoDto,
    @Res() res: Response,
  ) {
    await this.mypageService.updateMypageInfo(user.id, body);
    this.logger.log(`${user.id}의 정보를 업데이트하는데 성공`);
    res.status(200).send();
  }

  @ApiOperation({
    summary: 'follow 목록 가져오기',
    description: '해당 유저가 follow하고 있는 id 배열 반환',
  })
  @ApiOkResponse({
    description: '성공',
    type: FollowsDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get('/follows')
  async getFollows(@User() user: FtUserDto, @Res() res: Response) {
    const followsDB = await this.mypageRepository.getFollows(user.id);
    const follows: FollowsDto = { follow: [] };
    for (const element of followsDB) {
      follows.follow.push(element['partner_id'] as string);
    }
    this.logger.log(`${user.id}의 follow를 가져오는데 성공`);
    res.status(200).send(follows);
  }

  @ApiOperation({
    summary: '게임 전적 기록 가져오기',
    description: '해당 유저의 게임 전적 기록 가져오기',
  })
  @ApiOkResponse({
    description: '성공',
    type: GameHistoryDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get('/gameHistory')
  async getGameHistory(@User() user: FtUserDto, @Res() res: Response) {
    const gameHistoryDB = await this.mypageRepository.getGameHistory(user.id);
    const gameHistory: GameHistoryDto = {
      gameHistory: [],
    };
    for (const element of gameHistoryDB) {
      const oneGameHistory: OneGameHistoryDto = {
        id: element['id'],
        winner: element['winner_id'],
        loser: element['loser_id'],
      };
      gameHistory.gameHistory.push(oneGameHistory);
    }
    this.logger.log(`${user.id}의 게임 전적을 가져오는데 성공`);
    res.status(200).send(gameHistory);
  }

  @ApiOperation({
    summary: '게임 승패 수 가져오기',
    description: '해당 유저의 게임 승 수, 패 수 가져오기',
  })
  @ApiOkResponse({
    description: '성공',
    type: GameStatDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @Get('/gameStat')
  async getGameStat(@User() user: FtUserDto, @Res() res: Response) {
    const winHistoryDB = await this.mypageRepository.getWinHistory(user.id);
    const loseHistoryDB = await this.mypageRepository.getLoseHistory(user.id);
    const gameStat: GameStatDto = {
      wins: winHistoryDB.length,
      loses: loseHistoryDB.length,
    };
    this.logger.log(`${user.id}의 승패 수를 가져오는데 성공`);
    res.status(200).send(gameStat);
  }
}
