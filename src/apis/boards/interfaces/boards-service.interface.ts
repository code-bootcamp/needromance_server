import { CreateBoardDTO } from '../dto/create-board.dto';
import { UpdateBoardDTO } from '../dto/update-board.dto';

export interface IBoardsServiceCreateBoard {
	userId: string;
	createBoardDTO: CreateBoardDTO;
}

export interface IBoardsServiceSearchBoards {
	keyword: string;
}
export interface IBoardsServiceSearchBoardsForAdmin {
	keyword: string;
}

export interface IBoardsServiceGetTenBoards {
	page: number;
}

export interface IBoardsServiceGetBoardById {
	id: number;
}

export interface IBoardsServiceGetBoardByIdAndUserId {
	id: number;
	userId: string;
}

export interface IBoardsServiceUpdateBoard {
	userId: string;
	id: number;
	updateBoardDTO: UpdateBoardDTO;
}

export interface IBoardsServiceDeleteBoard {
	userId: string;
	id: number;
}

export interface IBoardsServiceDeleteBoardsByUserId {
	userId: string;
}

export interface IBoardsServiceGetBoardsByUserId {
	userId: string;
}

export interface IBoardsServiceGetBoardsWithPage {
	page: number;
}
