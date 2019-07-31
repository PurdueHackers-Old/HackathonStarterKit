import React from 'react';
import { ILoginUser } from '../../@types';

interface Props extends ILoginUser {
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onChecked: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginForm = ({
	email,
	password,
	rememberMe,
	onSubmit,
	onChange,
	onChecked
}: Props) => {
	return (
		<form onSubmit={onSubmit}>
			<label>
				Email:
				<input required type="email" name="email" value={email} onChange={onChange} />
			</label>
			<br />
			<label>
				Password:
				<input
					required
					type="password"
					name="password"
					value={password}
					onChange={onChange}
				/>
			</label>
			<br />
			<label>
				Remember Me:
				<input
					type="checkbox"
					name="rememberMe"
					checked={rememberMe}
					onChange={onChecked}
				/>
			</label>
			<br />
			<input type="submit" value="Submit" />
		</form>
	);
};
