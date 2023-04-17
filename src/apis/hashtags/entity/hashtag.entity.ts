import { Board } from 'src/apis/boards/entity/board.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hashtag {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	tag: string;

	@ManyToMany(
		() => Board, //
		(boards) => boards.hashtags,
	)
	boards: Board[];
}
