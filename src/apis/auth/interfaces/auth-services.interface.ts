import { Request, Response } from 'express';
import { User } from 'src/apis/users/entity/user.entity';
import { ObjectLiteral } from 'typeorm';

export interface IAuthServiceSignIn {
	req: Request;
	res: Response;
}

export interface IAuthUser {
	user?: {
		id: string;
		role: string;
		nickname: string;
		email: string;
	};
}

export interface IAuthServiceGetAccessToken {
	user: User;
}

export interface IAuthServiceSetRefreshToken {
	user: User | ObjectLiteral;
	res: Response;
}

export interface IAuthServiceSetAdminRefreshToken {
	res: Response;
}

export interface IAuthServiceLogout {
	req: Request & IAuthUser;
}

export interface IAuthServiceRestoreToken {
	req: Request & IAuthUser;
}

export interface IAuthServiceSocialLogin {
	req: Request & IOAuthUser;
	res: Response;
}

export interface IAuthServiceSocialNickname {
	req: Request & IAuthUser;
}
export interface IOAuthUser {
	user: {
		email: string;
		role: string;
	};
}
