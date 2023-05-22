import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
	IAdminServiceDeleteBoards,
	IAdminServiceFetchBoards,
	IAdminServiceIsAdmin,
	IAdminServiceManagesStatus,
	IAdminServiceSearchBoards,
	IAdminServiceSearchUsers,
	IAdminServiceSignup,
} from './interface/admin-services.interface';
import { User } from '../users/entity/user.entity';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entity/board.entity';
import { UserRole } from '../users/entity/user.enum';
import { BoardsCountsDTO } from './dto/boards-counts.dto';
import { UsersCountsDTO } from './dto/users-counts.dto';

@Injectable()
export class AdminService {
	constructor(
		private readonly usersService: UsersService, //
		private readonly boardsService: BoardsService,
	) {}

	async signup({ req }: IAdminServiceSignup): Promise<string> {
		const { email, nickname } = req.body;

		const admin = await this.usersService.findUserWithInfo({ email, nickname });

		if (!admin) {
			return this.usersService.createAdmin({ req });
		}
		if (admin.email === email) {
			throw new UnprocessableEntityException('이미 등록되 회원입니다.');
		} else {
			throw new UnprocessableEntityException('이미 사용중인 닉네임입니다.');
		}
	}

	async isAdmin({ role }: IAdminServiceIsAdmin) {
		if (role === UserRole.USER) throw new UnauthorizedException('권한이 없습니다.');
	}

	async fetchUsers({ req }: IAdminServiceFetchBoards): Promise<UsersCountsDTO> {
		await this.isAdmin({ role: req.user.role });

		if (Object.keys(req.query).length === 0) {
			const users = await this.usersService.fetchUsers();
			return { users, counts: users.length };
		}

		const page = Number(req.query.page);
		const users = await this.usersService.fetchUsersWithPage({ page });
		const counts = await this.usersService.countAllUsers();
		return { users, counts };
	}

	async fetchBoards({ req }): Promise<BoardsCountsDTO> {
		await this.isAdmin({ role: req.user.role });

		if (Object.keys(req.query).length === 0) {
			const boards = await this.boardsService.getBoards();
			return { boards, counts: boards.length };
		}

		const page = Number(req.query.page);
		const boards = await this.boardsService.getBoardsWithPage({ page });
		const counts = await this.boardsService.countAllBoards();
		return { boards, counts };
	}

	async searchBoards({ req }: IAdminServiceSearchBoards): Promise<BoardsCountsDTO> {
		await this.isAdmin({ role: req.user.role });

		const boards = await this.boardsService.searchBoardsForAdmin({ keyword: req.query.keyword as string });
		return { boards, counts: boards.length };
	}

	async deleteBoards({ req, id }: IAdminServiceDeleteBoards): Promise<void> {
		await this.isAdmin({ role: req.user.role });
		await this.boardsService.deleteBoardForAdmin({ id });
	}

	async searchUser({ req }: IAdminServiceSearchUsers): Promise<UsersCountsDTO> {
		await this.isAdmin({ role: req.user.role });

		const users = await this.usersService.searchUserByKeyword({ keyword: req.query.keyword as string });
		return { users, counts: users.length };
	}

	async mangeStatus({ req }: IAdminServiceManagesStatus): Promise<User> {
		await this.isAdmin({ role: req.user.role });
		return this.usersService.mangeStatus({ id: req.body.id });
	}
}
