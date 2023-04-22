import { Module, forwardRef } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { UsersModule } from '../users/users.module';
import { BoardsModule } from '../boards/boards.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Answer, //
		]),
		forwardRef(() => BoardsModule),
		forwardRef(() => UsersModule),
	],
	controllers: [
		AnswersController, //
	],
	providers: [
		AnswersService, //
	],
	exports: [
		AnswersService, //
	],
})
export class AnswersModule {}
