import React, { FormEvent, ChangeEvent, useState } from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';
import {
	signUp,
	sendErrorMessage,
	sendSuccessMessage,
	clearFlashMessages
} from '../../redux/actions';
import { ILoginResponse, ICreateUser, IContext } from '../../@types';
import { SignupForm } from './SignupForm';
import { err } from '../../utils';

interface Props {
	signup: (body: ICreateUser) => Promise<ILoginResponse>;
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const Signup = ({ signup, flashError, flashSuccess, clear }: Props) => {
	const [state, setState] = useState({ name: '', email: '', password: '', passwordConfirm: '' });

	const onChange = (e: ChangeEvent<HTMLInputElement>) =>
		setState({ ...state, [e.target.name]: e.target.value });

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Signing up...');
			const { user } = await signup(state);
			Router.push('/');
			clear();
			flashSuccess(`Welcome ${user.name}!`);
		} catch (error) {
			clear();
			flashError(err(error));
		}
	};

	return (
		<div>
			<h3>Signup Page</h3>
			<br />
			<SignupForm onSubmit={onSubmit} onChange={onChange} {...state} />
		</div>
	);
};

export const SignupPage = connect(
	null,
	{
		signup: signUp,
		flashError: sendErrorMessage,
		flashSuccess: sendSuccessMessage,
		clear: clearFlashMessages
	}
)(Signup);
