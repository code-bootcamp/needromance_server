import { Request } from 'express';
import { CreateUserDTO } from '../dto/create-user.dto';

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