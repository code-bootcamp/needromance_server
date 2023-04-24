import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { restAuthGuard } from './guard/jwt-auth-quard';
import { IAuthUser, IOAuthUser } from './interfaces/auth-services.interface';

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

	@HttpCode(HttpStatus.OK)
	@Post('/logout')
	@UseGuards(restAuthGuard('access'))
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

	@HttpCode(HttpStatus.OK)
	@Post('/restoretoken')
	@UseGuards(restAuthGuard('refresh'))
	restoreAccessToken(
		@Req() req: Request & IAuthUser, //
	): Promise<string> {
		return this.authService.restoreAccessToken({ req });
	}

	// @HttpCode(HttpStatus.OK)
	@Get('/login/google')
	@UseGuards(AuthGuard('google'))
	async loginGoogle(
		@Req() req: Request & IOAuthUser, //
		@Res() res: Response,
	) {
		this.authService.socialLogin({ req, res });
		return res.redirect('http://127.0.0.1:5500/need-romance/test.html');
	}
}
