import { DocumentBuilder } from '@nestjs/swagger';

export class SwaggerDocumentConfig {
	builder = new DocumentBuilder();

	initializeOptions() {
		return this.builder
			.setTitle('로맨스가 필요해')
			.setDescription('로맨스가 필요해 API 정의서')
			.setVersion('1.0.0')
			.build();
	}
}
