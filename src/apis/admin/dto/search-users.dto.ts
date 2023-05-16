import { User } from 'src/apis/users/entity/user.entity';

export class SearchUsersDTO {
	users: User[];
	counts: number;
}
