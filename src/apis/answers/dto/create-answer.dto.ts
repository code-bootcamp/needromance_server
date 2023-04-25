import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDTO {
	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '내용을 문자열로 입력해주세요.',
	})
	contents: string;

	@IsNotEmpty({
		message: '게시글 id를 입력해주세요.',
	})
	@IsInt({
		message: '게시글 id를 정수로 입력해주세요.',
	})
	boardId: number;
}
