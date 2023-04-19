import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
	IAuthServiceGetAccessToken,
	IAuthServiceLogout,
	IAuthServiceRestoreToken,
	IAuthServiceSetAdminRefreshToken,
	IAuthServiceSetRefreshToken,
	IAuthServiceSignIn,
} from './interfaces/auth-services.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService, //
		private readonly jwtService: JwtService,
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
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
	setRefreshToken({ user, res }: IAuthServiceSetRefreshToken): Response {
		const refreshToken = this.jwtService.sign(
			{ sub: user.id },
			{ secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
		);
		//개발환경

		return res.setHeader(
			'Set-Cookie', //
			`refreshToken=${refreshToken};path=/; httpOnly`,
		);

		//배포환경
		// res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN);
		// res.setHeader('Access-Control-Allow-Credentials', 'true');
		// res.setHeader(
		// 	'Set-Cookie',
		// 	`refreshToken=${refreshToken};path=/; domain=.jjjbackendclass.shop; SameSite=None; Secure; httpOnly`,
		// );
	}

	setAdminRefreshToken({ res }: IAuthServiceSetAdminRefreshToken): void {
		const refreshToken = this.jwtService.sign(
			{ sub: 1 }, //
			{ secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
		);
		//개발환경
		res.setHeader('Set-Cookie', `refreshToken=${refreshToken};path=/; httpOnly`);

		//배포환경
		// res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN);
		// res.setHeader('Access-Control-Allow-Credentials', 'true');
		// res.setHeader(
		// 	'Set-Cookie',
		// 	`refreshToken=${refreshToken};path=/; domain=.jjjbackendclass.shop; SameSite=None; Secure; httpOnly`,
		// );
	}

	async signIn({ req, res }: IAuthServiceSignIn): Promise<string> {
		const { email, password } = req.body;

		if (email === process.env.ADMIN_EMAIL) {
			await this.setAdminRefreshToken({ res });
			return this.getAdminAccessToken();
		}

		const user = await this.usersService.isUser({ email });
		console.log(user);
		const isValid = await bcrypt.compare(password, user.password);
		console.log(isValid);
		if (!isValid) {
			throw new UnauthorizedException('올바른 정보를 입력해주세요');
		}
		this.setRefreshToken({ user, res });

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
			console.log(req.user.email);
			const user = await this.usersService.isUser({ email: req.user.email });
			return this.getUserAccessToken({ user });
		} else {
			return this.getAdminAccessToken();
		}
	}
}
