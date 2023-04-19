import { Request, Response } from 'express';
import { User } from 'src/apis/users/entity/user.entity';

export interface IAuthServiceSignIn {
	req: Request;
	res: Response;
}

export interface IAuthUser {
	user?: {
		id: string;
	};
}

export interface IAuthServiceGetAccessToken {
	user: User;
}

export interface IAuthServiceSetRefreshToken {
	user: User;
	res: Response;
}

export interface IAuthServiceSetAdminRefreshToken {
	res: Response;
}

export interface IAuthServiceLogout {
	req: Request & IAuthUser;
	// res: Response;
}
