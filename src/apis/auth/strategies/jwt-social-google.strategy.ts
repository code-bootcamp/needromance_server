import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		console.log('@@@@@');
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_SECRET,
			callbackURL: 'https://needromance.online/',
			scope: ['email', 'profile'],
		});
	}

	validate(accessToken: string, refreshToken: string, profile: Profile) {
		console.log(profile);
		return {
			email: profile._json.email,
			role: 'user',
		};
	}
}
