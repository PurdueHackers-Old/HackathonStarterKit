import React, { useState, FormEvent, useEffect } from 'react';
import { redirectIfNotAuthenticated } from '../../utils/session';
import { IContext } from '../../@types';
import { Role } from '../../../shared/user.enums';
import { connect } from 'react-redux';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { err, endResponse } from '../../utils';
import { getUsers, updateRole } from '../../api';

interface Props {
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const AdminRoles = ({ flashError, flashSuccess, clear }: Props) => {
	const [users, setUsers] = useState([]);
	const [email, setEmail] = useState('');
	const [role, setRole] = useState(Role.USER);

	useEffect(() => {
		getUsers(null, { email })
			.then(val => {
				setUsers(val);
				const user = val.find(u => u.email === email);
				if (user) setRole(user.role);
			})
			.catch(error => flashError(err(error)));
	}, [email]);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			clear();
			const user = await updateRole(email, role);
			flashSuccess(`Successfully changed ${user.name}'s role to: ${role}`);
			setEmail('');
			setRole(Role.USER);
		} catch (error) {
			flashError(err(error));
		}
	};

	return (
		<div>
			<h3>Change a Users role</h3>
			<br />
			<form onSubmit={onSubmit}>
				<input
					autoComplete="off"
					name="email"
					list="emails"
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
				<datalist id="emails">
					{users.map(user => (
						<option key={user._id} id={user._id} value={user.email}>
							{user.email}
						</option>
					))}
				</datalist>
				<select value={role} onChange={e => setRole(e.target.value as any)}>
					{Object.values(Role).map(r => (
						<option value={r} key={r}>
							{r}
						</option>
					))}
				</select>
				<input type="submit" />
			</form>
		</div>
	);
};

AdminRoles.getInitialProps = (ctx: IContext) => {
	if (redirectIfNotAuthenticated('/', ctx, { roles: [Role.ADMIN] })) endResponse(ctx);
};

export const AdminRolesPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(AdminRoles);
