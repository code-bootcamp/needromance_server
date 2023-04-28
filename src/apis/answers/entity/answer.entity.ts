import { ApiProperty } from '@nestjs/swagger';
import { Board } from 'src/apis/boards/entity/board.entity';
import { User } from 'src/apis/users/entity/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Answer {
	@ApiProperty()
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty()
	@Column()
	contents: string;

	@ApiProperty()
	@Column({
		default: false, // 기본값 - 채택되지 않음
	})
	status: boolean;

	@ApiProperty()
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

	@ApiProperty({ type: () => Board })
	@ManyToOne(
		() => Board, //
		(board) => board.answers,
		{ onDelete: 'CASCADE' },
	)
	board: Board;

	@ApiProperty({ type: () => User })
	@ManyToOne(
		() => User, //
		(user) => user.answers,
	)
	user: User;

	@ManyToMany(
		() => User, //
		(likedByUsers) => likedByUsers.likedAnswers,
	)
	@JoinTable({
		name: 'likedAnswers_user',
	})
	likedByUsers: User[];
}
