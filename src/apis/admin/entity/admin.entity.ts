import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'text' })
	email: string;

	@Column({ type: 'text', select: false })
	password: string;

	@Column({ type: 'text' })
	nickname: string;
}
