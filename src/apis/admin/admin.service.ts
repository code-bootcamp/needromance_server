import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Admin } from './entity/admin.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AdminService {
	constructor(
		private readonly dataSource: DataSource, //
	) {}
	async signup(): Promise<string> {
		const email = process.env.ADMIN_EMAIL;
		const password = process.env.ADMIN_PASSWORD;
		const hashPassword = await bcrypt.hash(password, 10);
		return this.dataSource
			.createQueryBuilder()
			.insert()
			.into(Admin)
			.values({ email: email as string, password: hashPassword, nickname: 'admin' })
			.execute()
			.then(() => {
				return '회원 가입 성공';
			})
			.catch((err) => {
				throw new UnprocessableEntityException('회원가입 실패');
			});
	}
}