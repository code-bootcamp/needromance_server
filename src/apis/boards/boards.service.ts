import { Injectable, NotFoundException } from '@nestjs/common';
import { Board } from './entity/board.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
	IBoardsServiceCreateBoard,
	IBoardsServiceDeleteBoard,
	IBoardsServiceGetBoardById,
	IBoardsServiceGetTenBoards,
	IBoardsServiceUpdateBoard,
} from './interfaces/boards-service.interface';
import { HashtagsService } from '../hashtags/hashtags.service';

@Injectable()
export class BoardsService {
	constructor(
		@InjectRepository(Board)
		private readonly boardsRepository: Repository<Board>, //
		private readonly hashtagsService: HashtagsService, //
	) {}

	/**
	 * 게시글 생성 서비스 로직
	 * @param userId 게시글 생성 유저 id
	 * @param createBoardDTO 게시글 생성 DTO: title, contents, hashtags?
	 * @returns 생성한 게시글 정보
	 */
	async createBoard({ userId, createBoardDTO }: IBoardsServiceCreateBoard): Promise<Board> {
		const { title, contents, hashtags } = createBoardDTO;
		const _hashtags = await this.hashtagsService.createHashtags({ hashtags });
		const board = this.boardsRepository.create({
			title,
			contents,
			hashtags: _hashtags,
			user: {
				id: userId,
			},
		});
		await this.boardsRepository.save(board);
		return board;
	}

	/**
	 * 메인페이지 게시글 조회 서비스 로직
	 * @param page 메인페이지의 게시글 페이지
	 * @returns 조회한 게시글 10개
	 */
	async getTenBoards({ page }: IBoardsServiceGetTenBoards): Promise<Board[]> {
		const queryBuilder = this.boardsRepository.createQueryBuilder('board');
		const boards = await queryBuilder
			.leftJoinAndSelect('board.user', 'user')
			.leftJoinAndSelect('board.hashtags', 'hashtags')
			.leftJoinAndSelect('board.answers', 'answer')
			.orderBy({ 'board.createdAt': 'DESC' })
			.skip(10 * (page - 1))
			.take(10)
			.getMany();
		return boards;
	}

	/**
	 * (게시글 id 사용) 단일 게시글 조회 서비스 로직. 게시글을 찾지 못하면 NotFoundException 던짐.
	 * @param id 게시글 id
	 * @returns id에 해당하는 게시글
	 */
	async getBoardById({ id }: IBoardsServiceGetBoardById): Promise<Board> {
		const queryBuilder = this.boardsRepository.createQueryBuilder('board');
		const board = await queryBuilder
			.leftJoinAndSelect('board.hashtags', 'hashtag')
			.where('board.id = :id', { id })
			.getOne();

		if (!board) {
			throw new NotFoundException('게시글을 찾을 수 없습니다.');
		}

		return board;
	}

	/**
	 * 게시글 업데이트 서비스 로직.
	 * @param id 게시글 id
	 * @param updateBoardDTO 게시글 업데이트 DTO: title?, contents?, hashtags?
	 * @returns 업데이트한 게시글 정보
	 */
	async updateBoard({ id, updateBoardDTO }: IBoardsServiceUpdateBoard): Promise<Board> {
		const board = await this.getBoardById({ id });
		const { title, contents, hashtags } = updateBoardDTO;
		board.title = title;
		board.contents = contents;
		board.hashtags = await this.hashtagsService.createHashtags({ hashtags });
		await this.boardsRepository.save(board);

		return board;
	}

	/**
	 * 게시글 삭제 서비스 로직. 게시글을 삭제하지 못하면 NotFoundException 던짐.
	 * @param id 게시글 id
	 */
	async deleteBoard({ id }: IBoardsServiceDeleteBoard): Promise<void> {
		const deleteResult = await this.boardsRepository.delete({ id });

		if (!deleteResult.affected) {
			throw new NotFoundException('게시글을 찾을 수 없습니다.');
		}
	}
}
