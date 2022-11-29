import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

// 2-1
@Controller('')
export class AppController {
  private readonly logger: Logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('/loginCheck')
  loginCheckGet(@Req() req, @Res() res) {
    const user_id = req.user.id;
    // id가 db에 존재하나요?
    // - 존재하지 않는다면 jwt isRegisterd? = false
    // - 존재하면 ok

    res.status(200).send(user_id);
    return;
  }
}
