import cookie, { CookieAttributes } from 'js-cookie';
import Router from 'next/router';
import { IUser, IContext } from '../@types';
import { Role } from '../../shared/user.enums';
import { sendErrorMessage } from '../redux/actions';

export const setCookie = (
	key: string,
	value: string | object,
	ctx?: IContext,
	options?: object
) => {
	// Server
	if (ctx && ctx.req) ctx.res.cookie(key, value, options);
	// Client
	else cookie.set(key, value, options);
};

export const removeCookie = (key: string, ctx?: IContext) => {
	// Server
	if (ctx && ctx.req) ctx.res.clearCookie(key);
	// Client
	else cookie.remove(key);
};

export const getCookie = (key: string, ctx?: IContext) => {
	// Server
	if (ctx && ctx.req) return ctx.req.cookies[key];
	// Client
	else return cookie.getJSON(key);
};

export const getToken = (ctx?: IContext) => {
	// let token = ctx && ctx.store && ctx.store.getState().sessionState.token;
	// if (token) return token;
	// token = getCookie('token', ctx);
	let token = getCookie('token', ctx);
	return token;
};

export const redirect = (target: string, ctx?: IContext, replace?: boolean) => {
	if (ctx && ctx.res) {
		// Server redirect
		// ctx.res.redirect(replace ? 303 : 301, target);
		// ctx.res.writeHead(replace ? 303 : 301, { Location: target });
		ctx.res.status(replace ? 303 : 301).header('Location', target);
		// ctx.res.end();
	} else {
		// Browser redirect
		replace ? Router.replace(target) : Router.push(target);
	}
	return true;
};

export const extractUser = (ctx: IContext) => {
	// Try to get from redux, and if not, req.user
	let user = ctx && ctx.store && ctx.store.getState().sessionState.user;
	if (user) return user;
	user = ctx && ctx.req && ctx.req.user;
	return user;
};

export const roleMatches = (role: Role, name: Role) => {
	if (!role) return false;
	return role === Role.ADMIN || role === name;
};

export const hasPermission = (user: IUser, name: Role) => {
	if (!user) return false;
	return roleMatches(user.role, name);
};

export const userMatches = (user: IUser, id: string) => {
	if (!user || !id) return false;
	if (hasPermission(user, Role.ADMIN)) return true;
	return user._id === id;
};

export const isAuthenticated = (ctx: IContext, roles?: Role[]) => {
	if (!roles || !roles.length) return !!getToken(ctx);
	const user = extractUser(ctx);
	if (!user) return false;
	if (!roles.length) return true;
	if (!roles.some(role => hasPermission(user, role))) return false;
	return true;
};

export const redirectIfNotAuthenticated = (
	path: string,
	ctx: IContext,
	{ roles, msg = 'Permission Denied' }: { roles?: Role[]; msg?: string } = {}
): boolean => {
	if (!isAuthenticated(ctx, roles)) {
		redirect(path, ctx, true);
		sendErrorMessage(msg, ctx)(ctx.store.dispatch);
		return true;
	}

	return false;
};
