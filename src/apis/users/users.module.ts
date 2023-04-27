import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BoardsModule } from '../boards/boards.module';
import { AnswersModule } from '../answers/answers.module';
import { Admin } from '../admin/entity/admin.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User, //
			Admin,
		]),
		forwardRef(() => AnswersModule),
		forwardRef(() => BoardsModule),
	],
	controllers: [
		UsersController, //
	],
	providers: [
		UsersService, //
	],
	exports: [
		UsersService, //
	],
})
export class UsersModule {}
