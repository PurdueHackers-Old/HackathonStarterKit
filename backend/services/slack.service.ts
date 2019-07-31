import { Service } from 'typedi';
import axios from 'axios';
import CONFIG from '../config';
import { createLogger } from '../utils/logger';
import { IAnnouncementModel } from '../models/announcement';
import { InternalServerError } from 'routing-controllers';

@Service('slackService')
export class SlackService {
	logger = createLogger(this);

	async postMessage(announcement: IAnnouncementModel) {
		const { data } = await axios.get('https://slack.com/api/chat.postMessage', {
			params: {
				token: CONFIG.SLACK_TOKEN,
				channel: CONFIG.SLACK_CHANNEL_ID,
				text: announcement.body
			}
		});
		if (!data.ok) throw new InternalServerError(data.error);
		announcement.slackTS = data.ts;
		await announcement.save();
		return announcement;
	}

	async removeMessage(announcement: IAnnouncementModel) {
		const { data } = await axios.get('https://slack.com/api/chat.delete', {
			params: {
				token: CONFIG.SLACK_TOKEN,
				channel: CONFIG.SLACK_CHANNEL_ID,
				ts: announcement.slackTS
			}
		});
		if (!data.ok && data.error !== 'message_not_found')
			throw new InternalServerError(data.error);
		return announcement;
	}
}
