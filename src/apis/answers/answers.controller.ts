import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDTO } from './dto/create-answer.dto';
import { Answer } from './entity/answer.entity';
import { UpdateAnswerDTO } from './dto/update-answer.dto';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { UpdateAnswerStatusDTO } from './dto/update-answer-status.dto';
import { GetBestAnswers } from './dto/get-best-answers.dto';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';

@ApiTags('answers')
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
	@ApiOperation({ summary: '답변 생성 API' })
	@ApiCreatedResponse({ description: '답변이 성공적으로 생성되었음', type: Answer })
	@ApiNotFoundResponse({ description: '유저를 찾을 수 없습니다.' })
	@ApiBearerAuth()
	@Post()
	@UsePipes(ValidationPipe)
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
	@ApiOperation({ summary: '답변 수정 API' })
	@ApiOkResponse({ description: '답변이 성공적으로 업데이트되었음', type: Answer })
	@ApiNotFoundResponse({ description: '답변(또는 유저)을 찾을 수 없습니다.' })
	@ApiParam({ name: 'id', description: '답변 id' })
	@ApiBearerAuth()
	@Patch('/:id')
	@UsePipes(ValidationPipe)
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
	@ApiOperation({ summary: '답변 삭제 API' })
	@ApiOkResponse({ description: '답변이 성공적으로 삭제되었음' })
	@ApiNotFoundResponse({ description: '답변(또는 유저)을 찾을 수 없습니다.' })
	@ApiParam({ name: 'id', description: '답변 id' })
	@ApiBearerAuth()
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
	@ApiOperation({ summary: '답변 채택 API' })
	@ApiOkResponse({ description: '답변이 성공적으로 업데이트되었음', type: Answer })
	@ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
	@ApiParam({ name: 'id', description: '답변 id' })
	@ApiBearerAuth()
	@Patch('/:id/status')
	@UsePipes(ValidationPipe)
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
	@ApiOperation({ summary: '답변 조회 API' })
	@ApiOkResponse({ description: '답변이 성공적으로 조회되었음', type: [Answer] })
	@ApiQuery({ name: 'board-id', description: '게시글 id' })
	@ApiQuery({ name: 'status', description: '채택 여부' })
	@Get()
	getAnswersByBoardId(
		@Query('board-id', ParseIntPipe) boardId: number, //
		@Query('status', ParseIntPipe) status: number,
	): Promise<Answer[]> {
		return this.answersService.getAnswersByBoardId({ boardId, status });
	}

	/**
	 * PATCH '/answers/:id/likes' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param id 답변 id
	 * @returns 업데이트한 답변 정보
	 */
	@ApiOperation({ summary: '답변 좋아요 API' })
	@ApiOkResponse({ description: '답변이 성공적으로 업데이트되었음', type: Number })
	@ApiParam({ name: 'id', description: '답변 id' })
	@ApiBearerAuth()
	@Patch('/:id/likes')
	@UseGuards(restAuthGuard('access'))
	updateAnswerLikes(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number,
	): Promise<number> {
		return this.answersService.updateAnswerLikes({ userId: req.user.id, id });
	}

	/**
	 * GET '/answers/best' 라우트 핸들러
	 * @returns GetBestAnswers 배열 - GetBestAnswers: userImg, nickname, contents, likes
	 */
	@ApiOperation({ summary: '좋아요 TOP3 답변 조회 API' })
	@ApiOkResponse({ description: '답변이 성공적으로 조회되었음', type: [GetBestAnswers] })
	@Get('/best')
	getBestAnswers(): Promise<GetBestAnswers[]> {
		return this.answersService.getBestAnswers();
	}
}
