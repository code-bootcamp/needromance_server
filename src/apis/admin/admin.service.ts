import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Admin } from './entity/admin.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import {
	IAdminServiceDeleteBoards,
	IAdminServiceFetchAdmin,
	IAdminServiceFetchBoards,
	IAdminServiceManagesStatus,
	IAdminServiceSearchBoards,
	IAdminServiceSearchUsers,
	IAdminServiceSignup,
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

	adminQueryBuilder = this.dataSource //
		.getRepository(Admin)
		.createQueryBuilder('admin');

	async fetchAdmin(
		{ email }: IAdminServiceFetchAdmin, //
	): Promise<Admin> {
		return this.adminQueryBuilder //
			.where('admin.email = :email', { email })
			.getOne();
	}

	async signup({ req }: IAdminServiceSignup): Promise<void> {
		const { email, nickname, password } = req.body;
		const result = await this.adminQueryBuilder
			.where('admin.email = :email', { email })
			.orWhere('admin.nickname = :nickname', { nickname })
			.getOne();

		if (!result[0]) {
			const hashPassword = await bcrypt.hash(password, 10);
			await this.adminQueryBuilder
				.insert()
				.values({ email, nickname, password: hashPassword })
				.execute()
				.then(() => {
					return '회원 가입 성공';
				})
				.catch((err) => {
					throw new UnprocessableEntityException('회원가입 실패');
				});
		}

		if (result.email === email) {
			throw new UnprocessableEntityException('이미 등록되 회원입니다.');
		} else {
			throw new UnprocessableEntityException('이미 사용중인 닉네임입니다.');
		}
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
			if (req.query) {
				return this.boardsService.getBoards();
			}
			const { page: get } = req.query;
			const page = Number(get);
			return this.boardsService.getBoardsWithPage({ page });
		} else {
			throw new UnauthorizedException('권한이 없습니다.');
		}
	}

	async searchBoards({ req }: IAdminServiceSearchBoards): Promise<Board[]> {
		if (req.user.role === 'admin') {
			return await this.boardsService.searchBoardsForAdmin({ keyword: req.query.keyword as string });
		} else {
			throw new UnauthorizedException('관리자가 아닙니다.');
		}
	}

	async deleteBoards({ req, id }: IAdminServiceDeleteBoards): Promise<void> {
		if (req.user.role === 'admin') {
			console.log(id);
			await this.boardsService.deleteBoardForAdmin({ id });
		} else {
			throw new UnauthorizedException('관리자가 아닙니다.');
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
}
