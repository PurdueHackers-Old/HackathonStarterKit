import ReactGA from 'react-ga';
import getConfig from 'next/config';
const { publicRuntimeConfig: CONFIG } = getConfig();

export const initGA = (userId: string) => {
	ReactGA.initialize(CONFIG.TRACKING_ID, {
		// debug: CONFIG.NODE_ENV === 'development',
		testMode: CONFIG.NODE_ENV === 'development'
	});
	ReactGA.set({ userId });
};

export const logPageView = () => {
	ReactGA.set({ page: window.location.pathname });
	ReactGA.pageview(window.location.pathname);
};

export const logEvent = (category = '', action = '') => {
	if (category && action) {
		ReactGA.event({ category, action });
	}
};

export const logException = (description = '', fatal = false) => {
	if (description) {
		ReactGA.exception({ description, fatal });
	}
};
