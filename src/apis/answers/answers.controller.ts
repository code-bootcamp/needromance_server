import { Body, Controller, Post } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';

@Controller('answers')
export class AnswersController {
	constructor(
		private readonly answersService: AnswersService, //
	) {}

	@Post()
	createAnswer(
		@Body() createAnswerDTO: CreateAnswerDTO, //
	): Promise<Answer> {
		return this.answersService.createAnswer({ createAnswerDTO });
	}
}
