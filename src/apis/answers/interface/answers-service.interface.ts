import { CreateAnswerDTO } from '../dto/create-answer.dto';
import { UpdateAnswerDTO } from '../dto/update-answer.dto';

export interface IAnswersServiceCreateAnswer {
	userId: string;
	createAnswerDTO: CreateAnswerDTO;
}

export interface IAnswersServiceGetAnswerById {
	id: number;
}

export interface IAnswersServiceGetAnswerByIdAndUserId {
	id: number;
	userId: string;
}

export interface IAnswersServiceUpdateAnswer {
	userId: string;
	id: number;
	updateAnswerDTO: UpdateAnswerDTO;
}

export interface IAnswersServiceDeleteAnswer {
	userId: string;
	id: number;
}
