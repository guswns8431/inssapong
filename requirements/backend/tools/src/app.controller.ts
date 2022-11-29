import { Controller, Get, Header, Logger, Req, Res } from '@nestjs/common';
import { AppRepository } from './app.repository';
import { FtUserDto } from './login/dto/login.dto';
import { User } from './login/user.decorator';

// 2-1
@Controller('')
export class AppController {
  constructor(private readonly appRepository: AppRepository) {}

  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Origin', 'http://localhost:8080')
  @Get('/loginCheck')
  async loginCheck(@User() user: FtUserDto, @Res() res) {
    const isUserExist = await this.appRepository.isUserExist(user.id);
    if (isUserExist === false) {
      res.cookie('Authorization', '');
    }
    res.status(200).send(user.id);
    return;
  }
}
