import { Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { restAuthGuard } from './guard/jwt-auth-quard';
import { IAuthUser } from './interfaces/auth-services.interface';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService, //
	) {}
	/**
	 * Post '/auth/signup' 라우트 핸들러
	 * @param createUserDTO 회원가입 정보
	 * @returns 회원가입 성공 유무 상태코드및 메세지
	 */

	@HttpCode(HttpStatus.OK)
	@Post('/login')
	async login(
		@Req() req: Request & IAuthUser, //
		@Res() res: Response,
	): Promise<void> {
		res.send(await this.authService.signIn({ req, res }));
	}

	/**
	 * Post '/auth/logout' 라우트 핸들러
	 * @param req 헤더에 accesstoken을 담아 요청을 보냄
	 * @returns 로그아웃 성공유무 메세지
	 */
	@UseGuards(restAuthGuard('access'))
	@HttpCode(HttpStatus.OK)
	@Post('/logout')
	logout(
		@Req() req: Request & IAuthUser, //
	): Promise<string> {
		return this.authService.logout({ req });
	}

	/**
	 * Post '/auth/logout' 라우트 핸들러
	 * @param req 헤더에 accesstoken을 담아 요청을 보냄
	 * @returns accestoken
	 */
	@UseGuards(restAuthGuard('access'))
	@HttpCode(HttpStatus.OK)
	@Post('/restoretoken')
	restoreAccessToken(
		@Req() req: Request & IAuthUser, //
	): Promise<string> {
		return this.authService.restoreAccessToken({ req });
	}
}
