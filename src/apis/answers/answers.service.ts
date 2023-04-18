import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Repository } from 'typeorm';
import {
	IAnswersServiceCreateAnswer,
	IAnswersServiceGetAnswerById,
	IAnswersServiceUpdateAnswer,
} from './interface/answers-service.interface';

@Injectable()
export class AnswersService {
	constructor(
		@InjectRepository(Answer)
		private readonly answersRepository: Repository<Answer>, //
	) {}

	/**
	 * 답변 생성 서비스 로직
	 * @param createAnswerDTO 답변 생성 DTO - contents, userId, boardId
	 * @returns 생성한 답변 정보
	 */
	async createAnswer({ createAnswerDTO }: IAnswersServiceCreateAnswer): Promise<Answer> {
		const { contents, userId, boardId } = createAnswerDTO;
		const answer = this.answersRepository.create({
			contents,
			user: {
				id: userId,
			},
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
			throw new NotFoundException('댓글을 찾을 수 없습니다.');
		}

		return answer;
	}

	/**
	 * 답변 업데이트 서비스 로직.
	 * @param id 답변 id
	 * @param updateAnswerDTO 답변 업데이트 DTO: contents
	 * @returns 업데이트한 답변 정보
	 */
	async updateAnswer({ id, updateAnswerDTO }: IAnswersServiceUpdateAnswer): Promise<Answer> {
		const answer = await this.getAnswerById({ id });
		answer.contents = updateAnswerDTO.contents;
		await this.answersRepository.save(answer);

		return answer;
	}
}
