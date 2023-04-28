import { ApiProperty } from '@nestjs/swagger';
import { Board } from 'src/apis/boards/entity/board.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hashtag {
	@ApiProperty()
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty()
	@Column()
	tag: string;

	@ManyToMany(
		() => Board, //
		(boards) => boards.hashtags,
		{ onDelete: 'CASCADE' },
	)
	boards: Board[];
}
