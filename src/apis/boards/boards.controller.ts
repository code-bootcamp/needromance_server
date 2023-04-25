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
import { BoardsService } from './boards.service';
import { CreateBoardDTO } from './dto/create-board.dto';
import { UpdateBoardDTO } from './dto/update-board.dto';
import { Board } from './entity/board.entity';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';

@Controller('boards')
export class BoardsController {
	constructor(
		private readonly boardsService: BoardsService, //
	) {}

	/**
	 * POST '/boards' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param createBoardDTO 게시글 생성 DTO: title, contents, hashtags?
	 * @returns 생성한 게시글 정보
	 */
	@Post()
	@UsePipes(ValidationPipe)
	@UseGuards(restAuthGuard('access'))
	createBoard(
		@Req() req: Request & IAuthUser, //
		@Body() createBoardDTO: CreateBoardDTO,
	): Promise<Board> {
		return this.boardsService.createBoard({ userId: req.user.id, createBoardDTO });
	}

	/**
	 * GET '/boards/search?keyword=:keyword&page=:page' 라우트 핸들러
	 * @param keyword 검색 키워드
	 * @param page 메인페이지의 게시글 페이지
	 * @returns 검색 키워드로 조회한 게시글 10개
	 */
	@Get('/search')
	searchBoards(
		@Query('keyword') keyword: string, //
		@Query('page', ParseIntPipe) page: number,
	): Promise<Board[]> {
		return this.boardsService.searchBoards({ keyword, page });
	}

	/**
	 * GET '/boards?page=:page' 라우트 핸들러
	 * @param page 메인페이지의 게시글 페이지
	 * @returns 조회한 게시글 10개
	 */
	@Get()
	getTenBoards(
		@Query('page', ParseIntPipe) page: number, //
	): Promise<Board[]> {
		return this.boardsService.getTenBoards({ page });
	}

	/**
	 * GET '/boards/:id' 라우트 핸들러
	 * @param id 게시글 id
	 * @returns 조회한 게시글 정보
	 */
	@Get('/:id')
	getBoardById(
		@Param('id', ParseIntPipe) id: number, //
	): Promise<Board> {
		return this.boardsService.getBoardById({ id });
	}

	/**
	 * PATCH '/boards/:id' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param id 게시글 id
	 * @param updateBoardDTO 게시글 업데이트 DTO: title, contents, hashtags?
	 * @returns 업데이트한 게시글 정보
	 */
	@Patch('/:id')
	@UsePipes(ValidationPipe)
	@UseGuards(restAuthGuard('access'))
	updateBoard(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number,
		@Body() updateBoardDTO: UpdateBoardDTO,
	): Promise<Board> {
		return this.boardsService.updateBoard({ userId: req.user.id, id, updateBoardDTO });
	}

	/**
	 * DELETE '/boards/:id' 라우트 핸들러
	 * @param req HTTP 요청 객체 - req.user: id, exp, role, nickname
	 * @param id 게시글 id
	 */
	@Delete('/:id')
	@UseGuards(restAuthGuard('access'))
	deleteBoard(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number,
	): Promise<void> {
		return this.boardsService.deleteBoard({ userId: req.user.id, id });
	}
}
