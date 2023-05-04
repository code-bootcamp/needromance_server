import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadsService } from './upload.service';
import { Express } from 'express';

@Controller('uploads')
export class UploadsController {
	constructor(
		private readonly uploadsService: uploadsService, //
	) {}
	@Post('/')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		return this.uploadsService.uploadsFile({ file });
	}
}
