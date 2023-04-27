import { Request } from 'express';
import { IAuthUser } from 'src/apis/auth/interfaces/auth-services.interface';

export interface IAdminServiceFetchUsers {
	req: Request & IAuthUser;
}

export interface IAdminServiceFetchBoards {
	req: Request & IAuthUser;
}

export interface IAdminServiceSearchUsers {
	req: Request & IAuthUser;
}
