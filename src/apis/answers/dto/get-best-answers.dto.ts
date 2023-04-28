import { ApiProperty } from '@nestjs/swagger';

export class GetBestAnswers {
	@ApiProperty()
	userImg: string;

	@ApiProperty()
	nickname: string;

	@ApiProperty()
	contents: string;

	@ApiProperty()
	likes: number;

	constructor(
		userImg: string, //
		nickname: string,
		contents: string,
		likes: number,
	) {
		this.userImg = userImg;
		this.nickname = nickname;
		this.contents = contents;
		this.likes = likes;
	}
}
