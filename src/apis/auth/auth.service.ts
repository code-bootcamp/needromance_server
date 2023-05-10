import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';

import {
	IAuthServiceGetAccessToken,
	IAuthServiceLogout,
	IAuthServiceRestoreToken,
	IAuthServiceSetRefreshToken,
	IAuthServiceSignIn,
	IAuthServiceSocialLogin,
	IAuthServiceSocialNickname,
} from './interfaces/auth-services.interface';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
	constructor(
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
		private readonly usersService: UsersService, //
		private readonly adminService: AdminService,
		private readonly jwtService: JwtService,
	) {}

	getAccessToken({ user }: IAuthServiceGetAccessToken): string {
		return this.jwtService.sign(
			{
				role: user.role,
				nickname: user.nickname, //
				email: user.email,
				sub: user.id,
			}, //
			{ secret: process.env.JWT_ACCESS_KEY, expiresIn: '2h' },
		);
	}

	setRefreshToken({ user, res }: IAuthServiceSetRefreshToken): void {
		const refreshToken = this.jwtService.sign(
			{ sub: user.id },
			{ secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
		);

		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.cookie('refreshToken', refreshToken, {
			domain: process.env.FRONTEND_DOMAIN, //
			path: '/',
			sameSite: 'none',
			httpOnly: true,
			secure: true,
		});
	}

	async signIn({ req, res }: IAuthServiceSignIn): Promise<string> {
		const { email, password } = req.body;

		const user = await this.usersService.findUserByEmail({ email });
		console.log(user);
		console.log('#####');
		if (!user || !user.state) {
			throw new UnprocessableEntityException('등록되지 않았거나, 정지된 계정입니다.');
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			throw new UnauthorizedException('올바른 정보를 입력해주세요');
		}

		await this.setRefreshToken({ user, res });

		return this.getAccessToken({ user });
	}

	async logout({ req }: IAuthServiceLogout): Promise<string> {
		try {
			if (!req.headers) {
				throw new UnauthorizedException('JWT token is missing');
			}

			const accessToken = req.headers.authorization.split(' ')[1];
			const refreshToken = req.headers.cookie.split('=')[1];

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
		const user = await this.usersService.findUserByEmail({ email: req.user.email });
		return this.getAccessToken({ user });
	}

	async socialLogin({ req, res }: IAuthServiceSocialLogin): Promise<void> {
		const email = req.user.email;
		const user = await this.usersService.findUserByEmail({ email });

		if (!user || !user.nickname) {
			const socialLoginUser = await this.usersService.createSocialUser({ email });

			await this.setRefreshToken({ user: socialLoginUser, res });
			return res.redirect('https://needromance.online/signup/social');
		}

		await this.setRefreshToken({ user, res });

		return res.redirect('https://needromance.online/');
	}

	async socialNickname({ req }: IAuthServiceSocialNickname): Promise<string> {
		const user = await this.usersService.getOneUserById({ id: req.user.id });

		user.nickname = req.body.nickname;

		const isSaveUser = await this.usersService.saveUser({ user });
		//문제없이 업데이트된경우 토큰을 없애준다.
		if (isSaveUser) {
			const refreshToken = req.headers.cookie.split('=')[1];
			const isRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
			const isSave = await this.cacheManager.set(
				`refreshToken:${refreshToken}`, //
				'refreshToken',
				{
					ttl: isRefreshToken['exp'] - Math.trunc(Date.now() / 1000),
				},
			);
			return isSave ? '소셜회원가입 성공' : '소셜회원가입 실패';
		}
	}
}
