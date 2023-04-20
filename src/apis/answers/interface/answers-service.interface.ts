import { CreateAnswerDTO } from '../dto/create-answer.dto';
import { UpdateAnswerLikesDTO } from '../dto/update-answer-likes.dto';
import { UpdateAnswerStatusDTO } from '../dto/update-answer-status.dto';
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

export interface IAnswersServiceUpdateAnswerStatus {
	userId: string;
	id: number;
	updateAnswerStatusDTO: UpdateAnswerStatusDTO;
}

export interface IAnswersServiceGetAnswersByBoardId {
	boardId: number;
	status: number;
}

export interface IAnswersServiceGetOneAnswerJoinUser {
	id: number;
	userId: string;
}

export interface IAnswersServiceUpdateAnswerLikes {
	userId: string;
	id: number;
	updateAnswerLikesDTO: UpdateAnswerLikesDTO;
}
