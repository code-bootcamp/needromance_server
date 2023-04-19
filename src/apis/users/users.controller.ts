import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IAuthRequest } from 'src/commons/interface';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
	constructor(
		private readonly userService: UsersService, //
	) {}

	/**
	 * Get '/find/email' 라우트 핸들러
	 * @param req / req.query.email email 정보
	 * @returns boolean
	 */

	@Get('/find/email')
	checkEmail(
		@Req() req: Request, //
	): Promise<boolean> {
		return this.userService.isValidEmail({ req });
	}

	/**
	 * Get '/find/nickname' 라우트 핸들러
	 * @param req / req.query.nickname nickname 정보
	 * @returns boolean
	 */

	@Get('/find/nickname')
	checkNickname(
		@Req() req: Request, //
	): Promise<boolean> {
		return this.userService.isValidNickname({ req });
	}
	/**
	 * Get '/sendtoken' 라우트 핸들러
	 * @param req / req.query.email email 정보
	 * @returns void
	 */

	@Get('/sendtoken')
	sendToken(
		@Req() req: Request, //
	): Promise<void> {
		return this.userService.sendToken({ req });
	}

	/**
	 * Get '/checktoken' 라우트 핸들러
	 * @param req / req.query.token token 정보
	 * @returns boolean
	 */

	@Get('/checktoken')
	checkToken(
		@Req() req: Request, //
	): Promise<boolean> {
		return this.userService.checkToken({ req });
	}

	/**
	 * Post '/user/signup' 라우트 핸들러
	 * @param createUserDTO 회원가입 정보
	 * @returns 회원가입 성공 유무 상태코드및 메세지
	 */

	@Post('/signup')
	createUser(
		@Body() createUserDTO: CreateUserDTO, //
	): Promise<string> {
		return this.userService.createUser({ createUserDTO });
	}

	/**
	 * Delete '/user/delete' 라우트 핸들러
	 * @param req 회원탈퇴 정보및 accesstoken
	 * @returns 회원탈퇴 성공 유무 메세지
	 */
	@UseGuards(restAuthGuard('access'))
	@Delete('/delete')
	deleteUser(
		@Req() req: Request & IAuthUser, //
	): Promise<string> {
		return this.userService.deleteUser({ req });
	}

	/**
	 * Patch '/user/update' 라우트 핸들러
	 * @param req  갱신할 정보및 accesstoken
	 * @returns 회원정보
	 */
	@UseGuards(restAuthGuard('access'))
	@Patch('/update')
	updateUser(
		@Req() req: Request & IAuthUser, //
	): Promise<User> {
		return this.userService.updateUser({ req });
	}

	/**
	 * Patch '/user/update' 라우트 핸들러
	 * @param req  이메일과 비밀번호
	 * @returns 비밀번호 재설정 성공유무 메시지
	 */

	@Patch('find/password')
	findPassword(
		@Req() req: Request, //
	): Promise<string> {
		return this.userService.findPassword({ req });
	}

	/**
	 * Get '/user/login' 라우트 핸들러
	 * @param req  accesstoken
	 * @returns 회원정보
	 */
	@UseGuards(restAuthGuard('access'))
	@Get('login')
	fetchUser(
		@Req() req: Request & IAuthUser, //
	): Promise<User> {
		return this.userService.fetchUser({ req });
	}
}
