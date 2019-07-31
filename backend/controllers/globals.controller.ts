import {
	Authorized,
	BadRequestError,
	Body,
	BodyParam,
	Get,
	JsonController,
	Post
} from 'routing-controllers';
import { PushSubscription } from 'web-push';
import { ApplicationsStatus } from '../../shared/globals.enums';
import { Role } from '../../shared/user.enums';
import CONFIG from '../config';
import { Application } from '../models/application';
import { Globals, IGlobalsModel } from '../models/globals';
import { NotificationService } from '../services/notification.service';

@JsonController('/api/globals')
export class GlobalsController {
	constructor(private notificationService?: NotificationService) {}

	@Get('/')
	async getGlobals() {
		const globals: IGlobalsModel = await Globals.findOneAndUpdate(
			{},
			{},
			{ upsert: true, setDefaultsOnInsert: true, new: true }
		)
			.lean()
			.exec();
		return globals;
	}

	// TODO: Add tests
	@Post('/status')
	@Authorized([Role.ADMIN])
	async updateApplicationsStatus(@BodyParam('status') s: string) {
		const status = Object.values(ApplicationsStatus).find(stat => stat === s);
		if (!status) throw new BadRequestError('Invalid status');
		const globals: IGlobalsModel = await Globals.findOneAndUpdate(
			{},
			{ applicationsStatus: status },
			{ upsert: true, setDefaultsOnInsert: true, new: true }
		)
			.lean()
			.exec();
		return globals;
	}

	// TODO: Add tests
	@Post('/public')
	@Authorized([Role.ADMIN])
	async makeApplicationsPublic(@BodyParam('status') status: boolean) {
		const globals: IGlobalsModel = await Globals.findOneAndUpdate(
			{},
			{ applicationsPublic: status },
			{ upsert: true, setDefaultsOnInsert: true, new: true }
		)
			.lean()
			.exec();

		await Application.aggregate([
			{ $addFields: { statusPublic: '$statusInternal' } },
			{ $out: 'applications' }
		]);

		return globals;
	}

	@Post('/subscription')
	async subscribe(@Body() subscription: PushSubscription) {
		this.notificationService.registerNotification(subscription);
	}

	@Get('/vapid-public-key')
	getVapidPublicKey() {
		return CONFIG.VAPID_PUBLIC;
	}
}
