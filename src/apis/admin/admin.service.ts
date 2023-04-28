import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Admin } from './entity/admin.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import {
	IAdminServiceFetchBoards,
	IAdminServiceManagesStatus,
	IAdminServiceSearchBoards,
	IAdminServiceSearchUsers,
} from './interface/admin-services.interface';
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
		} else {
			throw new UnauthorizedException('관리자가 아닙니다.');
		}
	}

	async mangeStatus({ req }: IAdminServiceManagesStatus): Promise<User> {
		if (req.user.role === 'admin') {
			return this.usersService.mangeStatus({ id: req.body.id });
		} else {
			throw new UnauthorizedException('관리자가 아닙니다.');
		}
	}

	async searchBoards({ req }: IAdminServiceSearchBoards): Promise<Board[]> {
		if (req.user.role === 'admin') {
			const { page: get } = req.query;
			const page = Number(get);
			return await this.boardsService.searchBoards({ keyword: req.query.keyword as string, page });
		} else {
			throw new UnauthorizedException('관리자가 아닙니다.');
		}
	}
}
