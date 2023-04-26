import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: [
			'http://localhost:3000', //
			'http://127.0.0.1:3000', //
			'https://need-romance.site', //
		],
	});
	await app.listen(3100, () => {
		console.log('💞💞💞로맨스가 필요해💞💞💞');
	});
}
bootstrap();
