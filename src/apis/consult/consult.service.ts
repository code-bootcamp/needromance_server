import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { IConsultServiceAnswer } from './interface/consult-service.interface';

@Injectable()
export class ConsultService {
	async answer({ req, res }: IConsultServiceAnswer): Promise<string> {
		const configuration = new Configuration({
			organization: process.env.OPENAI_ORGANIZATION,
			apiKey: process.env.OPENAI_KEY,
		});
		const openAi = new OpenAIApi(configuration);
		try {
			const completion = await openAi.createCompletion({
				model: 'text-davinci-003',
				prompt: `${req.body.question}`,
				top_p: 0.2,
				n: 1,
				echo: true,
				best_of: 1,

				frequency_penalty: 0.0,
				presence_penalty: 0.6,
				stop: [' Human:', ' AI:'],
				max_tokens: 500,
			});

			console.log(completion.data.choices[0]);
			res.send(completion.data.choices[0].text);
			return completion.data.choices[0].text;
		} catch (error) {
			if (error.response) {
				console.log(error.response.status);
				console.log(error.response.data);
			} else {
				console.log(error.message);
			}
		}
	}
}
