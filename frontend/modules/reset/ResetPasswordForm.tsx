import React from 'react';

interface Props {
	password: string;
	passwordConfirm: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ResetPasswordForm = ({ password, passwordConfirm, onChange, onSubmit }: Props) => {
	return (
		<form onSubmit={onSubmit}>
			<label htmlFor="password">
				Password *
				<input
					required
					type="password"
					name="password"
					placeholder="Password"
					value={password}
					onChange={onChange}
				/>
			</label>
			<br />
			<label htmlFor="passwordConfirm">
				Confirm Password *
				<input
					required
					type="password"
					name="passwordConfirm"
					value={passwordConfirm}
					onChange={onChange}
					placeholder="Confirm Password"
				/>
			</label>
			<span>
				<input type="submit" value="Reset Password" />
			</span>
		</form>
	);
};
