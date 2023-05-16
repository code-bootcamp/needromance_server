import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { Board } from '../boards/entity/board.entity';
import { User } from '../users/entity/user.entity';
import { AdminService } from './admin.service';
import { FetchUsersDTO } from './dto/fetch-users-dto';

@Controller('admin')
export class AdminController {
	constructor(
		private readonly adminService: AdminService, //
	) {}

	/**
	 * Post '/admin/signup' 라우트 핸들러
	 * @param createAdminDTO 관리자 회원가입 정보
	 * @returns 회원가입 성공 유무 상태코드및 메세지
	 */

	@Post('/signup')
	createAdmin(
		@Req() req: Request, //
	): Promise<string> {
		return this.adminService.signup({ req });
	}

	/**
	 * Post '/admin/signup' 라우트 핸들러
	 * @param createAdminDTO 관리자 회원가입 정보
	 * @returns 회원가입 성공 유무 상태코드및 메세지
	 */

	@Get('/users')
	@UseGuards(restAuthGuard('access'))
	fetchUsers(
		@Req() req: Request & IAuthUser, //
	): Promise<FetchUsersDTO> {
		return this.adminService.fetchUsers({ req });
	}

	@Get('/user/search')
	@UseGuards(restAuthGuard('access'))
	searchUsers(
		@Req() req: Request & IAuthUser, //
	): Promise<User[]> {
		return this.adminService.searchUser({ req });
	}

	@Patch('/user/status')
	@UseGuards(restAuthGuard('access'))
	manageStatus(
		@Req() req: Request & IAuthUser, //
	): Promise<User> {
		return this.adminService.mangeStatus({ req });
	}

	@Get('/boards')
	@UseGuards(restAuthGuard('access'))
	fetchBoards(
		@Req() req: Request & IAuthUser, //
	): Promise<Board[]> {
		return this.adminService.fetchBoards({ req });
	}

	@Get('/boards/search')
	@UseGuards(restAuthGuard('access'))
	searchBoards(
		@Req() req: Request & IAuthUser, //
	): Promise<Board[]> {
		return this.adminService.searchBoards({ req });
	}

	@Delete('/boards/:id')
	@UseGuards(restAuthGuard('access'))
	deleteBoard(
		@Req() req: Request & IAuthUser, //
		@Param('id', ParseIntPipe) id: number,
	): Promise<void> {
		return this.adminService.deleteBoards({ req, id });
	}
}
