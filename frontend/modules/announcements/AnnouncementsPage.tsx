import React, { Component, useEffect, useState } from 'react';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { err, endResponse } from '../../utils';
import { connect } from 'react-redux';
import { IContext, IAnnouncement } from '../../@types';
import { getAllAnnouncements } from '../../api';
import Announcement from './Announcement';
import { isSWSupported } from '../../utils/service-worker';

interface Props {
	announcements: IAnnouncement[];
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

export const Announcements = ({ announcements: ancmnts }: Props) => {
	const [announcements, setAnnouncements] = useState(ancmnts);
	useEffect(() => {
		const handleMessage = (e: MessageEvent) => {
			const { message } = e.data;
			if (message.action === 'add') setAnnouncements(prev => [...prev, message.announcement]);
			else if (message.action === 'delete')
				setAnnouncements(prev => prev.filter(a => a._id !== message.announcement._id));
		};

		if (isSWSupported()) navigator.serviceWorker.addEventListener('message', handleMessage);

		return () => {
			if (isSWSupported())
				navigator.serviceWorker.removeEventListener('message', handleMessage);
		};
	}, []);
	return (
		<div>
			<h3>Announcements Page</h3>
			{announcements.map(announcement => (
				<Announcement key={announcement._id} {...announcement} />
			))}
		</div>
	);
};

Announcements.getInitialProps = async (ctx: IContext) => {
	try {
		const announcements = await getAllAnnouncements(ctx, { released: true });
		return { announcements };
	} catch (error) {
		return [];
	}
};

export const AnnouncementsPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(Announcements);
