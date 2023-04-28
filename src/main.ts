import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerDocumentConfig } from './apis/swagger.document';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.enableCors({
		credentials: true,
		origin: process.env.FRONTEND_URL, //
	});

	const swaggerConfig = new SwaggerDocumentConfig().initializeOptions();
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api', app, swaggerDocument);

	await app.listen(3100, () => {
		console.log('💞💞💞로맨스가 필요해💞💞💞');
	});
}
bootstrap();
