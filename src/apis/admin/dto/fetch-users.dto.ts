import { User } from 'src/apis/users/entity/user.entity';

export class FetchUsersDTO {
	users: User[];
	counts: number;
}
