import { MailerService } from '@nestjs-modules/mailer';
import {
	CACHE_MANAGER,
	Inject,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
	forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DataSource, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import {
	IUserServiceCheckToken,
	IUserServiceCreateUser,
	IUserServiceDeleteUser,
	IUserServiceFetchUser,
	IUserServiceFindOneByEmail,
	IUserServiceGetOneUserById,
	IUserServiceGetOneUserByNickname,
	IUserServiceIsValidEmail,
	IUserServiceIsValidNickname,
	IUserServiceRstorePassword,
	IUserServiceSearchUserByKeyword,
	IUserServiceSendToken,
	IUserServiceUpdateUser,
	IUsersServiceGetTopUsers,
	IUsersServiceUpdateUserPoint,
} from './interface/users-service.interface';
import { AnswersService } from '../answers/answers.service';
import { BoardsService } from '../boards/boards.service';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/entity/admin.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,

		private readonly mailerService: MailerService,
		private readonly dataSource: DataSource,

		@Inject(forwardRef(() => AnswersService))
		private readonly answersService: AnswersService,

		@Inject(forwardRef(() => BoardsService))
		private readonly boardsService: BoardsService,
	) {}

	async isUser({ email }: IUserServiceFindOneByEmail): Promise<User> {
		const user = await this.dataSource
			.getRepository(User)
			.createQueryBuilder('user')
			.where('user.email = :email', { email })
			.getOne();
		return user;
	}

	async fetchUsers(): Promise<User[]> {
		const result = await this.dataSource //
			.getRepository(User)
			.createQueryBuilder('user')
			.select('user.id')
			.addSelect('user.email')
			.addSelect('user.nickname')
			.addSelect('user.point')
			.addSelect('user.userImg')
			.addSelect('user.createdAt')
			.addSelect('user.state')
			.getMany();
		console.log(result);
		return result;
	}

	async isValidEmail({ req }: IUserServiceIsValidEmail): Promise<boolean> {
		const { email } = req.query;
		const isValid = await this.userRepository.count({
			where: {
				email: email as string,
			},
		});
		return isValid ? false : true;
	}

	async isValidNickname({ req }: IUserServiceIsValidNickname) {
		const { nickname } = req.query;
		const isValid = await this.userRepository.count({
			where: {
				nickname: nickname as string,
			},
		});
		return isValid ? false : true;
	}

	async sendToken({ req }: IUserServiceSendToken): Promise<void> {
		const token = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
		const { email } = req.query;
		//redis에 email과 인증번호 저장
		await this.cacheManager.set(email as string, token, {
			ttl: 180, //
		});
		//템플릿을 하나의 파일로 빼서 관리할수 없을까?
		const romanceTemplate = `
        <html>
            <body>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 500px;">
                        <h1>'💞로맨스가 필요해💞'에서 보낸 인증번호 입니다.</h1>
                        <hr />
                        <div style="color: black;">인증번호:${token}</div>
                        <div style="color: black;">인증번호는 확인란에 입력해주세요</div>
                    </div>
                </div>
    
            </body>
        </html>
      `;
		//이메일로 인증번호 전송
		const test2 = await this.mailerService.sendMail({
			to: email as string,
			from: process.env.EMAIL_USER,
			subject: `💞로맨스가 필요해💞`,
			html: romanceTemplate,
		});
		console.log(test2);
		//만에하나 에러가 날 경우를 대비한 에러 에러핸들링이 필요하다.
		//전반적인 기능개발 이후 에러 핸들링 할것
	}

	async checkToken({ req }: IUserServiceCheckToken): Promise<boolean> {
		const { email, token } = req.query;
		const getToken = await this.cacheManager.get(email as string);
		return getToken === token ? true : false;
	}

	async getOneUserByNickname({ nickname }: IUserServiceGetOneUserByNickname): Promise<User> {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		const user = await queryBuilder //
			.where('user.nickname = :nickname', { nickname })
			.getOne();
		return user;
	}

	async createUser({ createUserDTO }: IUserServiceCreateUser): Promise<string> {
		//검증된 nickname과 email그리고 password를 입력받는다.
		//insert와 우사하게 동작하는 query이다.

		if (await this.isUser({ email: createUserDTO.email })) {
			throw new UnprocessableEntityException(`${createUserDTO.email}로 가입된 유저가 존재합니다.`);
		}

		if (await this.getOneUserByNickname({ nickname: createUserDTO.nickname })) {
			throw new UnprocessableEntityException(`${createUserDTO.nickname}로 가입된 유저가 존재합니다.`);
		}

		const hashPassword = await bcrypt.hash(createUserDTO.password, 10);
		return this.dataSource
			.createQueryBuilder()
			.insert()
			.into(User)
			.values({ ...createUserDTO, password: hashPassword })
			.execute()
			.then((res) => {
				return '회원 가입 성공';
			})
			.catch((err) => {
				console.log(err);
				throw new UnprocessableEntityException('회원가입 실패');
			});
		//왤컴 템플릿도 보내줘야 할까?
		//상태코드는 모두 200으로 갈텐데 메세지와 상태코드를 맞춰서 보내는 방법이 없을까?

		// const user = await this.userRepository.save({ ...createUserDTO });
		// return user ? '회원가입 성공' : '회원가입 실패';
	}

	async deleteUser({ req }: IUserServiceDeleteUser): Promise<string> {
		//이메일 검증
		if (req.user.email === req.body.email) {
			const user = await this.isUser({ email: req.user.email });
			if (!user) {
				throw new UnprocessableEntityException('이미 탈퇴한 회원입니다.');
			}
			//비밀번호 검증
			const isValid = await bcrypt.compare(req.body.password, user.password);
			if (isValid) {
				// 유저의 모든 답변 삭제
				await this.answersService.deleteAnswersByUserId({ userId: req.user.id });
				// 유저 게시글의 모든 답변 삭제
				const boards = await this.boardsService.getBoardsByUserId({ userId: req.user.id });
				boards.forEach(async (board) => {
					await this.answersService.deleteAnswersByBoardId({ boardId: board.id });
				});
				// 유저의 모든 게시글 삭제
				await this.boardsService.deleteBoardsByUserId({ userId: req.user.id });

				const result = await this.dataSource //
					.createQueryBuilder()
					.delete()
					.from(User)
					.where('user.id = :id', { id: user.id })
					.execute();
				return result.affected ? '탈퇴성공' : '탈퇴실패';
			} else {
				throw new UnprocessableEntityException('비밀번호가 일치하지 않습니다.');
			}
		} else {
			throw new UnprocessableEntityException('이메일이 일치하지 않습니다.');
		}
	}

	async updateUser({ req }: IUserServiceUpdateUser): Promise<User> {
		const user = await this.isUser({ email: req.user.email });

		await this.dataSource
			.createQueryBuilder()
			.update(User)
			.set({
				nickname: req.body.nickname,
				userImg: req.body.userImg,
			})
			.where('user.id = :id', { id: user.id })
			.execute();

		const result = await this.isUser({ email: req.user.email });
		const { password, ...updateUser } = result;
		return updateUser;
	}

	async findPassword({ req }: IUserServiceRstorePassword): Promise<string> {
		const user = await this.isUser({ email: req.body.email });

		const hashPassword = await bcrypt.hash(req.body.password, 10);
		const result = await this.dataSource
			.createQueryBuilder()
			.update(User)
			.set({
				password: hashPassword,
			})
			.where('user.id = :id', { id: user.id })
			.execute();

		return result.affected ? '비밀번호 재설정 성공' : '비밀번호 재설정 실패';
	}

	async fetchUser({ req }: IUserServiceFetchUser): Promise<User | Admin> {
		if (req.user.role === 'admin') {
			return this.dataSource
				.getRepository(Admin)
				.createQueryBuilder('admin')
				.where('admin.email = :email', { email: req.user.email })
				.getOne();
		}
		const result = await this.isUser({ email: req.user.email });
		const { password, ...user } = result;
		return user;
	}

	/**
	 * 유저 조회 서비스 로직. 유저를 찾지 못하면 NotFoundException 던짐
	 * @param id 유저 id
	 * @returns id로 조회한 유저 정보
	 */
	async getOneUserById({ id }: IUserServiceGetOneUserById): Promise<User> {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		const user = await queryBuilder.where('user.id = :id', { id }).getOne();

		if (!user) {
			throw new NotFoundException('유저를 찾을 수 없습니다.');
		}

		return user;
	}

	/**
	 * 유저 포인트 업데이트 서비스 로직.
	 * status가 true인 경우(유저가 작성한 답변이 채택된 경우) point 10 증가
	 * status가 false인 경우(채택된 답변이 채택 취소된 경우) point 10 감소
	 * @param id 유저 id
	 * @param status 답변 채택 여부
	 */
	async updateUserPoint({ id, status }: IUsersServiceUpdateUserPoint): Promise<void> {
		const user = await this.getOneUserById({ id });

		if (status) {
			user.point += 10;
		} else {
			// user.point -= 10;
		}

		await this.userRepository.save(user);
	}

	/**
	 * (point 기준) TOP5 유저 리스트 조회 서비스 로직.
	 * @param sort 정렬 기준: point
	 * @returns TOP5 유저 배열
	 */
	async getTopUsers({ sort }: IUsersServiceGetTopUsers): Promise<User[]> {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		if (sort === 'point') {
			const topFiveUsers: User[] = await queryBuilder //
				.orderBy('user.point', 'DESC')
				.take(5)
				.getMany();

			return topFiveUsers;
		} else {
			throw new UnprocessableEntityException('쿼리를 잘못 입력했습니다.');
		}
	}

	async searchUserByKeyword({ keyword }: IUserServiceSearchUserByKeyword): Promise<User[]> {
		const users = await this.dataSource
			.getRepository(User) //
			.createQueryBuilder('user')
			.where('user.email LIKE :email', { email: `%${keyword}%` })
			.orWhere('user.nickname LIKE :nickname', { nickname: `%${keyword}%` })
			.getMany();
		if (!users[0]) {
			throw new UnprocessableEntityException('일치하는 단어가 없습니다.');
		}
		return users;
	}
}
