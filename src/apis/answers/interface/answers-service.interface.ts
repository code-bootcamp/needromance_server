import { CreateAnswerDTO } from '../dto/create-answer.dto';
import { UpdateAnswerDTO } from '../dto/update-answer.dto';

export interface IAnswersServiceCreateAnswer {
	createAnswerDTO: CreateAnswerDTO;
}

export interface IAnswersServiceGetAnswerById {
	id: number;
}

export interface IAnswersServiceUpdateAnswer {
	id: number;
	updateAnswerDTO: UpdateAnswerDTO;
}

export interface IAnswersServiceDeleteAnswer {
	id: number;
}
