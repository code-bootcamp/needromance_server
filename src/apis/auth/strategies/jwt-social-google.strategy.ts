import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		console.log('###23r');
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_SECRET,
			callbackURL: 'http://localhost:3000/auth/login/google',
			scope: ['email', 'profile'],
		});
		console.log('##');
	}

	validate(accessToken: string, refreshToken: string, profile: Profile) {
		return {
			email: profile._json.email,
			role: 'user',
		};
	}
}
