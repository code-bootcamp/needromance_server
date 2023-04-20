import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';
import { UpdateAnswerDTO } from './dto/update-answer.dto';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { UpdateAnswerStatusDTO } from './dto/update-answer-status.dto';
import { UpdateAnswerLikesDTO } from './dto/update-answer-likes.dto';

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
	 * PATCH '/answers/:id/status' 라우트 핸들러
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

	/**
	 * GET '/answers?board-id=:board-id&status=:status' 라우트 핸들러
	 * @param boardId 게시글 id
	 * @param status 채택 여부 - 1: 채택됨 / 0: 채택되지 않음
	 * @returns 게시글 id로 조회한 답변 정보(유저 조인)
	 */
	@Get()
	getAnswersByBoardId(
		@Query('board-id', ParseIntPipe) boardId: number, //
		@Query('status', ParseIntPipe) status: number,
	): Promise<Answer[]> {
		return this.answersService.getAnswersByBoardId({ boardId, status });
	}

	@Patch('/:id/likes')
	@UseGuards(restAuthGuard('access'))
	updateAnswerLikes(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number,
		@Body() updateAnswerLikesDTO: UpdateAnswerLikesDTO,
	): Promise<string> {
		return this.answersService.updateAnswerLikes({ userId: req.user.id, id, updateAnswerLikesDTO });
	}
}
