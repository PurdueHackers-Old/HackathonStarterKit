import React, { ChangeEvent, FormEvent, useState } from 'react';
import { IContext } from '../../@types';
import { connect } from 'react-redux';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { err } from '../../utils';
import Router, { withRouter, WithRouterProps } from 'next/router';
import { ResetPasswordForm } from './ResetPasswordForm';
import { resetPassword } from '../../api';

interface Props extends WithRouterProps {
	token: string;
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const ResetPassword = ({ token, flashError, flashSuccess, clear }: Props) => {
	const [state, setState] = useState({ password: '', passwordConfirm: '' });

	const onChange = (e: ChangeEvent<HTMLInputElement>) =>
		setState({ ...state, [e.target.name]: e.target.value });

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Resetting password...');
			const response = await resetPassword(state.password, state.passwordConfirm, token);
			Router.push('/login');
			clear();
			flashSuccess(response);
		} catch (error) {
			clear();
			flashError(err(error));
		}
	};

	return (
		<div>
			<h3>Reset Your Password</h3>
			<ResetPasswordForm {...state} onChange={onChange} onSubmit={onSubmit} />
		</div>
	);
};

export const ResetPasswordPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(withRouter(ResetPassword));
