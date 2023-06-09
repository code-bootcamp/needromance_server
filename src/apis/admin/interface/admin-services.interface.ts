import { UserRole } from 'aws-sdk/clients/workmail';
import { Request } from 'express';
import { IAuthUser } from 'src/apis/auth/interfaces/auth-services.interface';

export interface IAdminServiceFetchAdmin {
	email: string;
}

export interface IAdminServiceSignup {
	req: Request;
}

export interface IAdminServiceFetchUsers {
	req: Request & IAuthUser;
}

export interface IAdminServiceIsAdmin {
	role: UserRole;
}
export interface IAdminServiceFetchBoards {
	req: Request & IAuthUser;
}

export interface IAdminServiceSearchUsers {
	req: Request & IAuthUser;
}

export interface IAdminServiceManagesStatus {
	req: Request & IAuthUser;
}

export interface IAdminServiceSearchBoards {
	req: Request & IAuthUser;
}

export interface IAdminServiceDeleteBoards {
	req: Request & IAuthUser;
	id: number;
}
