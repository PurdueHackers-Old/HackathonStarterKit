import {
	Authorized,
	BadRequestError,
	BodyParam,
	Get,
	JsonController,
	Post,
	QueryParam
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Inject } from 'typedi';
import { Status } from '../../shared/app.enums';
import { Role } from '../../shared/user.enums';
import { Globals } from '../models/globals';
import { User, UserDto } from '../models/user';
import { EmailService } from '../services/email.service';
import { escapeRegEx, getUsersWithApplicationStatus } from '../utils';

@JsonController('/api/admin')
export class AdminController {
	@Inject() private emailService: EmailService;

	@Get('/users')
	@Authorized([Role.ADMIN])
	@ResponseSchema(UserDto, {
		description: 'A list of users that matches an email',
		isArray: true
	})
	async getUsers(@QueryParam('email') email: string = '') {
		const query = { email: new RegExp(escapeRegEx(email), 'i') };
		const results = await User.find(query)
			.limit(10)
			.exec();
		return results;
	}

	@Post('/role')
	@Authorized([Role.ADMIN])
	@ResponseSchema(UserDto, { description: 'Updates the role of a user' })
	async updateRole(@BodyParam('email') email?: string, @BodyParam('role') r?: string) {
		if (!email) throw new BadRequestError('Please provide an email');

		const role = Object.values(Role).find(ro => ro === r);
		if (!role) throw new BadRequestError('Invalid Role');

		const user = await User.findOne({ email }).exec();
		if (!user) throw new BadRequestError(`There is no user with email: ${email}`);

		user.role = role;
		await user.save();
		return user;
	}

	@Post('/emails')
	@Authorized([Role.ADMIN])
	async sendMassEmails() {
		const [accepted, rejected, waitlisted] = await Promise.all([
			getUsersWithApplicationStatus(Status.ACCEPTED),
			getUsersWithApplicationStatus(Status.REJECTED),
			getUsersWithApplicationStatus(Status.WAITLIST)
		]);

		await Promise.all([
			this.emailService.sendAcceptanceEmails(accepted),
			this.emailService.sendRejectedEmails(rejected),
			this.emailService.sendWaitlistedEmails(waitlisted)
		]);

		await Globals.findOneAndUpdate(
			{},
			{ emailsSent: new Date() },
			{ upsert: true, setDefaultsOnInsert: true }
		)
			.lean()
			.exec();

		return { accepted, rejected, waitlisted };
	}
}
