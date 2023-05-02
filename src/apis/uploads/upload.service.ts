import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class uploadsService {
	async uploadsFile({ file }): Promise<string> {
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

			return upload.Location;
		} catch (error) {
			throw new Error(error);
		}
	}
}
