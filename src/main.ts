import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.enableCors({
		credentials: true,
		origin: process.env.FRONTEND_URL, //
	});
	await app.listen(3100, () => {
		console.log('💞💞💞로맨스가 필요해💞💞💞');
	});
}
bootstrap();
