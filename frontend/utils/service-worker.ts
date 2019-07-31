export const isSWSupported = () =>
	navigator && 'serviceWorker' in navigator && 'PushManager' in window;

const register = async () => navigator.serviceWorker.register('/service-worker.js');

const requestNotificationPermission = async () => (window as any).Notification.requestPermission();

export const registerServiceWorker = async () => {
	if (!isSWSupported()) throw new Error('Service worker not supported');

	const registration = await register();
	console.log('Service Worker registered');

	const permission = await requestNotificationPermission();
	if (permission !== 'granted') throw new Error('Permission not granted for notifications');
	return registration;
};
