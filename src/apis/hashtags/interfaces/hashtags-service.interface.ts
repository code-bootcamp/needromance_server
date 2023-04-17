import { Hashtag } from '../entity/hashtag.entity';

export interface IHashtagsServiceFindByTags {
	tags: string[];
}

export interface IHashtagsServiceGetNewHashtags {
	duplicates: Hashtag[];
	hashtags: string[];
}

export interface IHashtagsServiceCreateHashtags {
	hashtags?: string[];
}
