import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

class GoogleAuthGuard extends AuthGuard('google') {}

const googleAuthGuard = new GoogleAuthGuard();

export class DynamicAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const { social } = context.switchToHttp().getRequest().params;
		if (social === 'google') {
			return googleAuthGuard.canActivate(context);
		}
	}
}
