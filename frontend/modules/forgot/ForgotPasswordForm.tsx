import React from 'react';

interface Props {
	email: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ForgotPasswordForm = ({ email, onChange, onSubmit }: Props) => {
	return (
		<form onSubmit={onSubmit}>
			<label htmlFor="email">
				Email:{' '}
				<input
					type="email"
					name="email"
					className="form-control"
					placeholder="email@gmail.com"
					value={email}
					onChange={onChange}
				/>
			</label>
			<input type="submit" value="Reset Password" />
		</form>
	);
};
