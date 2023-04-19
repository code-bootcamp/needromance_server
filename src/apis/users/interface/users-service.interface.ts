import { Request } from 'express';
import { IAuthUser } from 'src/apis/auth/interfaces/auth-services.interface';
import { IAuthRequest } from 'src/commons/interface';
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

export interface IUserServiceDeleteUser {
	req: Request & IAuthUser;
}

export interface IUserServiceUpdateUser {
	req: Request & IAuthUser;
}

export interface IUserServiceRstorePassword {
	req: Request;
}
