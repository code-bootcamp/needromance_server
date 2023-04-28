import { Answer } from 'src/apis/answers/entity/answer.entity';
import { Board } from 'src/apis/boards/entity/board.entity';
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'text' })
	email: string;

	@Column({ type: 'text', select: false })
	password?: string;

	@Column({ type: 'text' })
	nickname: string;

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
		type: 'tinyint', //
		default: 0,
	})
	userRanking: number;

	//가입시의 한국시간을 넣어줘야한다.
	//작은 부분이지만 기록해두자.
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

	@Column({
		type: 'boolean', //
		default: true,
	})
	state: boolean;

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
