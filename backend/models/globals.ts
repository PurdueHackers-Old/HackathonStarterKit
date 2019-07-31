import { Document, Schema, model } from 'mongoose';
import { ApplicationsStatus } from '../../shared/globals.enums';

export interface IGlobalsModel extends Document {
	applicationsStatus: ApplicationsStatus;
	applicationsPublic: boolean;
	hackingTimeStart: Date;
	hackingTimeEnd: Date;
	emailsSent: Date;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema(
	{
		applicationsStatus: {
			type: String,
			enum: Object.values(ApplicationsStatus),
			default: ApplicationsStatus.OPEN
		},
		applicationsPublic: { type: Boolean, default: false },
		// TODO: Change start and end hacking time
		hackingTimeStart: { type: Date, default: new Date('September 14, 2019 12:0:00 EST') },
		hackingTimeEnd: { type: Date, default: new Date('September 15, 2019 12:0:00 EST') },
		emailsSent: { type: Date, default: null }
	},
	{ timestamps: true }
);

export const Globals = model<IGlobalsModel>('Globals', schema, 'globals');
