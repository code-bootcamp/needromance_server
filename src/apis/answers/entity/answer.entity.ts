import { Board } from 'src/apis/boards/entity/board.entity';
import { User } from 'src/apis/users/entity/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Answer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	contents: string;

	@Column()
	status: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(
		() => Board, //
		(board) => board.answers,
	)
	board: Board;

	@ManyToOne(
		() => User, //
		(user) => user.answers,
	)
	user: User;
}
