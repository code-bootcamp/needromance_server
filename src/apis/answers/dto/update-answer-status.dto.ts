import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateAnswerStatusDTO {
	@ApiProperty({
		example: '1',
		description: '채택하려는 답변의 게시글 id(정수)',
	})
	@IsNotEmpty({
		message: '게시글 id를 입력해주세요.',
	})
	@IsInt({
		message: '게시글 id를 정수로 입력해주세요.',
	})
	boardId: number;

	@ApiProperty({
		example: 'true',
		description: '채택 여부(true - 채택, false - 채택 취소)',
	})
	@IsNotEmpty({
		message: '채택 여부를 입력해주세요.',
	})
	@IsBoolean({
		message: '채택 여부를 true 또는 false로 입력해주세요.',
	})
	status: boolean;
}
