import React from 'react';
import { connect } from 'react-redux';
import { IContext } from '../../@types';
import { Role } from '../../../shared/user.enums';
import { redirectIfNotAuthenticated } from '../../utils/session';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { err } from '../../utils';
import dynamic from 'next/dynamic';
import { checkinUser } from '../../api';

// @ts-ignore
const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

interface Props {
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const Scan = ({ flashError, flashSuccess, clear }: Props) => {
	const onError = e => {
		console.error('Error scanning:', e);
	};

	const onScan = async data => {
		if (!data) return;
		try {
			clear();
			const user = await checkinUser(data);
			flashSuccess(`Successfully checked in: ${user.name}`);
		} catch (error) {
			flashError(err(error));
		}
	};

	return (
		<div>
			<h3>Checkin Scan</h3>
			<br />
			<QrReader delay={750} onError={onError} onScan={onScan} />
		</div>
	);
};

Scan.getInitialProps = async (ctx: IContext) => {
	if (redirectIfNotAuthenticated('/', ctx, { roles: [Role.EXEC] })) return {};
};

export const CheckinScan = connect(
	null,
	{
		flashError: sendErrorMessage,
		flashSuccess: sendSuccessMessage,
		clear: clearFlashMessages
	}
)(Scan);
