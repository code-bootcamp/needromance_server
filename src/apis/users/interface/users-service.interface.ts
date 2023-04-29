import { Request } from 'express';
import { IAuthUser } from 'src/apis/auth/interfaces/auth-services.interface';
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

export interface IUserServiceGetOneUserByNickname {
	nickname: string;
}

export interface IUserServiceCreateUser {
	createUserDTO: CreateUserDTO;
}

export interface IUserServiceDeleteUser {
	req: Request & IAuthUser;
}

export interface IUserServiceUpdateUser {
	req: Request & IAuthUser;
}

export interface IUserServiceRstorePassword {
	req: Request;
}

export interface IUserServiceFetchUser {
	req: Request & IAuthUser;
}

export interface IUserServiceGetOneUserById {
	id: string;
}

export interface IUsersServiceUpdateUserPoint {
	id: string;
	status: boolean;
}

export interface IUsersServiceGetTopUsers {
	sort: string;
}

export interface IUserServiceSearchUserByKeyword {
	keyword: string;
}

export interface IUserServiceManageStatus {
	id: string;
}
export interface IUSerServiceFetchMyBoards {
	req: Request & IAuthUser;
}
