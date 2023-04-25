import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAnswerDTO {
	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '문자열을 입력해주세요.',
	})
	contents: string;
}
