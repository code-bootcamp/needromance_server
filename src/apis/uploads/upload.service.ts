import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { IUploadsServiceUploadsFile } from './interface/uploads-service.interface';

@Injectable()
export class uploadsService {
	async uploadsFile({ file }: IUploadsServiceUploadsFile) {
		AWS.config.update({
			region: 'ap-northeast-2',
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY,
				secretAccessKey: process.env.AWS_SECRET_KEY,
			},
		});
		try {
			const upload = await new AWS.S3() //
				.createBucket({ Bucket: 'needromance' })
				.promise();
			console.log(file);
			console.log('###');
			console.log(upload);
		} catch (error) {
			console.log(error);
		}
	}
}
