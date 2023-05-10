import { Answer } from 'src/apis/answers/entity/answer.entity';
import { Board } from 'src/apis/boards/entity/board.entity';
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.enum';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		type: 'text',
	})
	email: string;

	@Column({
		type: 'text', //
		default: null,
	})
	password?: string;

	@Column({
		type: 'text', //
		default: null,
	})
	nickname?: string;

	@Column({
		type: 'int', //
		default: 0,
	})
	point: number;

	@Column({
		type: 'text', //
		default: null,
	})
	userImg: string;

	@Column({
		type: 'int', //
		default: 0,
	})
	userRanking: number;

	@Column({
		type: 'boolean', //
		default: true,
	})
	state: boolean;

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@CreateDateColumn({
		type: 'timestamp',
		transformer: {
			from: (value: Date) => value,
			to: () => {
				return new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
			},
		},
		select: true,
	})
	createdAt: Date;

	@OneToMany(
		() => Board, //
		(boards) => boards.user,
	)
	boards: Board[];

	@OneToMany(
		() => Answer, //
		(answers) => answers.user,
	)
	answers: Answer[];

	@ManyToMany(
		() => Answer, //
		(likedAnswers) => likedAnswers.likedByUsers,
	)
	likedAnswers: Answer[];
}
