import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DataSource, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import {
	IUserServiceCheckToken,
	IUserServiceCreateUser,
	IUserServiceIsValidEmail,
	IUserServiceIsValidNickname,
	IUserServiceSendToken,
} from './interface/users-service.interface';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,

		private readonly mailerService: MailerService,
		private readonly dataSource: DataSource,
	) {}

	async isValidEmail({ req }: IUserServiceIsValidEmail): Promise<boolean> {
		//올바른 이메일인지 검증후 보내주기에 따로 검증하지 않았음
		//이메일 중복검사만함
		//갯수를 조회하여 중복검사를 진행
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

	async createUser({ createUserDTO }: IUserServiceCreateUser): Promise<string> {
		//검증된 nickname과 email그리고 password를 입력받는다.
		//insert와 우사하게 동작하는 query이다.
		return this.dataSource
			.createQueryBuilder()
			.insert()
			.into(User)
			.values({ ...createUserDTO })
			.execute()
			.then((res) => {
				return '회원 가입 성공';
			})
			.catch((err) => {
				console.log(err);
				throw new UnprocessableEntityException('회원가입 실패');
			});
		//상태코드는 모두 200으로 갈텐데 메세지와 상태코드를 맞춰서 보내는 방법이 없을까?

		// const user = await this.userRepository.save({ ...createUserDTO });
		// return user ? '회원가입 성공' : '회원가입 실패';
	}
}
