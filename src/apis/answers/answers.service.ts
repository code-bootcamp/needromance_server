import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Repository } from 'typeorm';
import {
	IAnswersServiceCheckUserLikedAnswer,
	IAnswersServiceCreateAnswer,
	IAnswersServiceDeleteAnswer,
	IAnswersServiceDeleteAnswersByBoardId,
	IAnswersServiceDeleteAnswersByUserId,
	IAnswersServiceGetAnswerById,
	IAnswersServiceGetAnswerByIdAndUserId,
	IAnswersServiceGetAnswersByBoardId,
	IAnswersServiceUpdateAnswer,
	IAnswersServiceUpdateAnswerLikes,
	IAnswersServiceUpdateAnswerStatus,
} from './interface/answers-service.interface';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';
import { User } from '../users/entity/user.entity';
import { GetBestAnswers } from './dto/get-best-answers.dto';

@Injectable()
export class AnswersService {
	constructor(
		@InjectRepository(Answer)
		private readonly answersRepository: Repository<Answer>, //
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
		@Inject(forwardRef(() => BoardsService))
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
		const relationQueryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await relationQueryBuilder.where('id = :id', { id }).getOne();

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
		const relationQueryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await relationQueryBuilder
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
		const user = await this.usersService.getOneUserById({ id: userId });
		await this.getAnswerByIdAndUserId({ id, userId });

		const deleteResult = await this.answersRepository.delete({
			id,
			user,
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
		const relationQueryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await relationQueryBuilder
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
		const relationQueryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answers = await relationQueryBuilder
			.where('answer.board.id = :boardId', { boardId })
			.andWhere('answer.status = :status', { status })
			.leftJoinAndSelect('answer.user', 'user')
			.getMany();

		return answers;
	}

	/**
	 * 좋아요를 누른 유저 배열에 유저가 존재하는지 확인하는 서비스 로직.
	 * @param likedByUsers 답변에 좋아요를 누른 유저 배열
	 * @param userId 유저 id
	 * @returns 답변에 좋아요를 누른 유저 배열에 유저가 존재한다면 true 반환. 존재하지 않는다면 false 반환.
	 */
	checkUserLikedAnswer({ likedByUsers, userId }: IAnswersServiceCheckUserLikedAnswer): boolean {
		return likedByUsers.findIndex((likedUser: User) => likedUser.id === userId) !== -1;
	}

	/**
	 * 답변 좋아요 서비스 로직.
	 * @param userId 유저 id
	 * @param id 답변 id
	 * @returns 답변의 좋아요 개수
	 */
	async updateAnswerLikes({ userId, id }: IAnswersServiceUpdateAnswerLikes): Promise<number> {
		const relationQueryBuilder = this.answersRepository //
			.createQueryBuilder('answer')
			.relation(Answer, 'likedByUsers')
			.of(id);
		const likedByUsers: User[] = await relationQueryBuilder.loadMany();
		const userLikedAnswer = this.checkUserLikedAnswer({ likedByUsers, userId });

		if (userLikedAnswer) {
			// 이미 좋아요를 누른 경우 좋아요에서 유저 제거
			await relationQueryBuilder.remove(userId);
		} else {
			// 좋아요를 누르지 않은 경우 좋아요에 유저 추가
			await relationQueryBuilder.add(userId);
		}

		const likes = (await relationQueryBuilder.loadMany()).length;
		return likes;
	}

	/**
	 * 좋아요 수 내림차순으로 조회한 첫 번째 3개의 답변을 사용하여 GetBestAnswers 배열을 생성하여 리턴.
	 * @returns GetBestAnswers 배열 - GetBestAnswers: userImg, nickname, contents, likes
	 */
	async getBestAnswers(): Promise<GetBestAnswers[]> {
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const topThreeAnswers = await queryBuilder //
			.leftJoinAndSelect('answer.user', 'user')
			.leftJoinAndSelect('answer.likedByUsers', 'likedByUsers')
			.orderBy('answer.id', 'DESC')
			.take(3)
			.getMany();

		const bestAnswers: GetBestAnswers[] = topThreeAnswers.map((bestAnswer: Answer) => {
			return new GetBestAnswers(
				bestAnswer.user.userImg,
				bestAnswer.user.nickname,
				bestAnswer.contents,
				bestAnswer.likedByUsers.length,
			);
		});

		return bestAnswers;
	}

	/**
	 * (게시글 id 사용) 게시글의 모든 답변 삭제 서비스 로직.
	 * @param boardId 게시글 id
	 */
	async deleteAnswersByBoardId({ boardId }: IAnswersServiceDeleteAnswersByBoardId): Promise<void> {
		await this.answersRepository.delete({
			board: {
				id: boardId,
			},
		});
	}

	/**
	 * (유저 id 사용) 유저의 모든 답변 삭제 서비스 로직.
	 * @param userId 유저 id
	 */
	async deleteAnswersByUserId({ userId }: IAnswersServiceDeleteAnswersByUserId): Promise<void> {
		const user = await this.usersService.getOneUserById({ id: userId });
		await this.answersRepository.delete({ user });
	}
}
