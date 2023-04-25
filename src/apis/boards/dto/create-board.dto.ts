import { IsNotEmpty } from 'class-validator';

export class CreateBoardDTO {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	contents: string;

	hashtags?: string[];
}
