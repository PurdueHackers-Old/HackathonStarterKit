import React, { FormEvent, ChangeEvent, useState } from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';
import {
	signIn,
	sendErrorMessage,
	sendSuccessMessage,
	clearFlashMessages
} from '../../redux/actions';
import { LoginForm } from './LoginForm';
import { ILoginUser, ILoginResponse, IContext } from '../../@types';
import { err } from '../../utils';
import Link from 'next/link';

interface Props {
	signin: (body: ILoginUser) => Promise<ILoginResponse>;
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const Login = ({ signin, flashError, flashSuccess, clear }: Props) => {
	const [state, setState] = useState<ILoginUser>({ email: '', password: '', rememberMe: false });

	const onChange = (e: ChangeEvent<HTMLInputElement>) =>
		setState({ ...state, [e.target.name]: e.target.value });

	const onChecked = (e: ChangeEvent<HTMLInputElement>) =>
		setState({ ...state, [e.target.name]: e.target.checked });

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			flashSuccess('Signing in...');
			const { user } = await signin(state);
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
			<h3>Login Page</h3>
			<br />
			<LoginForm onSubmit={onSubmit} onChange={onChange} onChecked={onChecked} {...state} />
			<br />
			Forgot your password?{' '}
			<Link href="/forgot">
				<a>Click Here</a>
			</Link>
		</div>
	);
};

export const LoginPage = connect(
	null,
	{
		signin: signIn,
		flashError: sendErrorMessage,
		flashSuccess: sendSuccessMessage,
		clear: clearFlashMessages
	}
)(Login);
