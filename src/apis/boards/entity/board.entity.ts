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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Board {
	@ApiProperty()
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty()
	@Column()
	title: string;

	@ApiProperty()
	@Column()
	contents: string;

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

	@ApiProperty()
	@Column({
		default: 0,
	})
	views: number;

	@ApiProperty()
	@ManyToOne(
		() => User, //
		(user) => user.boards,
	)
	user: User;

	@ApiProperty()
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
