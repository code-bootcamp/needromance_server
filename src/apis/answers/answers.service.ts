import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Repository } from 'typeorm';
import {
	IAnswersServiceCreateAnswer,
	IAnswersServiceDeleteAnswer,
	IAnswersServiceGetAnswerById,
	IAnswersServiceGetAnswerByIdAndUserId,
	IAnswersServiceUpdateAnswer,
	IAnswersServiceUpdateAnswerStatus,
} from './interface/answers-service.interface';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';

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

	async updateAnswerStatus({ userId, id, updateAnswerStatusDTO }: IAnswersServiceUpdateAnswerStatus): Promise<Answer> {
		console.log(updateAnswerStatusDTO.boardId, typeof updateAnswerStatusDTO.boardId);
		console.log(updateAnswerStatusDTO.status, typeof updateAnswerStatusDTO.status);
		console.log(userId);

		// 유저가 작성한 게시글인지 확인하기
		// 답변 id로 답변 조회하기(유저 조인 필요)
		// 조회한 답변 status 칼럼 true로 변경하기
		// 답변을 작성한 유저의 포인트 10 증가시키기

		const answer = await this.getAnswerById({ id });
		answer.status = updateAnswerStatusDTO.status;
		await this.answersRepository.save(answer);

		return answer;
	}
}
