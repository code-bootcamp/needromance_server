import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entity/hashtag.entity';
import { Repository } from 'typeorm';
import {
	IHashtagsServiceCreateHashtags,
	IHashtagsServiceFindByTags,
	IHashtagsServiceGetNewHashtags,
} from './interfaces/hashtags-service.interface';

@Injectable()
export class HashtagsService {
	constructor(
		@InjectRepository(Hashtag)
		private readonly hashtagsRepository: Repository<Hashtag>, //
	) {}

	/**
	 * (해시태그 사용) 해시태그 조회 서비스 로직.
	 * @param tags 해시태그 문자열 배열
	 * @returns 해시태그로 조회한 해시태그 배열
	 */
	async findByTags({ tags }: IHashtagsServiceFindByTags): Promise<Hashtag[]> {
		const queryBuilder = this.hashtagsRepository.createQueryBuilder('hashtag');
		return queryBuilder.where('hashtag.tag IN (:...tags)', { tags }).getMany();
	}

	/**
	 * 이미 존재하는 해시태그를 제외하고, 새로운 해시태그를 생성해 배열로 반환하는 서비스 로직.
	 * @param duplicates 해시태그로 조회했을 때 이미 존재하는 해시태그 배열
	 * @param hashtags 해시태그 문자열 배열
	 * @returns 새롭게 생성한 해시태그 배열
	 */
	getNewHashtags({ duplicates, hashtags }: IHashtagsServiceGetNewHashtags): Hashtag[] {
		const newHashtags: Hashtag[] = [];

		hashtags.forEach((tag: string) => {
			let index = -1;

			if (duplicates.length > 0) {
				index = duplicates.findIndex((duplicate: Hashtag) => duplicate.tag === tag);
			}

			if (index === -1) {
				const newHashtag: Hashtag = this.hashtagsRepository.create({ tag });
				newHashtags.push(newHashtag);
			}
		});
		return newHashtags;
	}

	/**
	 * 해시태그 중복 검사 후 새로운 해시태그 생성. 중복된 해시태그 배열과 새롭게 생성한 해시태그 배열을 결합해 리턴.
	 * @param hashtags 해시태그 문자열 배열
	 * @returns 이미 존재하는 해시태그와 새롭게 생성한 해시태그를 결합한 배열. hashtags가 null인 경우 null 리턴.
	 */
	async createHashtags({ hashtags }: IHashtagsServiceCreateHashtags): Promise<Hashtag[]> {
		if (!hashtags || hashtags.length === 0) {
			return null;
		}

		if (hashtags.length === 1 && hashtags.at(0) === '') {
			return null;
		}

		const duplicates: Hashtag[] = await this.findByTags({ tags: hashtags });
		const newHashtags: Hashtag[] = this.getNewHashtags({ duplicates, hashtags });

		await this.hashtagsRepository.insert(newHashtags);
		return [...duplicates, ...newHashtags];
	}
}
