import {
	Body,
	Controller,
	Delete,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';
import { UpdateAnswerDTO } from './dto/update-answer.dto';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';

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

	@Patch('/:id/status')
	@UseGuards(restAuthGuard('access'))
	updateStatus(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number, //
		@Body('status', ParseBoolPipe) status: boolean,
	): Promise<void> {
		return this.answersService.updateStatus({ userId: req.user.id, id, status });
	}
}
