import { Document, Schema, model } from 'mongoose';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnouncementLabel } from '../../shared/announcement.enums';

export class AnnouncementDto {
	@Type(() => String)
	@IsNotEmpty({ message: 'A title is required' })
	title: string;

	@Type(() => String)
	@IsNotEmpty({ message: 'The body of the announcement is required' })
	body: string;

	@IsNotEmpty({ message: 'Please provide a label for the announcement' })
	@IsEnum(AnnouncementLabel, { message: 'Please provide a valid announcement label', each: true })
	labels: AnnouncementLabel[];
}

export interface IAnnouncementModel extends AnnouncementDto, Document {
	released: boolean;
	slackTS: string;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema(
	{
		title: { type: String, required: true },
		body: { type: String, required: true },
		labels: { type: [String], required: true },
		released: { type: Boolean, default: false },
		slackTS: { type: String, default: '' }
	},
	{ timestamps: true }
);

export const Announcement = model<IAnnouncementModel>('Announcement', schema, 'announcements');
