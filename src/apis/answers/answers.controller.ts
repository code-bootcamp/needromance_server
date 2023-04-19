import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';
import { UpdateAnswerDTO } from './dto/update-answer.dto';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { UpdateAnswerStatusDTO } from './dto/update-answer-status.dto';

@Controller('answers')
export class AnswersController {
	constructor(
		private readonly answersService: AnswersService, //
	) {}

	/**
	 * POST '/answers' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param createAnswerDTO 답변 생성 DTO: contents, userId, boardId
	 * @returns 생성한 답변 정보
	 */
	@Post()
	@UseGuards(restAuthGuard('access'))
	createAnswer(
		@Req() req: Request & IAuthUser, //
		@Body() createAnswerDTO: CreateAnswerDTO, //
	): Promise<Answer> {
		return this.answersService.createAnswer({ userId: req.user.id, createAnswerDTO });
	}

	/**
	 * PATCH '/answers/:id' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param id 답변 id
	 * @param updateAnswerDTO 답변 업데이트 DTO: contents
	 * @returns 업데이트한 답변 정보
	 */
	@Patch('/:id')
	@UseGuards(restAuthGuard('access'))
	updateAnswer(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number, //
		@Body() updateAnswerDTO: UpdateAnswerDTO,
	): Promise<Answer> {
		return this.answersService.updateAnswer({ userId: req.user.id, id, updateAnswerDTO });
	}

	/**
	 * DELETE '/answers/:id' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param id 답변 id
	 */
	@Delete('/:id')
	@UseGuards(restAuthGuard('access'))
	deleteAnswer(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number, //
	): Promise<void> {
		return this.answersService.deleteAnswer({ userId: req.user.id, id });
	}

	/**
	 * PATCH '/:id/status' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param id 답변 id
	 * @param updateAnswerStatusDTO 답변 상태 업데이트 DTO: boardId, status
	 * @returns 업데이트한 답변 정보
	 */
	@Patch('/:id/status')
	@UseGuards(restAuthGuard('access'))
	updateAnswerStatus(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number, //
		@Body() updateAnswerStatusDTO: UpdateAnswerStatusDTO,
	): Promise<Answer> {
		return this.answersService.updateAnswerStatus({ userId: req.user.id, id, updateAnswerStatusDTO });
	}
}
