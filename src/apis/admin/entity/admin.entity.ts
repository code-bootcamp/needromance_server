import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'text' })
	email: string;

	@Column({ type: 'text', select: false })
	password: string;

	@Column({ type: 'text' })
	nickname: string;
}
