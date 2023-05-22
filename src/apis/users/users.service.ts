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
import { Brackets, DataSource, ObjectLiteral, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import {
	IUserServiceCheckToken,
	IUserServiceCreateAdmin,
	IUserServiceCreateSocialUser,
	IUserServiceCreateUser,
	IUserServiceDeleteUser,
	IUSerServiceFetchAnswers,
	IUSerServiceFetchMyBoards,
	IUserServiceFetchUser,
	IUserServiceFetchUsersWithPage,
	IUserServiceFindOneByEmail,
	IUserServiceFindUserWithInfo,
	IUserServiceGetOneUserById,
	IUserServiceGetOneUserByNickname,
	IUserServiceIsValidEmail,
	IUserServiceIsValidNickname,
	IUserServiceManageStatus,
	IUserServiceRstorePassword,
	IUserServiceSaveUser,
	IUSerServiceSearchMyBoards,
	IUserServiceSearchUserByKeyword,
	IUserServiceSendToken,
	IUserServiceUpdateUser,
	IUsersServiceGetTopUsers,
	IUsersServiceUpdateUserPoint,
} from './interface/users-service.interface';
import { AnswersService } from '../answers/answers.service';
import { BoardsService } from '../boards/boards.service';
import { uploadsService } from '../uploads/upload.service';
import { UserRole } from './entity/user.enum';
import { FetchTotalInfoDTO } from './dto/fetchTotalInfo-user.dto';

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

		private readonly uploadsService: uploadsService,
	) {}

	userQueryBuilder = this.dataSource //
		.getRepository(User)
		.createQueryBuilder('user');

	async findUserWithInfo(
		{ email, nickname }: IUserServiceFindUserWithInfo, //
	): Promise<User> {
		return this.userQueryBuilder //
			.where('user.role = :role', { role: 'admin' })
			.andWhere(
				new Brackets((role) => {
					role
						.where('user.email = :email', { email }) //
						.orWhere('user.nickname = :nickname', { nickname });
				}),
			)
			.getOne();
	}

	async countAllUsers(): Promise<number> {
		return this.userQueryBuilder //
			.where('user.role = :role', { role: 'user' })
			.getCount();
	}

	async findUserByEmail({ email }: IUserServiceFindOneByEmail): Promise<User> {
		return this.userQueryBuilder //
			.where('user.email = :email', { email })
			.select('user.id')
			.addSelect('user.email')
			.addSelect('user.nickname')
			.addSelect('user.point')
			.addSelect('user.userImg')
			.addSelect('user.userRanking')
			.addSelect('user.createdAt')
			.addSelect('user.state')
			.addSelect('user.role')
			.addSelect('user.password')
			.getOne();
	}

	async fetchUsers(): Promise<User[]> {
		return this.userQueryBuilder
			.where('user.role = :role', { role: 'user' })
			.select('user.id')
			.addSelect('user.email')
			.addSelect('user.nickname')
			.addSelect('user.point')
			.addSelect('user.userImg')
			.addSelect('user.userRanking')
			.addSelect('user.createdAt')
			.addSelect('user.state')
			.getMany();
	}

	fetchUsersWithPage({ page }: IUserServiceFetchUsersWithPage): Promise<User[]> {
		return this.userQueryBuilder
			.where('user.role = :role', { role: 'user' })
			.select('user.id')
			.addSelect('user.email')
			.addSelect('user.nickname')
			.addSelect('user.point')
			.addSelect('user.userImg')
			.addSelect('user.userRanking')
			.addSelect('user.createdAt')
			.addSelect('user.state')
			.orderBy({ 'user.createdAt': 'DESC' })
			.skip(10 * (page - 1))
			.take(10)
			.getMany();
	}

	async createAdmin(
		{ req }: IUserServiceCreateAdmin, //
	): Promise<string> {
		const { email, nickname, password } = req.body;
		const hashPassword = await bcrypt.hash(password, 10);
		return this.userQueryBuilder //
			.insert()
			.values({ email, nickname, password: hashPassword, role: UserRole.ADMIN })
			.execute()
			.then(() => {
				return '회원 가입 성공';
			})
			.catch((err) => {
				throw new UnprocessableEntityException('회원가입 실패');
			});
	}

	async isValidEmail({ req }: IUserServiceIsValidEmail): Promise<boolean> {
		const { email } = req.query;
		const isValid = await this.userQueryBuilder //
			.where('user.email = :email', { email })
			.getCount();

		return isValid ? false : true;
	}

	async isValidNickname({ req }: IUserServiceIsValidNickname) {
		const { nickname } = req.query;
		const isValid = await this.userQueryBuilder //
			.where('user.nickname = :nickname', { nickname })
			.getCount();
		return isValid ? false : true;
	}

	async sendToken({ req }: IUserServiceSendToken): Promise<void> {
		const token = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
		const { email } = req.query;

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
		await this.mailerService.sendMail({
			to: email as string,
			from: process.env.EMAIL_USER,
			subject: `💞로맨스가 필요해💞`,
			html: romanceTemplate,
		});
	}

	async checkToken({ req }: IUserServiceCheckToken): Promise<boolean> {
		const { email, token } = req.query;
		const getToken = await this.cacheManager.get(email as string);
		return getToken === token ? true : false;
	}

	async getOneUserByNickname({ nickname }: IUserServiceGetOneUserByNickname): Promise<User> {
		const user = await this.userQueryBuilder //
			.where('user.nickname = :nickname', { nickname })
			.getOne();
		return user;
	}

	async createSocialUser({ email }: IUserServiceCreateSocialUser): Promise<User | ObjectLiteral> {
		return this.userQueryBuilder
			.insert()
			.values({ email })
			.execute()
			.then((res) => {
				return res.generatedMaps[0];
			});
	}

	async createUser({ createUserDTO }: IUserServiceCreateUser): Promise<string> {
		//하나의 로직으로 수정할 수 있겠다.
		if (await this.findUserByEmail({ email: createUserDTO.email })) {
			throw new UnprocessableEntityException(`${createUserDTO.email}로 가입된 유저가 존재합니다.`);
		}

		if (await this.getOneUserByNickname({ nickname: createUserDTO.nickname })) {
			throw new UnprocessableEntityException(`${createUserDTO.nickname}로 가입된 유저가 존재합니다.`);
		}

		const hashPassword = await bcrypt.hash(createUserDTO.password, 10);
		return this.userQueryBuilder
			.insert()
			.values({ ...createUserDTO, password: hashPassword })
			.execute()
			.then((res) => {
				return '회원 가입 성공';
			})
			.catch((err) => {
				console.log(err);
				throw new UnprocessableEntityException('회원가입 실패');
			});
	}

	async deleteUser({ req }: IUserServiceDeleteUser): Promise<string> {
		//이메일 검증
		if (req.user.email === req.body.email) {
			const user = await this.findUserByEmail({ email: req.user.email });
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

	async saveUser({ user }: IUserServiceSaveUser): Promise<boolean> {
		return this.userRepository
			.save(user)
			.then(() => {
				return true;
			})
			.catch(() => {
				return false;
			});
	}

	async updateUser({ req, file }: IUserServiceUpdateUser): Promise<User> {
		const imgUrl = await this.uploadsService.uploadsFile({ file });

		const user = await this.findUserByEmail({ email: req.user.email });

		user.userImg = imgUrl;

		if (req.query.nickname) {
			user.nickname = req.query.nickname as string;
		}

		const result = await this.userRepository.save(user);

		const { password, ...updateUser } = result;
		return updateUser;
	}

	async findPassword({ req }: IUserServiceRstorePassword): Promise<string> {
		const user = await this.findUserByEmail({ email: req.body.email });

		const hashPassword = await bcrypt.hash(req.body.password, 10);
		user.password = hashPassword;
		const result = await this.userRepository.save(user);

		return result ? '비밀번호 재설정 성공' : '비밀번호 재설정 실패';
	}

	async fetchUser({ req }: IUserServiceFetchUser): Promise<User> {
		const result = await this.findUserByEmail({ email: req.user.email });
		const { password, ...user } = result;
		return user;
	}

	/**
	 * 유저 조회 서비스 로직. 유저를 찾지 못하면 NotFoundException 던짐
	 * @param id 유저 id
	 * @returns id로 조회한 유저 정보
	 */
	async getOneUserById({ id }: IUserServiceGetOneUserById): Promise<User> {
		const user = await this.userQueryBuilder
			.where('user.id = :id', { id })
			.select('user.id')
			.addSelect('user.email')
			.addSelect('user.password')
			.addSelect('user.nickname')
			.addSelect('user.point')
			.addSelect('user.userImg')
			.addSelect('user.userRanking')
			.addSelect('user.createdAt')
			.addSelect('user.state')
			.getOne();

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
			user.point -= 10;
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
		const users = await this.userQueryBuilder
			.where('user.role = :role', { role: UserRole.USER })
			.andWhere(
				new Brackets((qb) => {
					qb.where(`user.email LIKE :filter`, {
						filter: `%${keyword}%`,
					}).orWhere(`user.nickname LIKE :filter`, {
						filter: `%${keyword}%`,
					});
				}),
			)
			.select('user.id')
			.addSelect('user.email')
			.addSelect('user.nickname')
			.addSelect('user.point')
			.addSelect('user.userImg')
			.addSelect('user.userRanking')
			.addSelect('user.createdAt')
			.addSelect('user.state')
			.addSelect('user.role')
			.getMany();

		if (!users[0]) {
			throw new UnprocessableEntityException('일치하는 단어가 없습니다.');
		}
		return users;
	}

	async mangeStatus({ id }: IUserServiceManageStatus): Promise<User> {
		const user = await this.getOneUserById({ id });
		user.state = !user.state;
		return this.userRepository.save(user);
	}

	async fetchMyBoards({ req }: IUSerServiceFetchMyBoards): Promise<User[]> {
		return this.userQueryBuilder //
			.where('user.id = :id', { id: req.user.id })
			.leftJoinAndSelect('user.boards', 'board')
			.leftJoinAndSelect('board.answers', 'answer')
			.leftJoinAndSelect('board.hashtags', 'hashtag')
			.orderBy({ 'board.createdAt': 'DESC' })
			.orderBy({ 'answer.createdAt': 'DESC' })
			.getMany();
	}

	async fetchMyAnswers({ req }: IUSerServiceFetchAnswers): Promise<User[]> {
		return this.userQueryBuilder //
			.where('user.id = :id', { id: req.user.id })
			.leftJoinAndSelect('user.answers', 'answer')
			.orderBy({ 'answer.createdAt': 'DESC' })
			.getMany();
	}

	async searchMyBoards({ req }: IUSerServiceSearchMyBoards): Promise<User[]> {
		const keyword = req.query.keyword;

		const result = await this.userQueryBuilder
			.where('user.id = :id', { id: req.user.id })
			.leftJoinAndSelect('user.boards', 'board')
			.leftJoinAndSelect('board.answers', 'answer')
			.leftJoinAndSelect('board.hashtags', 'hashtag')
			.where('board.title LIKE :title', { title: `%${keyword}%` })
			.orWhere('board.contents LIKE :contents', { contents: `%${keyword}%` })
			.orderBy({ 'board.createdAt': 'DESC' })
			.orderBy({ 'answer.createdAt': 'DESC' })
			.getMany();
		if (!result[0]) {
			throw new UnprocessableEntityException('일치하는 단어가 없습니다.');
		}
		return result;
	}
	async fetchTotalInfo(): Promise<FetchTotalInfoDTO> {
		const countUsers = await this.countAllUsers();

		const countBoards = await this.boardsService.countAllBoards();

		const countAnswers = await this.answersService.countAllAnswers();

		return { countUsers, countBoards, countAnswers };
	}
}
