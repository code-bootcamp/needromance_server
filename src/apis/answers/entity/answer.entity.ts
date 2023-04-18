import { Board } from 'src/apis/boards/entity/board.entity';
import { User } from 'src/apis/users/entity/user.entity';
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Answer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	contents: string;

	@Column({
		default: false, // 기본값 - 채택되지 않음
	})
	status: boolean;

	@CreateDateColumn({
		type: 'timestamp',
		transformer: {
			from: (value: Date) => value,
			to: () => {
				return new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
			},
		},
	})
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

	@ManyToMany(
		() => User, //
		(likedByUsers) => likedByUsers.likedAnswers,
	)
	likedByUsers: User[];
}
