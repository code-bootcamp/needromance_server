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

	async getAnswerById({ id }: IAnswersServiceGetAnswerById): Promise<Answer> {
		const queryBuilder = this.answersRepository.createQueryBuilder('answer');
		const answer = await queryBuilder.where('id = :id', { id }).getOne();

		if (!answer) {
			throw new NotFoundException('댓글을 찾을 수 없습니다.');
		}

		return answer;
	}

	async updateAnswer({ id, updateAnswerDTO }: IAnswersServiceUpdateAnswer): Promise<Answer> {
		const answer = await this.getAnswerById({ id });
		answer.contents = updateAnswerDTO.contents;
		await this.answersRepository.save(answer);

		return answer;
	}
}
