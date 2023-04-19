import { Request } from 'express';
import { IAuthUser } from 'src/apis/auth/interfaces/auth-services.interface';

export interface IAdminServiceFetchUsers {
	req: Request & IAuthUser;
}
