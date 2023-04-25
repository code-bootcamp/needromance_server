import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDTO {
	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '문자열을 입력해주세요.',
	})
	contents: string;

	@IsNotEmpty({
		message: '게시글 id를 입력해주세요.',
	})
	@IsInt({
		message: '정수를 입력해주세요.',
	})
	boardId: number;
}
