import { Controller, Post } from '@nestjs/common';
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
}
