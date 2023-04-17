import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './entity/hashtag.entity';
import { HashtagsService } from './hashtags.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Hashtag, //
		]),
	],
	providers: [
		HashtagsService, //
	],
	exports: [
		HashtagsService, //
	],
})
export class HashtagsModule {}
