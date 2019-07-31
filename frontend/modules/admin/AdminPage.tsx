import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { redirectIfNotAuthenticated } from '../../utils/session';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { IContext } from '../../@types';
import { Role } from '../../../shared/user.enums';
import { ApplicationsStatus } from '../../../shared/globals.enums';
import { err, formatDate, endResponse } from '../../utils';
import { connect } from 'react-redux';
import {
	fetchGlobals,
	updateApplicationsStatus,
	makePublicApplications,
	sendMassEmails
} from '../../api';

interface Props {
	applicationsPublic: boolean;
	emailsSent: Date | null;
	applicationsStatus: ApplicationsStatus;
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const Admin = ({
	applicationsPublic,
	applicationsStatus,
	emailsSent,
	flashError,
	flashSuccess,
	clear
}: Props) => {
	const [status, setStatus] = useState(applicationsStatus);
	const [pub, setPub] = useState(`${applicationsPublic}`);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const globals = await fetchGlobals();
				setStatus(globals.applicationsStatus);
				setPub(`${globals.applicationsPublic}`);
			} catch (error) {
				clear();
				flashError('Couldnt load globals');
				setStatus(ApplicationsStatus.CLOSED);
				setPub(`false`);
			}

			setLoading(false);
		};

		fetchData();
	}, []);

	const onUpdateStatus = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Updating applications status');
			await updateApplicationsStatus(status);
			clear();

			flashSuccess('Successfully updated applications status');
		} catch (error) {
			flashError(err(error));
		}
	};

	const onUpdatePublic = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Updating application public status');
			await makePublicApplications(pub === 'true');
			clear();

			flashSuccess('Successfully updated applications public status');
		} catch (error) {
			clear();
			flashError(err(error));
		}
	};

	const onSendMassEmails = async () => {
		try {
			const shouldSendEmails = confirm('Are you sure you want to send mass emails?');
			if (!shouldSendEmails) return;
			flashSuccess('Mass emailing all applicants...');
			await sendMassEmails();
			flashSuccess('Successfully sent mass applications emails');
		} catch (error) {
			flashError(err(error));
		}
	};

	if (loading) return <span>Loading...</span>;

	return (
		<div>
			<h2>Admin Dashboard</h2>
			<Link href="/admin/roles">
				<a>Manage User Roles</a>
			</Link>
			<br />
			<h3>Applications Status:</h3>
			<form onSubmit={onUpdateStatus}>
				<select onChange={e => setStatus(e.target.value as any)} value={status}>
					{Object.values(ApplicationsStatus).map(stat => (
						<option value={stat} key={stat}>
							{stat}
						</option>
					))}
				</select>
				<input type="submit" value="Submit" />
			</form>
			<br />
			<form onSubmit={onUpdatePublic}>
				<h3>Applications Public:</h3>
				<select onChange={e => setPub(e.target.value)} value={pub}>
					<option value={'true'}>True</option>
					<option value={'false'}>False</option>
				</select>
				<input type="submit" value="Submit" />
			</form>
			<br />
			<h3>Mass Emails Sent:</h3>
			{emailsSent ? formatDate(emailsSent) : 'Not Yet!'}
			<br />
			<br />
			<button onClick={onSendMassEmails}>Send Emails</button>
		</div>
	);
};

Admin.getInitialProps = (ctx: IContext) => {
	if (redirectIfNotAuthenticated('/', ctx, { roles: [Role.ADMIN] })) endResponse(ctx);
};

export const AdminPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(Admin);
