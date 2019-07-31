import { Document, Schema, model } from 'mongoose';
import {
	IsNotEmpty,
	IsEnum,
	IsIn,
	IsNumber,
	ValidateIf,
	IsUrl,
	MinLength,
	MaxLength
} from 'class-validator';
import { IUserModel } from './user';
import { Type } from 'class-transformer';
import {
	Gender,
	ethnicities,
	ClassYear,
	gradYears,
	Major,
	Referral,
	ShirtSize,
	Status
} from '../../shared/app.enums';

const isNotEmpty = (obj: any, val: any) => val !== '' && val !== null && val !== undefined;

export class ApplicationDto {
	@IsNotEmpty({ message: 'Please provide a valid gender' })
	@IsEnum(Gender, { message: 'Please provide a valid gender' })
	gender: Gender;

	@IsNotEmpty({ message: 'Please provide a valid ethnicity' })
	@IsEnum(ethnicities, { message: 'Please provide a valid ethnicity' })
	ethnicity: string;

	@IsNotEmpty({ message: 'Please provide a valid class year' })
	@IsEnum(ClassYear, { message: 'Please provide a valid class year' })
	classYear: ClassYear;

	@IsNotEmpty({ message: 'Please provide a valid graduation year' })
	@Type(() => Number)
	@IsNumber({}, { message: 'Graduation year must be a number' })
	@IsIn(gradYears, { message: 'Please provide a valid graduation year' })
	graduationYear: number;

	@IsNotEmpty({ message: 'Please provide a valid class major' })
	@IsEnum(Major, { message: 'Please provide a valid class major' })
	major: Major;

	@IsNotEmpty({ message: 'Please provide a valid referral' })
	@IsEnum(Referral, { message: 'Please provide a valid referral' })
	referral: Referral;

	@Type(() => Number)
	@IsNumber({}, { message: 'Please provide a valid hackathon number' })
	hackathons: number;

	@IsNotEmpty({ message: 'Please provide a valid shirt size' })
	@IsEnum(ShirtSize, { message: 'Please provide a valid shirt size' })
	shirtSize: ShirtSize;

	dietaryRestrictions: string;

	@ValidateIf(isNotEmpty)
	@IsUrl({}, { message: 'Please provide a valid website URL' })
	website: string;

	@IsNotEmpty({ message: 'Please provide an answer' })
	@MinLength(1, { message: 'Please provide an answer' })
	@MaxLength(250, { message: 'Your answer must be less than 250 characters' })
	answer1: string;

	@IsNotEmpty()
	@MinLength(1, { message: 'Please provide an answer' })
	@MaxLength(250, { message: 'Your answer must be less than 250 characters' })
	answer2: string;

	resume: string;
}

export interface IApplicationModel extends ApplicationDto, Document {
	user: IUserModel;
	statusInternal: Status;
	statusPublic: Status;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		gender: { type: String, required: true, enum: Object.values(Gender) },
		ethnicity: { type: String, required: true, enum: ethnicities },
		classYear: { type: String, required: true, enum: Object.values(ClassYear) },
		graduationYear: { type: Number, required: true },
		major: { type: String, required: true, enum: Object.values(Major) },
		referral: { type: String, required: true, enum: Object.values(Referral) },
		hackathons: { type: Number, default: 0 },
		shirtSize: { type: String, required: true, enum: Object.values(ShirtSize) },
		dietaryRestrictions: { type: String, default: '' },
		website: { type: String, default: '' },
		answer1: { type: String, required: true },
		answer2: { type: String, required: true },
		resume: { type: String, default: '' },
		statusPublic: { type: String, default: Status.PENDING, enum: Object.values(Status) },
		statusInternal: {
			type: String,
			default: Status.PENDING,
			enum: Object.values(Status),
			select: false
		}
	},
	{ timestamps: true }
);

export const Application = model<IApplicationModel>('Application', schema, 'applications');
