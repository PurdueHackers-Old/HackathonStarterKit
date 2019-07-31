import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Logger as PinoLogger } from 'pino';
import {
	BadRequestError,
	Body,
	BodyParam,
	Get,
	JsonController,
	Post,
	Req,
	UnauthorizedError
} from 'routing-controllers';
import { isEmail } from 'validator';
import CONFIG from '../config';
import { User, UserDto } from '../models/user';
import { EmailService } from '../services/email.service';
import { extractToken, signToken } from '../utils';
import { Logger } from '../utils/logger';

@JsonController('/api/auth')
export class AuthController {
	@Logger() logger: PinoLogger;
	constructor(private emailService?: EmailService) {}

	@Post('/signup')
	async signup(
		@BodyParam('password') password: string,
		@BodyParam('passwordConfirm') passwordConfirm: string,
		@Body() userDto: UserDto
	) {
		if (!password || password.length < 5)
			throw new BadRequestError('A password longer than 5 characters is required');
		if (!passwordConfirm) throw new BadRequestError('Please confirm your password');
		if (passwordConfirm !== password) throw new BadRequestError('Passwords did not match');
		userDto.password = password;

		const exists = await User.findOne({ email: userDto.email }).exec();
		if (exists) throw new BadRequestError('An account already exists with that email');

		const user = new User(userDto);
		await user.save();
		const u = user.toJSON();
		delete u.password;
		const token = signToken(u);

		return {
			user: u,
			token
		};
	}

	@Post('/login')
	async login(@Body() body: { email: string; password: string }) {
		const { email, password } = body;
		const user = await User.findOne({ email }, '+password').exec();
		if (!user) throw new UnauthorizedError('User not found');

		// Check if password matches
		if (!(await user.comparePassword(password))) throw new UnauthorizedError('Wrong password');

		const u = user.toJSON();
		delete u.password;

		// If user is found and password is correct, create a token
		const token = signToken(u);
		return {
			user: u,
			token
		};
	}

	@Get('/refresh')
	async refresh(@Req() req: Request) {
		// Renew user's auth token
		let token = extractToken(req);
		if (!token || token === 'null' || token === 'undefined')
			throw new UnauthorizedError('No token provided');
		const payload: any = jwt.decode(token);
		if (!payload || !payload._id || !ObjectId.isValid(payload._id))
			throw new UnauthorizedError('Invalid token');
		const user = await User.findById(payload._id)
			.lean()
			.exec();
		if (!user) throw new UnauthorizedError('User not found');
		token = signToken(user);
		this.logger.info('Refreshing token');
		return { user, token };
	}

	@Post('/forgot')
	async forgot(@Body() body: { email: string }) {
		const { email } = body;
		if (!email || !isEmail(email)) throw new BadRequestError('Please provide a valid email');
		const user = await User.findOne({ email }).exec();
		if (!user) throw new BadRequestError(`There is no user with the email: ${email}`);
		const token = jwt.sign({ id: user._id }, CONFIG.SECRET, { expiresIn: '2 days' });
		user.resetPasswordToken = token;
		await user.save();
		await this.emailService.sendResetEmail(user);
		return `A link to reset your password has been sent to: ${email}`;
	}

	@Post('/reset')
	async reset(@Body() body: { password: string; passwordConfirm: string; token: string }) {
		const { password, passwordConfirm, token } = body;
		if (!password || password.length < 5)
			throw new BadRequestError('A password longer than 5 characters is required');
		if (!passwordConfirm) throw new BadRequestError('Please confirm your password');
		if (passwordConfirm !== password) throw new BadRequestError('Passwords did not match');

		if (!token) throw new UnauthorizedError('Invalid reset password token');
		let payload: { id: string };
		try {
			payload = jwt.verify(token, CONFIG.SECRET) as any;
		} catch (error) {
			throw new UnauthorizedError('Invalid reset password token');
		}
		if (!payload) throw new UnauthorizedError('Invalid reset password token');
		const { id } = payload;
		if (!id || !ObjectId.isValid(id))
			throw new BadRequestError('Reset password token corresponds to an invalid user');
		const user = await User.findById(id)
			.select('+resetPasswordToken')
			.exec();
		if (!user)
			throw new BadRequestError('Reset password token corresponds to a non existing user');
		if (user.resetPasswordToken !== token)
			throw new UnauthorizedError('Wrong reset password token for this user');
		user.password = password;
		user.resetPasswordToken = '';
		await user.save();
		return `Successfully changed password for: ${user.name}`;
	}
}
