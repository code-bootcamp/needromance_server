import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';
import { UpdateAnswerDTO } from './dto/update-answer.dto';

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

	@Patch('/:id')
	updateAnswer(
		@Param('id', ParseIntPipe) id: number, //
		@Body() updateAnswerDTO: UpdateAnswerDTO,
	): Promise<Answer> {
		return this.answersService.updateAnswer({ id, updateAnswerDTO });
	}
}
