import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entity/board.entity';
import { HashtagsModule } from '../hashtags/hashtags.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Board, //
		]), //
		HashtagsModule,
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
