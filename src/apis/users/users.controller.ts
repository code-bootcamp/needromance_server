import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';
import { Express } from 'express';
import { FetchTotalInfoDTO } from './dto/fetchTotalInfo-user.dto';

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
	@UseInterceptors(FileInterceptor('file'))
	updateUser(
		@UploadedFile() file: Express.Multer.File,
		@Req() req: Request & IAuthUser, //
	): Promise<User> {
		return this.userService.updateUser({ req, file });
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

	/**
	 * GET '/user?sort=:sort' 라우트 핸들러
	 * @param sort 정렬 기준: point
	 * @returns TOP5 유저 배열
	 */
	@Get()
	getTopUsers(
		@Query('sort') sort: string, //
	): Promise<User[]> {
		return this.userService.getTopUsers({ sort });
	}

	@UseGuards(restAuthGuard('access'))
	@Get('/boards')
	fetchMyBoards(
		@Req() req: Request & IAuthUser, //
	): Promise<User[]> {
		return this.userService.fetchMyBoards({ req });
	}

	@UseGuards(restAuthGuard('access'))
	@Get('/answers')
	fetchMyAnswers(
		@Req() req: Request & IAuthUser, //
	): Promise<User[]> {
		return this.userService.fetchMyAnswers({ req });
	}

	@UseGuards(restAuthGuard('access'))
	@Get('/boards/search')
	SearchMyBoards(
		@Req() req: Request & IAuthUser, //
	): Promise<User[]> {
		return this.userService.searchMyBoards({ req });
	}

	@Get('/total')
	fetchTotalInfo(
		@Req() req: Request, //
	): Promise<FetchTotalInfoDTO> {
		return this.userService.fetchTotalInfo();
	}
}
