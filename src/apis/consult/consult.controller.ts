import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { restAuthGuard } from '../auth/guard/jwt-auth-quard';
import { IAuthUser } from '../auth/interfaces/auth-services.interface';
import { ConsultService } from './consult.service';

@Controller('consult')
export class ConsultController {
	constructor(
		private readonly consultService: ConsultService, //
	) {}

	@Post('/question')
	@UseGuards(restAuthGuard('access'))
	question(
		@Req() req: Request & IAuthUser, //
		@Res() res: Response,
	): Promise<string> {
		return this.consultService.answer({ req, res });
	}
}
