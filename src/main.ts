import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	await app.listen(3100, () => {
		console.log('💞💞💞로맨스가 필요해💞💞💞');
	});
}
bootstrap();
