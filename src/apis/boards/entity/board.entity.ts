import { User } from 'src/apis/users/entity/user.entity';
import { Hashtag } from 'src/apis/hashtags/entity/hashtag.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Board {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	contents: string;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(
		() => User, //
		(user) => user.boards,
	)
	user: User;

	@ManyToMany(
		() => Hashtag, //
		(hashtags) => hashtags.boards,
		{ nullable: true },
	)
	@JoinTable()
	hashtags: Hashtag[];
}
