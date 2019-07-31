import React, { MutableRefObject } from 'react';
import {
	Gender,
	ethnicities,
	ClassYear,
	gradYears,
	Major,
	Referral,
	ShirtSize
} from '../../../shared/app.enums';
import { IApplication, IUser } from '../../@types';

interface Props extends IApplication {
	formRef: MutableRefObject<HTMLFormElement>;
	user: IUser;
	disabled?: boolean;
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ApplicationForm = (props: Props) => {
	return (
		<form onSubmit={props.onSubmit} ref={props.formRef}>
			<label>Name: {props.user.name}</label>
			<br />
			<label>Email: {props.user.email}</label>
			<br />
			<br />
			<label htmlFor="gender">
				Gender{' '}
				<select
					disabled={props.disabled}
					required
					name="gender"
					defaultValue={props.gender}
				>
					{Object.values(Gender).map(gender => (
						<option value={gender} key={gender}>
							{gender}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="ethnicity">
				Ethnicity{' '}
				<select
					disabled={props.disabled}
					required
					name="ethnicity"
					defaultValue={props.ethnicity}
				>
					{ethnicities.map(ethnicity => (
						<option value={ethnicity} key={ethnicity}>
							{ethnicity}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="classYear">
				Class Year{' '}
				<select
					disabled={props.disabled}
					required
					name="classYear"
					defaultValue={props.classYear}
				>
					{Object.values(ClassYear).map(classYear => (
						<option value={classYear} key={classYear}>
							{classYear}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="graduationYear">
				Graduation Year{' '}
				<select
					disabled={props.disabled}
					required
					name="graduationYear"
					defaultValue={`${props.graduationYear}`}
				>
					{gradYears.map(graduationYear => (
						<option value={graduationYear} key={graduationYear}>
							{graduationYear}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="major">
				Major{' '}
				<select disabled={props.disabled} required name="major" defaultValue={props.major}>
					{Object.values(Major).map(major => (
						<option value={major} key={major}>
							{major}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="referral">
				Referral{' '}
				<select
					disabled={props.disabled}
					required
					name="referral"
					defaultValue={props.referral}
				>
					{Object.values(Referral).map(referral => (
						<option value={referral} key={referral}>
							{referral}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="hackathons">
				Hackathons{' '}
				<input
					disabled={props.disabled}
					required
					min="0"
					name="hackathons"
					type="number"
					defaultValue={`${props.hackathons}`}
				/>
			</label>
			<br />
			<label htmlFor="shirtSize">
				Shirt Size{' '}
				<select
					disabled={props.disabled}
					required
					name="shirtSize"
					defaultValue={props.shirtSize}
				>
					{Object.values(ShirtSize).map(shirtSize => (
						<option value={shirtSize} key={shirtSize}>
							{shirtSize}
						</option>
					))}
				</select>
			</label>
			<br />
			<label htmlFor="dietaryRestrictions">
				Dietary Restrictions{' '}
				<input
					disabled={props.disabled}
					name="dietaryRestrictions"
					defaultValue={props.dietaryRestrictions}
				/>
			</label>
			<br />
			<label htmlFor="website">
				Website{' '}
				<input
					disabled={props.disabled}
					name="website"
					type="url"
					defaultValue={props.website}
				/>
			</label>
			<br />
			<label htmlFor="answer1">
				Answer 1
				<br />
				<textarea
					disabled={props.disabled}
					required
					name="answer1"
					defaultValue={props.answer1}
				/>
			</label>
			<br />
			<label htmlFor="answer2">
				Answer 2
				<br />
				<textarea
					disabled={props.disabled}
					required
					name="answer2"
					defaultValue={props.answer2}
				/>
			</label>
			<br />

			<label htmlFor="resume">
				{props.resume && <>&#9989;</>} Resume:{' '}
				<input type="file" name="resume" accept="application/pdf" />
			</label>
			<br />
			<br />
			<input type="submit" value="Submit" />
		</form>
	);
};
