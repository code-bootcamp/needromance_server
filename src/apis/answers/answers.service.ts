import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Repository } from 'typeorm';
import {
	IAnswersServiceCreateAnswer,
	IAnswersServiceDeleteAnswer,
	IAnswersServiceGetAnswerById,
	IAnswersServiceGetAnswerByIdAndUserId,
	IAnswersServiceGetAnswersByBoardId,
	IAnswersServiceGetOneAnswerJoinUser,
	IAnswersServiceUpdateAnswer,
	IAnswersServiceUpdateAnswerLikes,
	IAnswersServiceUpdateAnswerStatus,
} from './interface/answers-service.interface';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';
import { User } from '../users/entity/user.entity';

@Injectable()
export class AnswersService {
	constructor(
		@InjectRepository(Answer)
		private readonly answersRepository: Repository<Answer>, //
		private readonly usersService: UsersService,
		private readonly boardsService: BoardsService,
	) {}

	/**
	 * 답변 생성 서비스 로직. 유저를 찾지 못하면 NotFoundException 던짐.
	 * @param userId 유저 id
	 * @param createAnswerDTO 답변 생성 DTO - contents, boardId
	 * @returns 생성한 답변 정보
	 */
	async createAnswer({ userId: id, createAnswerDTO }: IAnswersServiceCreateAnswer): Promise<Answer> {
		const user = await this.usersService.getOneUserById({ id });
		const { contents, boardId } = createAnswerDTO;
		const answer = this.answersRepository.create({
			contents,
			user,
			board: {
				id: boardId,
			},
		});
		await this.answersRepository.save(answer);

		return answer;
	}

	/**
	 * 단일 답변 조회 서비스 로직. 답변을 찾지 못하면 NotFoundException 던짐.
	 * @param id 답변 id
	 * @returns id에 해당하는 답변
	 */
	async getAnswerById({ id }: IAnswersServiceGetAnswerById): Promise<Answer> {
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await queryBuilder.where('id = :id', { id }).getOne();

		if (!answer) {
			throw new NotFoundException('답변을 찾을 수 없습니다.');
		}

		return answer;
	}

	/**
	 * (답변id와 유저 id 사용) 단일 답변 조회 서비스 로직. 답변을 찾지 못하면 NotFoundException 던짐.
	 * @param id 답변 id
	 * @param userId 유저 id
	 * @returns 답변 id와 유저 id로 조회한 답변 정보
	 */
	async getAnswerByIdAndUserId({ id, userId }: IAnswersServiceGetAnswerByIdAndUserId): Promise<Answer> {
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await queryBuilder
			.where('id = :id', { id })
			.andWhere('answer.user.id = :userId', { userId })
			.getOne();

		if (!answer) {
			throw new NotFoundException('답변을 찾을 수 없습니다.');
		}

		return answer;
	}

	/**
	 * 답변 업데이트 서비스 로직.
	 * @param userId 유저 id
	 * @param id 답변 id
	 * @param updateAnswerDTO 답변 업데이트 DTO: contents
	 * @returns 업데이트한 답변 정보
	 */
	async updateAnswer({ userId, id, updateAnswerDTO }: IAnswersServiceUpdateAnswer): Promise<Answer> {
		await this.usersService.getOneUserById({ id: userId });
		const answer = await this.getAnswerByIdAndUserId({ id, userId });
		answer.contents = updateAnswerDTO.contents;
		await this.answersRepository.save(answer);

		return answer;
	}

	/**
	 * 답변 삭제 서비스 로직. 답변을 삭제하지 못하면 NotFoundException 던짐.
	 * @param userId 유저 id
	 * @param id 답변 id
	 */
	async deleteAnswer({ userId, id }: IAnswersServiceDeleteAnswer): Promise<void> {
		await this.usersService.getOneUserById({ id: userId });
		await this.getAnswerByIdAndUserId({ id, userId });
		const deleteResult = await this.answersRepository.delete({
			id,
			user: {
				id: userId,
			},
		});

		if (!deleteResult.affected) {
			throw new NotFoundException('답변을 찾을 수 없습니다.');
		}
	}

	/**
	 * 답변 채택 서비스 로직.
	 * 게시글 작성자가 답변을 채택하면 답변 작성자의 포인트를 10 증가시킴.
	 * 게시글 작성자가 답변 채택을 취소하면 답변 작성자의 포인트를 10 감소시킴.
	 * @param userId 유저 id
	 * @param id 답변 id
	 * @param updateAnswerStatusDTO 답변 상태 업데이트 DTO: boardId, status
	 * @returns 업데이트한 답변 정보
	 */
	async updateAnswerStatus({ userId, id, updateAnswerStatusDTO }: IAnswersServiceUpdateAnswerStatus): Promise<Answer> {
		// 유저가 작성한 게시글인지 확인하기
		await this.boardsService.getBoardByIdAndUserId({ id: updateAnswerStatusDTO.boardId, userId });

		// 답변 id로 답변 조회하기(유저 조인 필요)
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await queryBuilder
			.where('answer.id = :id', { id })
			.leftJoinAndSelect('answer.user', 'user')
			.getOne();

		// 조회한 답변 status 칼럼 업데이트하기
		const { status } = updateAnswerStatusDTO;
		answer.status = status;

		// 답변이 채택되었다면 답변을 작성한 유저의 포인트 10 증가시키기(유저서비스 사용)
		// 답변 채택을 취소했다면 답변을 작성한 유저의 포인트 10 감소시키기(유저서비스 사용)
		this.usersService.updateUserPoint({ id: answer.user.id, status });

		await this.answersRepository.save(answer);

		return answer;
	}

	/**
	 * (게시글 id 사용) 답변 조회 서비스 로직.
	 * @param boardId 게시글 id
	 * @param status 채택 여부 - 1: 채택됨 / 0: 채택되지 않음
	 * @returns 게시글 id로 조회한 채택되지 않은 답변 정보(유저 조인)
	 */
	async getAnswersByBoardId({ boardId, status }: IAnswersServiceGetAnswersByBoardId): Promise<Answer[]> {
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answers = await queryBuilder
			.where('answer.board.id = :boardId', { boardId })
			.andWhere('answer.status = :status', { status })
			.leftJoinAndSelect('answer.user', 'user')
			.getMany();

		return answers;
	}

	async updateAnswerLikes({ userId, id, updateAnswerLikesDTO }: IAnswersServiceUpdateAnswerLikes): Promise<string> {
		// 두 번 이상 좋아요를 누를 수 없게 하기
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await queryBuilder
			.where('answer.id = :id', { id })
			.leftJoinAndSelect('answer.likedByUsers', 'likedByUsers')
			.getOne();

		if (updateAnswerLikesDTO.likes) {
			const index = answer.likedByUsers.findIndex((likedUser: User) => {
				return likedUser.id === userId;
			});

			if (index !== -1) {
				throw new UnprocessableEntityException('두 번 이상 좋아요를 누를 수 없습니다.');
			}
		}

		// 처음으로 좋아요를 누르는 경우 좋아요 저장하기
		const user = await this.usersService.getOneUserById({ id: userId });
		if (updateAnswerLikesDTO.likes) {
			answer.likedByUsers.push(user);
		} else {
			const index = answer.likedByUsers.findIndex((likedUser: User) => {
				return likedUser.id === userId;
			});

			if (index !== -1) {
				answer.likedByUsers.splice(index, 1);
			}
		}
		await this.answersRepository.save(answer);

		return 'updateAnswerLikes';
	}
}
