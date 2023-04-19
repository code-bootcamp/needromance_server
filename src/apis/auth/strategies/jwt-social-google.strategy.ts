// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, Profile } from 'passport-google-oauth20';

// export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
// 	constructor() {
// 		super({
// 			clientID: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_SECRET,
// 			callbackURL: 'https://eatsme.site/login/google',
// 			scope: ['email', 'profile'],
// 		});
// 	}

// 	validate(accessToken: string, refreshToken: string, profile: Profile) {
// 		return {
// 			name: profile.displayName,
// 			email: profile._json.email,
// 			nickname: profile._json.given_name,
// 			password: 0,
// 		};
// 	}
// }
