import React from 'react';
import { Provider } from 'react-redux';
import App, { Container } from 'next/app';
import Router from 'next/router';
import Head from 'next/head';
import withRedux from 'next-redux-wrapper';
import { Store } from 'redux';
import makeStore from '../redux/store';
import {
	clearFlashMessages,
	sendErrorMessage,
	sendSuccessMessage,
	refreshSession
} from '../redux/actions';
import Layout from '../modules/common/Layout';
import { initGA, logPageView } from '../utils/analytics';
import * as flash from '../utils/flash';
import '../assets/theme.less';
import { IStoreState } from '../@types';
import { registerServiceWorker } from '../utils/service-worker';

interface Props {
	store: Store<IStoreState>;
}

@((withRedux as any)(makeStore))
export default class MyApp extends App<Props> {
	static async getInitialProps({ Component, ctx }) {
		if (ctx.req) {
			await ctx.store.dispatch(refreshSession(ctx));
			if (!ctx.res.headersSent) {
				const messages = flash.get(ctx);
				if (messages.red) ctx.store.dispatch(sendErrorMessage(messages.red, ctx));
				if (messages.green) ctx.store.dispatch(sendSuccessMessage(messages.green, ctx));
			}
		}

		return {
			pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {}
		};
	}

	componentWillMount() {
		Router.onRouteChangeStart = () => {
			const { store } = this.props;
			const { flashState } = store.getState();
			if (flashState.green || flashState.red) store.dispatch(clearFlashMessages() as any);
		};
	}

	componentDidMount() {
		const { store } = this.props;
		const { sessionState } = store.getState();
		const uid = sessionState.user && sessionState.user._id;
		initGA(uid);
		logPageView();
		Router.router.events.on('routeChangeComplete', logPageView);
		window.onbeforeunload = () => {
			const { flashState } = store.getState();
			if (flashState.green || flashState.red) store.dispatch(clearFlashMessages() as any);
		};
		registerServiceWorker().catch(error =>
			console.error('[Service Worker]: Error registering service worker:', error)
		);
	}

	render() {
		const { Component, pageProps, store } = this.props as any;
		return (
			<Container>
				<Head>
					<title>Hello World</title>
				</Head>
				<Provider store={store}>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</Provider>
			</Container>
		);
	}
}
