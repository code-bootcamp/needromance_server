import { AuthGuard } from '@nestjs/passport';

export const restAuthGuard = (name) => {
	return class restAuthGuard extends AuthGuard(name) {};
};
