import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';
import { UpdateAnswerDTO } from './dto/update-answer.dto';

@Controller('answers')
export class AnswersController {
	constructor(
		private readonly answersService: AnswersService, //
	) {}

	/**
	 * POST '/answers' 라우트 핸들러
	 * @param createAnswerDTO 답변 생성 DTO: contents, userId, boardId
	 * @returns 생성한 답변 정보
	 */
	@Post()
	createAnswer(
		@Body() createAnswerDTO: CreateAnswerDTO, //
	): Promise<Answer> {
		return this.answersService.createAnswer({ createAnswerDTO });
	}

	/**
	 * PATCH '/answers/:id' 라우트 핸들러
	 * @param id 답변 id
	 * @param updateAnswerDTO 답변 업데이트 DTO: contents
	 * @returns 업데이트한 답변 정보
	 */
	@Patch('/:id')
	updateAnswer(
		@Param('id', ParseIntPipe) id: number, //
		@Body() updateAnswerDTO: UpdateAnswerDTO,
	): Promise<Answer> {
		return this.answersService.updateAnswer({ id, updateAnswerDTO });
	}

	/**
	 * DELETE '/answers/:id' 라우트 핸들러
	 * @param id 답변 id
	 */
	@Delete('/:id')
	deleteAnswer(
		@Param('id', ParseIntPipe) id: number, //
	): Promise<void> {
		return this.answersService.deleteAnswer({ id });
	}
}
