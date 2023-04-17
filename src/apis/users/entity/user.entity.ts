import { Board } from 'src/apis/boards/entity/board.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@Column()
	nickname: string;

	@Column({ default: 0 })
	point: number;

	@Column({ default: null })
	userImg: string;

	@Column({ default: 0 })
	userRanking: string;

	@Column()
	createdAt: Date;

	@Column()
	state: boolean;

	@OneToMany(() => Board, (boards) => boards.user)
	boards: Board[];
}
