import { Request } from 'express';
import { CreateUserDTO } from '../dto/create-user.dto';

export interface IUserServiceFindOneByEmail {
	email: string;
}
export interface IUserServiceIsValidEmail {
	req: Request;
}

export interface IUserServiceIsValidNickname {
	req: Request;
}

export interface IUserServiceSendToken {
	req: Request;
}

export interface IUserServiceCheckToken {
	req: Request;
}

export interface IUserServiceCreateUser {
	createUserDTO: CreateUserDTO;
}

export interface IUserServiceGetOneUserById {
	id: string;
}

export interface IUsersServiceUpdateUserPoint {
	id: string;
	status: boolean;
}
