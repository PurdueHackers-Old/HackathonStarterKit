import axios from 'axios';
import getConfig from 'next/config';
import { IContext } from '../@types';
const { publicRuntimeConfig: CONFIG } = getConfig();

export const api = axios.create({
	baseURL: CONFIG.API_URL
});

export const err = e =>
	!e
		? 'Whoops, something went wrong!'
		: e.message && typeof e.message === 'string'
		? e.message
		: e.error && typeof e.error === 'string'
		? e.error
		: 'Whoops, something went wrong!';

const dateToString = (date: string | number | Date) =>
	new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'America/Indiana/Indianapolis'
	});

export const formatDate = (date: string | number | Date) => {
	if (!date) return 'N/A';
	const str = dateToString(date);
	return str !== 'Invalid Date' ? str : 'N/A';
};

export const endResponse = (ctx: IContext) => ctx && ctx.res && ctx.res.end();

export function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
