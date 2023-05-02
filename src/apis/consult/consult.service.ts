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
		console.log(req.user);
		console.log('##');
		const openAi = new OpenAIApi(configuration);
		try {
			const completion = await openAi.createCompletion({
				model: 'text-davinci-003',
				prompt: req.body.question,
				top_p: 0.2,
				n: 1,
				echo: true,
				best_of: 1,
				presence_penalty: 0.1,
				max_tokens: 500,
				// user: req.user.id as string,
			});

			res.send(completion.data.choices[0].text.split('\n\n')[1]);
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
