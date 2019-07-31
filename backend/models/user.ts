import * as bcrypt from 'bcrypt';
import { Document, Schema, model } from 'mongoose';
import { IsEmail, Matches, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IApplicationModel } from './application';
import { Role } from '../../shared/user.enums';

@Exclude()
export class UserDto {
	@IsNotEmpty({ message: 'Please provide your first and last name' })
	@Matches(/([a-zA-Z']+ )+[a-zA-Z']+$/, { message: 'Please provide your first and last name' })
	@Expose()
	name: string;

	@IsNotEmpty({ message: 'Please provide a valid email address' })
	@IsEmail({}, { message: 'Please provide a valid email address' })
	@Expose()
	email: string;
	@Exclude()
	password: string;
	@Exclude()
	resetPasswordToken?: string;
	async comparePassword(password: string) {
		return password && (await bcrypt.compare(password, this.password));
	}
}

export interface IUserModel extends UserDto, Document {
	role: Role;
	application: IApplicationModel;
	checkedin: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			unique: true,
			required: true
		},
		password: {
			type: String,
			select: false,
			required: true
		},
		role: { type: String, enum: Object.keys(Role), default: Role.USER },
		checkedin: { type: Boolean, default: false },
		resetPasswordToken: { type: String, select: false },

		application: {
			type: Schema.Types.ObjectId,
			ref: 'Application'
		}
	},
	{ timestamps: true }
);

schema.pre('save', async function(next) {
	const user = this as IUserModel;
	if (user.isModified('password') || user.isNew) {
		try {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(user.password, salt);
			user.password = hash;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	next();
});

schema.methods.comparePassword = async function(password: string) {
	const user = this as IUserModel;
	return password && (await bcrypt.compare(password, user.password));
};

export const User = model<IUserModel>('User', schema, 'users');
