import {
	Authorized,
	Body,
	Delete,
	Get,
	JsonController,
	Param,
	Post,
	QueryParam
} from 'routing-controllers';
import { Role } from '../../shared/user.enums';
import { Announcement, AnnouncementDto } from '../models/announcement';
import { NotificationService } from '../services/notification.service';
import { SlackService } from '../services/slack.service';

// TODO: Add tests
@JsonController('/api/announcements')
export class AnnouncementController {
	constructor(
		private notificationService?: NotificationService,
		private slackService?: SlackService
	) {}

	@Get('/')
	async getAll(@QueryParam('type') type?: string, @QueryParam('released') released?: boolean) {
		const conditions: {
			released?: boolean;
			type?: string;
		} = {};
		if (released !== undefined && released !== null) conditions.released = released;
		if (type) conditions.type = type;

		const resultsQuery = Announcement.find(conditions).sort({ updatedAt: -1 });
		const results = await resultsQuery.exec();
		return results;
	}

	// TODO: Create cron job to dispatch sending of announcement notifications
	@Post('/')
	@Authorized([Role.EXEC])
	createAnnouncement(@Body() announcement: AnnouncementDto) {
		return Announcement.create(announcement);
	}

	@Post('/:id/release')
	@Authorized([Role.EXEC])
	async releaseAnnouncement(@Param('id') id: string) {
		const announcement = await Announcement.findByIdAndUpdate(id, { released: true }).exec();
		await this.notificationService.sendNotifications(
			JSON.stringify({ action: 'add', announcement })
		);
		await this.slackService.postMessage(announcement);
		return announcement;
	}

	@Delete('/:id')
	@Authorized([Role.EXEC])
	async deleteAnnouncement(@Param('id') id: string) {
		const announcement = await Announcement.findByIdAndDelete(id).exec();
		await this.notificationService.sendNotifications(
			JSON.stringify({ action: 'delete', announcement })
		);
		await this.slackService.removeMessage(announcement);
		return announcement;
	}
}
