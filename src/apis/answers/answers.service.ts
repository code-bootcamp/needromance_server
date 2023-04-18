import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Repository } from 'typeorm';
import { IAnswersServiceCreateAnswer } from './interface/answers-service.interface';

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
}
