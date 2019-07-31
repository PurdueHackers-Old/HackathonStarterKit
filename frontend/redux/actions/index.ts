import ReactGA from 'react-ga';
import { Dispatch } from 'redux';
import { decode } from 'jsonwebtoken';
import { ICreateUser, ILoginUser, ILoginResponse, IContext, IUser } from '../../@types';
import { api } from '../../utils';
import { setCookie, removeCookie, getToken } from '../../utils/session';
import * as flash from '../../utils/flash';
import { setToken, setUser, setGreenFlash, setRedFlash } from '../creators';

// Auth Actions
export const signUp = (body: ICreateUser) => async (dispatch: Dispatch) => {
	try {
		const {
			data: { response }
		} = await api.post('/auth/signup', body);
		dispatch(setToken(response.token));
		dispatch(setUser(response.user));
		setCookie('token', response.token);
		const resp: ILoginResponse = response;
		return resp;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const signIn = (body: ILoginUser) => async (dispatch: Dispatch) => {
	try {
		const {
			data: { response }
		} = await api.post('/auth/login', body);
		dispatch(setToken(response.token));
		dispatch(setUser(response.user));
		const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
		const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
		setCookie('token', response.token, null, {
			expires: !body.rememberMe ? tomorrow : nextYear
		});
		ReactGA.set({ userId: response.user._id });
		const resp: ILoginResponse = response;
		return resp;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const signOut = (ctx?: IContext) => async (dispatch: Dispatch) => {
	try {
		dispatch(setToken(''));
		dispatch(setUser(null));
		removeCookie('token', ctx);
		ReactGA.set({ userId: null });
	} catch (error) {
		throw error;
	}
};

// Should only be called in the "server-side" context in _app.tsx
// Takes token from cookie and populates redux store w/ token and user object
export const refreshSession = (ctx?: IContext) => async (dispatch: Dispatch) => {
	try {
		if (ctx && ctx.res && ctx.res.headersSent) return;
		const token = getToken(ctx);
		if (!token) {
			dispatch(setUser(null));
			dispatch(setToken(''));
			removeCookie('token', ctx);
			ReactGA.set({ userId: null });
			return null;
		}
		const {
			data: { response }
		} = await api.get('/auth/refresh', {
			headers: { Authorization: `Bearer ${token}` }
		});

		dispatch(setUser(response.user));
		dispatch(setToken(response.token));
		setCookie('token', response.token, ctx);
		ReactGA.set({ userId: response.user._id });
		return response;
	} catch (error) {
		console.error('Error refreshing token:', error);
		// if (!error.response) throw error;
		dispatch(setUser(null));
		dispatch(setToken(''));
		removeCookie('token', ctx);
		ReactGA.set({ userId: null });
		return null;
	}
};

// User actions
export const updateProfile = (body: { name: string }, ctx?: IContext, id?: string) => async (
	dispatch: Dispatch
) => {
	try {
		const token = getToken(ctx);
		if (!id) id = (decode(token) as any)._id;
		const {
			data: { response }
		} = await api.put(`/users/${id}`, body, {
			headers: { Authorization: `Bearer ${token}` }
		});
		const user: IUser = response;
		dispatch(setUser(user));
		return user;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

// Flash Actions
export const sendErrorMessage = (msg: string, ctx?: IContext) => (dispatch: Dispatch) => {
	dispatch(setRedFlash(msg));
	flash.set({ red: msg }, ctx);
};

export const sendSuccessMessage = (msg: string, ctx?: IContext) => (dispatch: Dispatch) => {
	dispatch(setGreenFlash(msg));
	flash.set({ green: msg }, ctx);
};

export const clearFlashMessages = (ctx?: IContext) => (dispatch: Dispatch) => {
	dispatch(setGreenFlash(''));
	dispatch(setRedFlash(''));
	removeCookie('flash', ctx);
};
