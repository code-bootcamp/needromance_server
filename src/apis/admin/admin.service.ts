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
import { FetchUsersDTO } from './dto/fetch-users.dto';
import { SearchUsersDTO } from './dto/search-users.dto';
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

	async fetchUsers({ req }: IAdminServiceFetchBoards): Promise<FetchUsersDTO> {
		await this.isAdmin({ role: req.user.role });
		return this.usersService.fetchUsers();
	}

	async fetchBoards({ req }): Promise<Board[]> {
		await this.isAdmin({ role: req.user.role });
		if (req.query) {
			return this.boardsService.getBoards();
		}
		const { page: get } = req.query;
		const page = Number(get);
		return this.boardsService.getBoardsWithPage({ page });
	}

	async searchBoards({ req }: IAdminServiceSearchBoards): Promise<Board[]> {
		await this.isAdmin({ role: req.user.role });
		return await this.boardsService.searchBoardsForAdmin({ keyword: req.query.keyword as string });
	}

	async deleteBoards({ req, id }: IAdminServiceDeleteBoards): Promise<void> {
		await this.isAdmin({ role: req.user.role });
		await this.boardsService.deleteBoardForAdmin({ id });
	}

	async searchUser({ req }: IAdminServiceSearchUsers): Promise<SearchUsersDTO> {
		await this.isAdmin({ role: req.user.role });

		const users = await this.usersService.searchUserByKeyword({ keyword: req.query.keyword as string });
		return { users, counts: users.length };
	}

	async mangeStatus({ req }: IAdminServiceManagesStatus): Promise<User> {
		await this.isAdmin({ role: req.user.role });
		return this.usersService.mangeStatus({ id: req.body.id });
	}
}
