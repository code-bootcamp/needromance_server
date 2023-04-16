import { CreateBoardDTO } from '../dto/create-board.dto';
import { UpdateBoardDTO } from '../dto/update-board.dto';

export interface IBoardsServiceCreateBoard {
	createBoardDTO: CreateBoardDTO;
}

export interface IBoardsServiceGetTenBoards {
	page: number;
}

export interface IBoardsServiceGetBoardById {
	id: number;
}

export interface IBoardsServiceUpdateBoard {
	id: number;
	updateBoardDTO: UpdateBoardDTO;
}

export interface IBoardsServiceDeleteBoard {
	id: number;
}
