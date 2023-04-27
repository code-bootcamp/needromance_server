import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Admin } from './entity/admin.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { IAdminServiceFetchBoards, IAdminServiceSearchUsers } from './interface/admin-services.interface';
import { User } from '../users/entity/user.entity';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entity/board.entity';
@Injectable()
export class AdminService {
	constructor(
		private readonly dataSource: DataSource, //
		private readonly usersService: UsersService,
		private readonly boardsService: BoardsService,
	) {}

	async signup(): Promise<string> {
		const email = process.env.ADMIN_EMAIL;
		const password = process.env.ADMIN_PASSWORD;
		const hashPassword = await bcrypt.hash(password, 10);
		return this.dataSource
			.createQueryBuilder()
			.insert()
			.into(Admin)
			.values({ email: email as string, password: hashPassword, nickname: 'admin' })
			.execute()
			.then(() => {
				return '회원 가입 성공';
			})
			.catch((err) => {
				throw new UnprocessableEntityException('회원가입 실패');
			});
	}

	async fetchUsers({ req }: IAdminServiceFetchBoards): Promise<User[]> {
		if (req.user.role === 'admin') {
			return this.usersService.fetchUsers();
		} else {
			throw new UnauthorizedException('권한이 없습니다.');
		}
	}

	async fetchBoards({ req }): Promise<Board[]> {
		if (req.user.role === 'admin') {
			return this.boardsService.getBoards();
		} else {
			throw new UnauthorizedException('권한이 없습니다.');
		}
	}

	async searchUser({ req }: IAdminServiceSearchUsers): Promise<User[]> {
		if (req.user.role === 'admin') {
			return this.usersService.searchUserByKeyword({ keyword: req.query.keyword as string });
		}
	}
}
