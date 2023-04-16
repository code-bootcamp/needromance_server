import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './apis/boards/boards.module';

@Module({
	imports: [
		BoardsModule,
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			type: process.env.DATABASE_TYPE as 'mysql',
			host: process.env.DATABASE_HOST,
			port: Number(process.env.DATABASE_PORT),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_DATABASE,
			entities: [__dirname + '/apis/**/*.entity.*'],
			synchronize: true,
			logging: true,
		}),
		CacheModule.register<RedisClientOptions>({
			store: redisStore,
			url: `redis://${process.env.REDIS_DATABASE_HOST}:6379`,
			isGlobal: true,
		}),
	],
	controllers: [
		AppController, //
	],
	providers: [
		AppService, //
	],
})
export class AppModule {}
