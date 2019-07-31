import React, { Component, useState, useRef } from 'react';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { err, endResponse } from '../../utils';
import { connect } from 'react-redux';
import { IContext, IAnnouncement } from '../../@types';
import { getAllAnnouncements, releaseAnnouncement, deleteAnnouncement } from '../../api';
import Announcement from './Announcement';
import { redirectIfNotAuthenticated } from '../../utils/session';
import { Role } from '../../../shared/user.enums';

interface Props {
	announcements: IAnnouncement[];
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const ManageAnnouncements = ({
	announcements: ancmnts,
	clear,
	flashError,
	flashSuccess
}: Props) => {
	const [announcements, setAnnouncements] = useState(ancmnts);
	const onRelease = async (id: string) => {
		try {
			clear();
			console.log('Releasing announcement:', id);
			const shouldRelease = confirm('Are you sure you want to release this announcement?');
			if (!shouldRelease) return;
			await releaseAnnouncement(id);
			setAnnouncements(
				announcements.map(a => {
					if (a._id !== id) return a;
					a.released = true;
					return a;
				})
			);
			flashSuccess('Successfully released announcement!');
		} catch (error) {
			flashError(err(error));
		}
	};

	const onDelete = async (id: string) => {
		try {
			clear();
			const shouldDelete = confirm('Are you sure you want to delete this announcement?');
			if (!shouldDelete) return;
			console.log('Deleting:', id);
			const announcement = await deleteAnnouncement(id);
			setAnnouncements(announcements.filter(a => a._id !== announcement._id));
			flashSuccess('Successfully deleted announcement!');
		} catch (error) {
			flashError(err(error));
		}
	};

	return (
		<div>
			<h3>Manage Announcements</h3>
			{announcements &&
				announcements.map(announcement => (
					<Announcement
						key={announcement._id}
						{...announcement}
						admin={{ onRelease, onDelete }}
					/>
				))}
		</div>
	);
};

ManageAnnouncements.getInitialProps = async (ctx: IContext) => {
	try {
		if (redirectIfNotAuthenticated('/', ctx, { roles: [Role.EXEC] })) return endResponse(ctx);
		const announcements = await getAllAnnouncements(ctx);
		return { announcements };
	} catch (error) {
		return { announcements: [] };
	}
};

export const ManageAnnouncementsPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(ManageAnnouncements);
