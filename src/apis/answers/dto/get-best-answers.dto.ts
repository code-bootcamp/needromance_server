export class GetBestAnswers {
	userImg: string;
	nickname: string;
	contents: string;
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
