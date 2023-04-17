import { Hashtag } from 'src/apis/hashtags/entity/hashtag.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

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

	@ManyToMany(
		() => Hashtag, //
		(hashtags) => hashtags.boards,
		{ nullable: true },
	)
	@JoinTable()
	hashtags: Hashtag[];
}
