import { Board } from 'src/apis/boards/entity/board.entity';

export class BoardsCountsDTO {
	boards: Board[];
	counts: number;
}
