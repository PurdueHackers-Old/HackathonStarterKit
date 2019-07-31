import React, { ChangeEvent, FormEvent, useState, useRef } from 'react';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { IContext, IApplication, IUser } from '../../@types';
import {
	redirectIfNotAuthenticated,
	redirect,
	userMatches,
	extractUser
} from '../../utils/session';
import { err, endResponse } from '../../utils';
import { Role } from '../../../shared/user.enums';
import { ApplicationForm } from '../apply/ApplicationForm';
import { connect } from 'react-redux';
import { Status } from '../../../shared/app.enums';
import { updateApplicationStatus, sendApplication, getApplication } from '../../api';

interface Props {
	application: IApplication;
	user: IUser;
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const AppPage = ({ application, user, flashError, flashSuccess, clear }: Props) => {
	const formRef = useRef<HTMLFormElement>();
	const [state, setState] = useState({
		...application,
		status: application.statusInternal
	});

	const onSelect = (e: ChangeEvent<HTMLSelectElement>) =>
		setState(prev => ({ ...prev, [e.target.name]: e.target.value }));

	const onStatusSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const { _id, status } = state;
		try {
			clear();
			const app = await updateApplicationStatus(_id, status);
			setState(prev => ({ ...prev, ...app }));
			return flashSuccess('Successfully updated application status!');
		} catch (error) {
			return flashError(err(error));
		}
	};

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Updating application...');
			const formData = new FormData(formRef.current);
			await sendApplication(formData as any, null, application.user._id);
			clear();
			return flashSuccess('Application successful!');
		} catch (error) {
			clear();
			return flashError(err(error));
		}
	};

	const disabled = !userMatches(user, application.user._id);
	return (
		<div>
			<h3>Application Page</h3>
			<br />
			<br />
			<form onSubmit={onStatusSubmit}>
				<label htmlFor="status">
					Status{' '}
					<select required name="status" onChange={onSelect} value={state.status}>
						{Object.values(Status).map(status => (
							<option value={status} key={status}>
								{status}
							</option>
						))}
					</select>
				</label>{' '}
				<input type="submit" value="Update Status" />
			</form>
			<br />
			<br />
			<ApplicationForm {...state} formRef={formRef} disabled={disabled} onSubmit={onSubmit} />
		</div>
	);
};

AppPage.getInitialProps = async (ctx: IContext) => {
	if (redirectIfNotAuthenticated('/', ctx, { roles: [Role.EXEC] })) return endResponse(ctx);

	try {
		const application = await getApplication(ctx.query.id as string, ctx);
		const user = extractUser(ctx);
		return { application, user };
	} catch (error) {
		redirect('/applications', ctx, true);
		sendErrorMessage(err(error), ctx)(ctx.store.dispatch);
		endResponse(ctx);
	}
};

export const ApplicationPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(AppPage);
