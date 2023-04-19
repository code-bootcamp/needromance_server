import { Request } from 'express';

export interface IAuthUser {
	user?: {
		id: string;
		role: string;
		nickname: string;
		email: string;
	};
}

export interface IAuthRequest {
	req: Request & IAuthUser;
}
