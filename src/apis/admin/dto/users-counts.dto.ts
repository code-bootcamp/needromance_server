import { User } from 'src/apis/users/entity/user.entity';

export class UsersCountsDTO {
	users: User[];
	counts: number;
}
