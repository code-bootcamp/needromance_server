import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Answer, //
		]),
		UsersModule,
	],
	controllers: [
		AnswersController, //
	],
	providers: [
		AnswersService, //
	],
})
export class AnswersModule {}
