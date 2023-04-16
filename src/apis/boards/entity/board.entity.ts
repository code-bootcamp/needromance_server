import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
