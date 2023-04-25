import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDTO {
	@IsNotEmpty({
		message: '제목을 입력해주세요.',
	})
	@IsString({
		message: '제목을 문자열로 입력해주세요.',
	})
	title: string;

	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '내용을 문자열로 입력해주세요.',
	})
	contents: string;

	hashtags?: string[];
}
