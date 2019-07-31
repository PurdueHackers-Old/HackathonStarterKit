import React, { useRef, FormEvent } from 'react';
import { connect } from 'react-redux';
import { IContext, IStoreState, IUser } from '../../@types';
import { redirectIfNotAuthenticated } from '../../utils/session';
import { endResponse, err } from '../../utils';
import {
	updateProfile,
	sendErrorMessage,
	sendSuccessMessage,
	clearFlashMessages
} from '../../redux/actions';

interface Props {
	name: string;
	update: (
		body: {
			name: string;
		},
		ctx?: IContext,
		id?: string
	) => Promise<IUser>;
	flashError: (msg: string, ctx?: IContext) => void;
	flashSuccess: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const EditProfile = ({ name, update, flashError, flashSuccess, clear }: Props) => {
	const nameRef = useRef<HTMLInputElement>();

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			clear();
			flashSuccess('Updating profile...');
			const response = await update({ name: nameRef.current.value });
			console.log('Got response:', response);
			clear();
			flashSuccess('Successfully updated profile');
		} catch (error) {
			clear();
			flashError(err(error));
		}
	};

	return (
		<div>
			<h2>Edit Profile Page</h2>
			<form onSubmit={onSubmit}>
				<h4>Name:</h4> <input defaultValue={name} name="name" ref={nameRef} />
				<input type="submit" value="Submit" />
			</form>
		</div>
	);
};

EditProfile.getInitialProps = (ctx: IContext) => {
	if (redirectIfNotAuthenticated('/login', ctx, { msg: 'You must be logged in!' }))
		return endResponse(ctx);
};

export const EditProfilePage = connect(
	(state: IStoreState) => ({
		name: state.sessionState.user.name
	}),
	{
		update: updateProfile,
		flashError: sendErrorMessage,
		flashSuccess: sendSuccessMessage,
		clear: clearFlashMessages
	}
)(EditProfile);
