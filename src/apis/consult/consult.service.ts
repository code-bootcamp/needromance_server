import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { IConsultServiceAnswer } from './interface/consult-service.interface';

@Injectable()
export class ConsultService {
	async answer({ req, res }: IConsultServiceAnswer): Promise<string> {
		const configuration = new Configuration({
			apiKey: process.env.OPENAI_KEY,
		});

		const openAi = new OpenAIApi(configuration);
		const response = await openAi.createCompletion({
			model: 'text-davinci-003',
			prompt: `${req.body.question}`,
			suffix: '대화 상대는 심리치료가 필요한 사람이야,한국어로 답해줘',
			temperature: 1,
			top_p: 0.4,
			// stream: true,
			best_of: 1,
			// echo: false,
			frequency_penalty: 0.0,
			presence_penalty: 0.6,
			stop: [' Human:', ' AI:'],
			max_tokens: 1000,
		});

		return response.data.choices[0].text;
	}
}
