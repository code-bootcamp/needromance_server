import { User } from 'src/apis/users/entity/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

	@ManyToOne(() => User, (user) => user.boards)
	user: User;
}
