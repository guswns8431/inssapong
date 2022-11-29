import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppRepository {
  private readonly logger = new Logger(AppRepository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async isUserExist(user_id: string) {
    try {
      const databaseResponse = await this.databaseService.runQuery(
        `
				  SELECT id FROM "user"
          WHERE id=$1;
			  `,
        [user_id],
      );
      if (databaseResponse.length === 0) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`[${this.isUserExist.name}] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}
