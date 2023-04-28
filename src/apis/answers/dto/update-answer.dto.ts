import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAnswerDTO {
	@ApiProperty({
		example: '이럴 때는 이렇게 하는게 좋아 보입니다...',
		description: '수정할 답변 내용',
	})
	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '문자열을 입력해주세요.',
	})
	contents: string;
}
