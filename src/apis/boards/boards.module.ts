import { Module, forwardRef } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entity/board.entity';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { UsersModule } from '../users/users.module';
import { AnswersModule } from '../answers/answers.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Board, //
		]), //
		forwardRef(() => AnswersModule),
		HashtagsModule,
		UsersModule,
	],
	controllers: [
		BoardsController, //
	],
	providers: [
		BoardsService, //
	],
	exports: [
		BoardsService, //
	],
})
export class BoardsModule {}
