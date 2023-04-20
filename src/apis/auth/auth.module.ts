import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { JwtGoogleStrategy } from './strategies/jwt-social-google.strategy';

@Module({
	imports: [
		UsersModule, //
		JwtModule.register({
			global: true,
		}),
	],
	providers: [
		AuthService, //
		JwtAccessStrategy,
		JwtRefreshStrategy,
		JwtGoogleStrategy,
	],
	controllers: [
		AuthController, //
	],
})
export class AuthModule {}
