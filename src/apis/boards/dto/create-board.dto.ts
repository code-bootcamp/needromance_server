import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDTO {
	@ApiProperty({
		example: '연애 상담이 필요합니다.',
		description: '게시글 제목(문자열)',
	})
	@IsNotEmpty({
		message: '제목을 입력해주세요.',
	})
	@IsString({
		message: '제목을 문자열로 입력해주세요.',
	})
	title: string;

	@ApiProperty({
		example: '지금 여자친구와 싸우고 아무 말도 하지 않는 상황...',
		description: '게시글 내용(문자열)',
	})
	@IsNotEmpty({
		message: '내용을 입력해주세요.',
	})
	@IsString({
		message: '내용을 문자열로 입력해주세요.',
	})
	contents: string;

	@ApiPropertyOptional({
		type: [String],
		example: `['#연애', '#상담']`,
		description: '게시글 해시태그(문자열 배열)',
	})
	hashtags?: string[];
}
