import { setVapidDetails, sendNotification, PushSubscription, WebPushError } from 'web-push';
import CONFIG from '../config';
import { IUserModel } from '../models/user';
import { Service, Inject } from 'typedi';
import { Subscription } from '../models/subscription';
import { EmailService } from './email.service';
import { createLogger } from '../utils/logger';

setVapidDetails('https://example.com', CONFIG.VAPID_PUBLIC, CONFIG.VAPID_PRIVATE);

@Service('notificationService')
export class NotificationService {
	@Inject() emailService: EmailService;
	logger = createLogger(this);

	async registerNotification(subscription: PushSubscription, user?: IUserModel) {
		const result = await Subscription.updateOne(
			{ 'content.endpoint': subscription.endpoint },
			{
				user,
				content: subscription
			},
			{ upsert: true }
		);
		if (result.upserted && result.upserted.length > 0) {
			await sendNotification(subscription, 'Successfully Subscribed!');
		}
	}

	async sendNotifications(content: string, user?: IUserModel) {
		const subscriptions = await Subscription.find(user ? { user } : {}).exec();
		for (const subscription of subscriptions) {
			try {
				await sendNotification(subscription.content, content);
			} catch (error) {
				if (!(error instanceof WebPushError)) {
					this.logger.emerg('Error sending push notification:', error);
					this.emailService
						.sendErrorEmail(error)
						.then(() => this.logger.info('Email sent'))
						.catch(err => this.logger.error('Error sending email:', err));
				}
				if (error.statusCode === 410 || error.statusCode === 404) {
					await Subscription.findOneAndDelete({ 'content.endpoint': error.endpoint });
					this.logger.info('Removed subscription endpoint:', error.endpoint);
				}
			}
		}
	}
}
