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

@ApiTags('boards')
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
	@ApiOperation({
		summary: '게시글 생성 API',
		description: '게시글을 생성함. 유저 정보가 필요하므로 액세스 토큰이 필요함.',
	})
	@ApiCreatedResponse({ description: '게시글이 성공적으로 생성되었음', type: Board })
	@ApiNotFoundResponse({ description: '유저를 찾을 수 없음' })
	@ApiBearerAuth()
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
	@ApiOperation({
		summary: '게시글 검색 API',
		description:
			'키워드로 검색한 모든 게시글을 최신 순서대로 조회함. 페이징 옵션이 적용되어 1페이지에 10개의 게시글을 조회함.',
	})
	@ApiOkResponse({ description: '키워드에 해당하는 게시글이 성공적으로 조회되었음', type: [Board] })
	@ApiQuery({ name: 'keyword', description: '검색 키워드(게시글 제목 또는 유저 닉네임)' })
	@ApiQuery({ name: 'page', description: '페이지' })
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
	@ApiOperation({
		summary: '메인페이지 게시글 조회 API',
		description:
			'메인페이지에서 게시글을 최신 순서대로 조회함. 페이징 옵션이 적용되어 1페이지에 10개의 게시글을 조회함.',
	})
	@ApiOkResponse({ description: '게시글이 성공적으로 조회되었음', type: [Board] })
	@ApiQuery({ name: 'page', description: '페이지' })
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
	@ApiOperation({
		summary: '게시글 디테일페이지 조회 API',
		description: '메인페이지에서 게시글의 디테일페이지를 조회함.',
	})
	@ApiOkResponse({ description: '게시글이 성공적으로 조회되었음', type: Board })
	@ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
	@ApiParam({ name: 'id', description: '게시글 id' })
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
	@ApiOperation({
		summary: '게시글 수정 API',
		description: '게시글(제목, 내용, 해시태그)를 수정함. 유저 정보가 필요하므로 액세스 토큰이 필요함.',
	})
	@ApiOkResponse({ description: '게시글이 성공적으로 업데이트되었음', type: Board })
	@ApiNotFoundResponse({ description: '게시글(또는 유저)을 찾을 수 없습니다.' })
	@ApiParam({ name: 'id', description: '게시글 id' })
	@ApiBearerAuth()
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
	@ApiOperation({
		summary: '게시글 삭제 API',
		description: '게시글을 삭제함. 유저 정보가 필요하므로 액세스 토큰이 필요함.',
	})
	@ApiOkResponse({ description: '게시글이 성공적으로 삭제되었음' })
	@ApiNotFoundResponse({ description: '게시글(또는 유저)을 찾을 수 없습니다.' })
	@ApiParam({ name: 'id', description: '게시글 id' })
	@ApiBearerAuth()
	@Delete('/:id')
	@UseGuards(restAuthGuard('access'))
	deleteBoard(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number,
	): Promise<void> {
		return this.boardsService.deleteBoard({ userId: req.user.id, id });
	}
}
