import { Module } from '@nestjs/common';
// import { UploadsController } from './upload.controller';
import { uploadsService } from './upload.service';

@Module({
	controllers: [
		// UploadsController,
		//
	],
	providers: [
		uploadsService,
		//
	],
	exports: [
		uploadsService, //
	],
})
export class UploadsModule {}
