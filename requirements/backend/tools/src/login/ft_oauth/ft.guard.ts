import {
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtAuthGuard extends AuthGuard('42') {
  private readonly logger = new Logger(FtAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log(`[${context.getHandler().name}] -> [canActivate]`);
    try {
      const activate: boolean = (await super.canActivate(context)) as boolean;
      return activate;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
