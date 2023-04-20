import { Request, Response } from 'express';
import { IAuthUser } from 'src/apis/auth/interfaces/auth-services.interface';

export interface IConsultServiceAnswer {
	req: Request & IAuthUser; //
	res: Response;
}
