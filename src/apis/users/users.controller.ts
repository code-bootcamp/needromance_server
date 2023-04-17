import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
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
	 * Get '/find/email' 라우트 핸들러
	 * @param req / req.query.email email 정보
	 * @returns boolean
	 */

	@Get('/find/nickname')
	checkNickname(
		@Req() req: Request, //
	): Promise<boolean> {
		return this.userService.isValidNickname({ req });
	}
	/**
	 * Get '/find/email' 라우트 핸들러
	 * @param req / req.query.email email 정보
	 * @returns boolean
	 */

	@Get('/sendtoken')
	sendToken(
		@Req() req: Request, //
	): Promise<void> {
		return this.userService.sendToken({ req });
	}

	/**
	 * Get '/find/email' 라우트 핸들러
	 * @param req / req.query.email email 정보
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
	 * @returns 회원가입 성공 유무 상태코드
	 */

	@Post('/signup')
	createUser(
		@Body() createUserDTO: CreateUserDTO, //
	): void {
		return this.userService.createUser({ createUserDTO });
	}
}
