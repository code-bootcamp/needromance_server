import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { IUploadsServiceUploadsFile } from './interface/uploads-service.interface';

@Injectable()
export class uploadsService {
	async uploadsFile({ file }: IUploadsServiceUploadsFile) {
		const AWS_S3_BUCKET = 'needromance';
		const params = {
			Bucket: AWS_S3_BUCKET,
			Key: `${Date.now() + file.originalname}`,
			Body: file.buffer,
		};
		AWS.config.update({
			region: 'ap-northeast-2',
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY,
				secretAccessKey: process.env.AWS_SECRET_KEY,
			},
		});
		try {
			const upload = await new AWS.S3() //
				.upload(params)
				.promise();
			return upload;
		} catch (error) {
			throw new Error(error);
		}
	}
}
