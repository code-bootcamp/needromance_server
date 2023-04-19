import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { User } from '../users/entity/user.entity';
import { AdminService } from './admin.service';

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
	createAdmin(): Promise<string> {
		return this.adminService.signup();
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
	): Promise<User[]> {
		return this.adminService.fetchUsers({ req });
	}
}
