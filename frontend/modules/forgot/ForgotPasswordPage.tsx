import React, { FormEvent, ChangeEvent, useState } from 'react';
import { connect } from 'react-redux';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { IContext } from '../../@types';
import { err } from '../../utils';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { forgotPassword } from '../../api';

interface Props {
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const ForgotPassword = ({ flashError, flashSuccess, clear }: Props) => {
	const [email, setEmail] = useState('');

	const onChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Please wait...');
			const response = await forgotPassword(email);
			return flashSuccess(response);
		} catch (error) {
			clear();
			return flashError(err(error));
		}
	};
	return (
		<div>
			<h3>Forgot Password</h3>
			<br />
			<ForgotPasswordForm email={email} onChange={onChange} onSubmit={onSubmit} />
		</div>
	);
};

export const ForgotPasswordPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(ForgotPassword);
