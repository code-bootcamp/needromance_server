import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadsService } from './upload.service';

@Controller('uploads')
export class UploadsController {
	constructor(
		private readonly uploadsService: uploadsService, //
	) {}
	@Post('/')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file) {
		return this.uploadsService.uploadsFile({ file });
	}
}
