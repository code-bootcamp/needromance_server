import { Module } from '@nestjs/common';
import { UploadsController } from './upload.controller';
import { uploadsService } from './upload.service';

@Module({
	imports: [
		//
	],
	controllers: [
		UploadsController,
		//
	],
	providers: [
		uploadsService,
		//
	],
})
export class UploadsModule {}
