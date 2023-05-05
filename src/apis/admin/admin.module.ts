import { Module } from '@nestjs/common';
import { BoardsModule } from '../boards/boards.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
	imports: [
		BoardsModule,
		UsersModule, //
	],
	controllers: [
		AdminController, //
	],
	providers: [
		AdminService,
		//
	],
	exports: [
		AdminService, //
	],
})
export class AdminModule {}
