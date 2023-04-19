import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDTO } from './dto/create-board.dto';
import { UpdateBoardDTO } from './dto/update-board.dto';
import { Board } from './entity/board.entity';

@Controller('boards')
export class BoardsController {
	constructor(
		private readonly boardsService: BoardsService, //
	) {}

	/**
	 * POST '/boards' 라우트 핸들러
	 * @param createBoardDTO 게시글 생성 DTO: title, contents, hashtags?
	 * @returns 생성한 게시글 정보
	 */
	@Post()
	createBoard(
		@Body() createBoardDTO: CreateBoardDTO, //
	): Promise<Board> {
		return this.boardsService.createBoard({ createBoardDTO });
	}

	/**
	 * GET '/boards?page=:page' 라우트 핸들러
	 * @param page 메인페이지의 게시글 페이지
	 * @returns 조회한 게시글 10개
	 */
	@Get()
	findAll(
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
	findOne(
		@Param('id', ParseIntPipe) id: number, //
	): Promise<Board> {
		return this.boardsService.getBoardById({ id });
	}

	/**
	 * PATCH '/boards/:id' 라우트 핸들러
	 * @param id 게시글 id
	 * @param updateBoardDTO 게시글 업데이트 DTO: title, contents, hashtags?
	 * @returns 업데이트한 게시글 정보
	 */
	@Patch('/:id')
	updateBoard(
		@Param('id', ParseIntPipe) id: number, //
		@Body() updateBoardDTO: UpdateBoardDTO, //
	): Promise<Board> {
		return this.boardsService.updateBoard({ id, updateBoardDTO });
	}

	/**
	 * DELETE '/boards/:id' 라우트 핸들러
	 * @param id 게시글 id
	 */
	@Delete('/:id')
	deleteBoard(
		@Param('id', ParseIntPipe) id: number, //
	): Promise<void> {
		return this.boardsService.deleteBoard({ id });
	}
}
