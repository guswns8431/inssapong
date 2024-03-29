import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Logger,
  Post,
  Put,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FtAuthGuard } from './ft_oauth/ft.guard';
import { JwtSignGuard } from './jwt/jwt-sign.guard';
import { Public } from './public.decorator';
import {
  RequestConfirmCertificationNumberDTO,
  RequestEditProfileDto,
} from './dto/swagger-login.dto';
import { User } from './user.decorator';
import { TwoFactorDTO, FtUserDto, SignupDTO } from './dto/login.dto';
import { JwtTwoFactorAuthGuard } from './jwt/jwt-twofactor-auth.guard';
import { LoginService } from './login.service';
import { JwtSignupAuthGuard } from './jwt/jwt-signup-auth.guard';
import { UsersRepository } from 'src/users/users.repository';

@Controller('/login')
@ApiTags('로그인 API')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly usersRepository: UsersRepository,
  ) {}

  private readonly logger = new Logger(LoginController.name);

  @ApiOperation({ summary: '42 Oauth 로그인' })
  @Public()
  @UseGuards(FtAuthGuard)
  @Get('42')
  async ftLogin() {
    return;
  }

  @ApiOperation({ summary: '42 Oauth 로그인 콜백' })
  @Public()
  @UseGuards(FtAuthGuard, JwtSignGuard)
  @Get('42/callback')
  async ftCallback() {
    return;
  }

  @ApiOperation({
    summary: '2차 인증 유효성 검사 & 메일 전송',
    description: '본인 intra 이메일로 전송됨',
  })
  @Public()
  @UseGuards(JwtTwoFactorAuthGuard)
  @Get('/twofactor')
  async sendTwoFactorMail(@User() user: FtUserDto) {
    this.logger.log(`GET /login/twofactor`);
    const isUserExist = await this.usersRepository.isUserExist(user.id);
    if (isUserExist === false) {
      throw new UnauthorizedException();
    }
    await this.loginService.sendTwoFactorMail(user);
  }

  @ApiOperation({ summary: '2차 인증 성공 여부' })
  @ApiBody({ type: RequestConfirmCertificationNumberDTO })
  @ApiOkResponse({ description: '2차 인증 성공' })
  @ApiBadRequestResponse({ description: '2차 인증 실패' })
  @Public()
  @UseGuards(JwtTwoFactorAuthGuard)
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Origin', 'http://localhost:8080')
  @Put('/twofactor')
  async confirmCertificationNumber(
    @User() user: FtUserDto,
    @Body() twofactor: TwoFactorDTO,
    @Res() res,
  ) {
    await this.loginService.confirmCertificationNumber(
      user.id,
      twofactor.certificationNumber,
    );
    const accessToken = this.loginService.getAuthenticatedAccessToken(user);
    res.cookie('Authorization', accessToken);
    res.status(200).send();
  }

  @ApiOperation({ summary: 'signup 입장 유효성 검사' })
  @ApiOkResponse({ description: '회원 가입이 필요한 유저' })
  @ApiForbiddenResponse({ description: '이미 DB에 존재하는 유저' })
  @Public()
  @UseGuards(JwtSignupAuthGuard)
  @Get('/signup')
  async authEditProfile(@User() user: FtUserDto) {
    this.logger.log(`GET /login/signup`);
    if (user.isRegistered === true) {
      throw new ForbiddenException();
    }
  }

  @ApiOperation({ summary: '최초 로그인 시 signup' })
  @ApiBody({ type: RequestEditProfileDto })
  @ApiOkResponse({ description: '회원가입 성공' })
  @ApiInternalServerErrorResponse({ description: 'DB에서 에러 반환' })
  @Public()
  @UseGuards(JwtSignupAuthGuard)
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Origin', 'http://localhost:8080')
  @Post('/signup')
  async editProfile(
    @User() user: FtUserDto,
    @Body() signup_data: SignupDTO,
    @Res() res,
  ) {
    this.logger.log(`Post /login/signup`);
    await this.loginService.signUp(user, signup_data);
    const accessToken = this.loginService.getAuthenticatedAccessToken(user);
    res.cookie('Authorization', accessToken);
    res.status(200).send();
  }
}
