import { Document, Schema, model } from 'mongoose';
import { IUserModel } from './user';
import { IsNotEmpty } from 'class-validator';
import { PushSubscription } from 'web-push';

export class SubscriptionDto {
	@IsNotEmpty({ message: 'Please include the subscription' })
	content: PushSubscription;
}

export interface ISubscriptionModel extends SubscriptionDto, Document {
	user: IUserModel;
}

const schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false
	},
	content: {
		endpoint: String,
		keys: {
			auth: String,
			p256dh: String
		}
	}
});

export const Subscription = model<ISubscriptionModel>('Subscription', schema, 'subscriptions');
