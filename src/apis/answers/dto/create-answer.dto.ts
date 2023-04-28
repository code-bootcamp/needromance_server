import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDTO {
	@ApiProperty({
		example: '상황이 별로 좋아 보이지 않네요.. 이럴 때는...',
		description: '게시글의 답변 내용(문자열)',
	})
	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '내용을 문자열로 입력해주세요.',
	})
	contents: string;

	@ApiProperty({
		example: '1',
		description: '답변을 추가할 게시글 id(정수)',
	})
	@IsNotEmpty({
		message: '게시글 id를 입력해주세요.',
	})
	@IsInt({
		message: '게시글 id를 정수로 입력해주세요.',
	})
	boardId: number;
}
