import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
	IAuthServiceGetAccessToken,
	IAuthServiceLogout,
	IAuthServiceRestoreToken,
	IAuthServiceSetAdminRefreshToken,
	IAuthServiceSetRefreshToken,
	IAuthServiceSignIn,
	IAuthServiceSocialLogin,
} from './interfaces/auth-services.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { Response } from 'express';

@Injectable()
export class AuthService {
	constructor(
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
		private readonly usersService: UsersService, //
		private readonly jwtService: JwtService,
	) {}

	getUserAccessToken({ user }: IAuthServiceGetAccessToken): string {
		return this.jwtService.sign(
			{
				role: 'user',
				nickname: user.nickname, //
				email: user.email,
				sub: user.id,
			}, //
			{ secret: process.env.JWT_ACCESS_KEY, expiresIn: '2h' },
		);
	}

	getAdminAccessToken(): string {
		return this.jwtService.sign(
			{
				role: 'admin',
				nickname: 'admin', //
				email: process.env.ADMIN_EMAIL,
				sub: 1,
			}, //
			{ secret: process.env.JWT_ACCESS_KEY, expiresIn: '2h' },
		);
	}
	//refreashtoken 헤더에 넣을때 어떻게 넣지?
	setRefreshToken({ user, res }: IAuthServiceSetRefreshToken): void {
		const refreshToken = this.jwtService.sign(
			{ sub: user.id },
			{ secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
		);
		//개발환경
		// res.setHeader(
		// 	'set-Cookie',
		// 	`refreshToken=${refreshToken}; path=/; httpOnly`, //Secure;
		// );
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.cookie('refreshToken', refreshToken, {
			domain: process.env.FRONTEND_DOMAIN, //
			path: '/',
			sameSite: 'lax', //로컬환경에서의 개발을 위해 sameSite옵션을 없애준다.
			httpOnly: true,
			secure: false, //프론트의 주소가 https로 배포되면 true로 바꿀것.
		});
	}

	setAdminRefreshToken({ res }: IAuthServiceSetAdminRefreshToken): Response {
		const refreshToken = this.jwtService.sign(
			{ sub: 1 }, //
			{ secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
		);

		return res.cookie('refreshToken', refreshToken, {
			domain: process.env.FRONTEND_DOMAIN, //
			path: '/',
			sameSite: 'none', //로컬환경에서의 개발을 위해 sameSite옵션을 없애준다.
			httpOnly: true,
			secure: false, //프론트의 주소가 https로 배포되면 true로 바꿀것.
		});
	}

	async signIn({ req, res }: IAuthServiceSignIn): Promise<string> {
		const { email, password } = req.body;
		if (email === process.env.ADMIN_EMAIL) {
			await this.setAdminRefreshToken({ res });
			return this.getAdminAccessToken();
		}

		const user = await this.usersService.isUser({ email });

		if (!user || !user.state) throw new UnprocessableEntityException('등록되지 않았거나, 정지된 계정입니다.');
		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			throw new UnauthorizedException('올바른 정보를 입력해주세요');
		}
		await this.setRefreshToken({ user, res });

		return this.getUserAccessToken({ user });
	}

	async logout({ req }: IAuthServiceLogout): Promise<string> {
		try {
			if (!req.headers) {
				throw new UnauthorizedException('JWT token is missing');
			}
			const accessToken = req.headers.authorization.split(' ')[1];
			const refreshToken = req.headers.cookie.split('=')[1];

			//여기서 에러가 발생함
			const isAccessToken = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
			const isRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
			const isSave1 = await this.cacheManager.set(
				`accessToken:${accessToken}`, //
				'accessToken',
				{
					ttl: isAccessToken['exp'] - Math.trunc(Date.now() / 1000),
				},
			);

			const isSave2 = await this.cacheManager.set(
				`refreshToken:${refreshToken}`, //
				'refreshToken',
				{
					ttl: isRefreshToken['exp'] - Math.trunc(Date.now() / 1000),
				},
			);
			return isSave1 === 'OK' && isSave2 === 'OK' ? '로그아웃에 성공했습니다.' : '로그아웃에 실패했습니다.';
		} catch (err) {
			throw new UnauthorizedException('JWT token is missing');
		}
	}

	async restoreAccessToken({ req }: IAuthServiceRestoreToken): Promise<string> {
		if (req.user.role === 'user') {
			const user = await this.usersService.isUser({ email: req.user.email });
			return this.getUserAccessToken({ user });
		} else {
			return this.getAdminAccessToken();
		}
	}

	async socialLogin({ req, res }: IAuthServiceSocialLogin): Promise<void> {
		console.log(req);

		const user = await this.usersService.isUser({ email: req.user.email });
		//회원이 아닌경우 닉네임 재설정을 해준다.
		if (!user) {
			//이 부분은 배포후 작업하겠다.
		}

		//회원인 경우 토큰발급해주어 로그인 시켜준다.
		await this.setRefreshToken({ user, res });

		//마지막으로 메인페이지로 라다이랙트시켜준다.
		return res.redirect('http://127.0.0.1:5500/need-romance/test.html');
	}
}
