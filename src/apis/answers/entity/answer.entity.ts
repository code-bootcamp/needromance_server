import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Answer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	contents: string;

	@Column()
	status: boolean;

	@CreateDateColumn()
	createdAt: Date;
}
