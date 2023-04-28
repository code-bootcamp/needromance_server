import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Board } from './entity/board.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
	IBoardsServiceCreateBoard,
	IBoardsServiceDeleteBoard,
	IBoardsServiceDeleteBoardsByUserId,
	IBoardsServiceGetBoardById,
	IBoardsServiceGetBoardByIdAndUserId,
	IBoardsServiceGetBoardsByUserId,
	IBoardsServiceGetTenBoards,
	IBoardsServiceSearchBoards,
	IBoardsServiceUpdateBoard,
} from './interfaces/boards-service.interface';
import { HashtagsService } from '../hashtags/hashtags.service';
import { UsersService } from '../users/users.service';
import { AnswersService } from '../answers/answers.service';

@Injectable()
export class BoardsService {
	constructor(
		@InjectRepository(Board)
		private readonly boardsRepository: Repository<Board>, //
		private readonly hashtagsService: HashtagsService, //
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService, //
		@Inject(forwardRef(() => AnswersService))
		private readonly answersService: AnswersService, //
	) {}

	/**
	 * 게시글 생성 서비스 로직
	 * @param userId 게시글 생성 유저 id
	 * @param createBoardDTO 게시글 생성 DTO: title, contents, hashtags?
	 * @returns 생성한 게시글 정보
	 */
	async createBoard({ userId: id, createBoardDTO }: IBoardsServiceCreateBoard): Promise<Board> {
		const user = await this.usersService.getOneUserById({ id });
		const { title, contents, hashtags } = createBoardDTO;
		const _hashtags = await this.hashtagsService.createHashtags({ hashtags });
		const board = this.boardsRepository.create({
			title,
			contents,
			hashtags: _hashtags,
			user,
		});
		await this.boardsRepository.save(board);
		return board;
	}

	/**
	 * (게시글 제목 기준) 메인페이지 게시글 검색 서비스 로직.
	 * @param keyword 검색 키워드
	 * @param page 메인페이지의 게시글 페이지
	 * @returns 검색 키워드로 조회한 게시글 10개
	 */
	async searchBoards({ keyword, page }: IBoardsServiceSearchBoards): Promise<Board[]> {
		const queryBuilder = this.boardsRepository.createQueryBuilder('board');
		const boards = await queryBuilder //
			.leftJoinAndSelect('board.user', 'user')
			.leftJoinAndSelect('board.hashtags', 'hashtags')
			.leftJoinAndSelect('board.answers', 'answer')
			.orderBy({ 'board.createdAt': 'DESC' })
			.skip(10 * (page - 1))
			.take(10)
			.where('user.nickname LIKE :nickname', { nickname: `%${keyword}%` })
			.orWhere('title LIKE :keyword', { keyword: `%${keyword}%` })
			.getMany();

		return boards;
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
			.where('board.id = :id', { id })
			.leftJoinAndSelect('board.user', 'user')
			.leftJoinAndSelect('board.hashtags', 'hashtag')
			.leftJoinAndSelect('board.answers', 'answer')
			.getOne();

		if (!board) {
			throw new NotFoundException('게시글을 찾을 수 없습니다.');
		}

		board.views++;
		queryBuilder //
			.update()
			.set({ views: board.views })
			.where('id = :id', { id: board.id })
			.execute();

		return board;
	}

	/**
	 * (게시글 id과 유저 id 사용) 단일 게시글 조회 서비스 로직. 게시글을 찾지 못하면 NotFoundException 던짐.
	 * @param id 게시글 id
	 * @param userId 유저 id
	 * @returns 게시글 id와 유저 id에 해당하는 게시글
	 */
	async getBoardByIdAndUserId({ id, userId }: IBoardsServiceGetBoardByIdAndUserId): Promise<Board> {
		const queryBuilder = this.boardsRepository.createQueryBuilder('board');
		const board = await queryBuilder
			.where('board.id = :id', { id })
			.andWhere('board.user.id = :userId', { userId })
			.getOne();

		if (!board) {
			throw new NotFoundException('게시글을 찾을 수 없습니다.');
		}

		return board;
	}

	/**
	 *admin에서 사용될 단일 로직, 모든 게시글을 조회한다.
	 * @param null 입력값 없음
	 * @returns 모든 게시글
	 */
	async getBoards(): Promise<Board[]> {
		const queryBuilder = this.boardsRepository.createQueryBuilder('board');
		const boards = await queryBuilder //
			.leftJoinAndSelect('board.user', 'user')
			.select('user.nickname')
			.addSelect('user.id')
			.addSelect('board.title')
			.addSelect('board.createdAt')
			.getMany();

		console.log(boards);
		console.log('###');
		if (!boards) {
			throw new NotFoundException('게시글을 찾을 수 없습니다.');
		}

		return boards;
	}

	/**
	 * 게시글 업데이트 서비스 로직.
	 * @param userId 유저 id
	 * @param id 게시글 id
	 * @param updateBoardDTO 게시글 업데이트 DTO: title, contents, hashtags?
	 * @returns 업데이트한 게시글 정보
	 */
	async updateBoard({ userId, id, updateBoardDTO }: IBoardsServiceUpdateBoard): Promise<Board> {
		await this.usersService.getOneUserById({ id: userId });

		const board = await this.getBoardByIdAndUserId({ id, userId });
		const { title, contents, hashtags } = updateBoardDTO;
		board.title = title;
		board.contents = contents;
		board.hashtags = await this.hashtagsService.createHashtags({ hashtags });
		await this.boardsRepository.save(board);

		return board;
	}

	/**
	 * 게시글 삭제 서비스 로직. 게시글을 삭제하지 못하면 NotFoundException 던짐.
	 * @param userId 유저 id
	 * @param id 게시글 id
	 */
	async deleteBoard({ userId, id }: IBoardsServiceDeleteBoard): Promise<void> {
		const user = await this.usersService.getOneUserById({ id: userId });
		await this.getBoardByIdAndUserId({ id, userId });

		// 게시글 삭제 전, 게시글의 모든 답변 삭제
		await this.answersService.deleteAnswersByBoardId({ boardId: id });

		const deleteResult = await this.boardsRepository.delete({
			id,
			user,
		});

		if (!deleteResult.affected) {
			throw new NotFoundException('게시글을 찾을 수 없습니다.');
		}
	}

	/**
	 * (유저 id 사용) 유저의 모든 게시글 삭제 서비스 로직.
	 * @param userId 유저 id
	 */
	async deleteBoardsByUserId({ userId }: IBoardsServiceDeleteBoardsByUserId): Promise<void> {
		const user = await this.usersService.getOneUserById({ id: userId });
		await this.boardsRepository.delete({ user });
	}

	/**
	 * (유저 id 사용) 유저의 모든 게시글 조회 서비스 로직.
	 * @param userId 유저 id
	 * @returns 유저 id에 해당하는 모든 게시글
	 */
	async getBoardsByUserId({ userId }: IBoardsServiceGetBoardsByUserId): Promise<Board[]> {
		const queryBuilder = this.boardsRepository.createQueryBuilder('board');
		const boards = await queryBuilder.where('board.user.id = :userId', { userId }).getMany();

		return boards;
	}
}
