import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
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
		this.cacheManager.set(`${email}`, `${token}`, 180000);
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
		this.mailerService.sendMail({
			to: email as string,
			from: process.env.EMAIL_USER,
			subject: `💞로맨스가 필요해💞`,
			html: romanceTemplate,
		});
	}

	// async checkToken({ req }: IUserServiceCheckToken) {
	// 	console.log(req);
	// }
	// createUser({ createUserDTO }: IUserServiceCreateUser): void {
	// 	console.log('$$$$$$');
	// 	console.log(createUserDTO);
	// 	//회원정보를 입력받고 db에 저장한다.
	// 	//userImg는 null 값이다.

	// 	//create매서드로 할수 없나? 관계까지 쿼리빌더로 설정하면 되는거 아닌가?
	// }
}
