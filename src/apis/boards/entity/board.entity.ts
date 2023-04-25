import { User } from 'src/apis/users/entity/user.entity';
import { Hashtag } from 'src/apis/hashtags/entity/hashtag.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from 'src/apis/answers/entity/answer.entity';

@Entity()
export class Board {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	contents: string;

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
		default: 0,
	})
	views: number;

	@ManyToOne(
		() => User, //
		(user) => user.boards,
	)
	user: User;

	@ManyToMany(
		() => Hashtag, //
		(hashtags) => hashtags.boards,
	)
	@JoinTable({
		name: 'board_hashtags',
	})
	hashtags: Hashtag[];

	@OneToMany(
		() => Answer, //
		(answers) => answers.board,
	)
	answers: Answer[];
}
