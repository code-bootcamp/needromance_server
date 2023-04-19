import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
	imports: [
		UsersModule, //
	],
	providers: [
		AdminService,
		//
	],
	controllers: [
		AdminController, //
	],
})
export class AdminModule {}
