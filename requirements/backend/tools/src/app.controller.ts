import {
  Body,
  Controller,
  Get,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { FtUserDto } from './login/dto/login.dto';
import { User } from './login/user.decorator';
import { UsersRepository } from './users/users.repository';

// 2-1
@Controller('')
export class AppController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Get('/loginCheck')
  async loginCheck(@User() user: FtUserDto, @Res() res, @Body() body) {
    console.log('loginCheck');
    console.log(body);
    const isUserExist = await this.usersRepository.isUserExist(user.id);
    if (isUserExist === false) {
      throw new UnauthorizedException();
    }
    res.status(200).send(user.id);
    return;
  }
}
