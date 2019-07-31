import { AUTH_USER_SET, AUTH_TOKEN_SET } from '../constants';
import { AnyAction } from 'redux';
import { IUser } from '../../@types';

export interface ISessionState {
	token: string;
	user: IUser | null;
}

export const initialState: ISessionState = {
	token: '',
	user: null
};

export default (state = initialState, action: AnyAction) => {
	switch (action.type) {
		case AUTH_USER_SET: {
			return action.user
				? {
						...state,
						user: {
							...state.user,
							...action.user
						}
				  }
				: {
						...state,
						user: null
				  };
		}
		case AUTH_TOKEN_SET: {
			return {
				...state,
				token: action.token
			};
		}

		default:
			return state;
	}
};
