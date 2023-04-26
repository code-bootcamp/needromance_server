import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateAnswerStatusDTO {
	@IsNotEmpty({
		message: '게시글 id를 입력해주세요.',
	})
	@IsInt({
		message: '게시글 id를 정수로 입력해주세요.',
	})
	boardId: number;

	@IsNotEmpty({
		message: '채택 여부를 입력해주세요.',
	})
	@IsBoolean({
		message: '채택 여부를 true 또는 false로 입력해주세요.',
	})
	status: boolean;
}
