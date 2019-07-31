import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import thunk from 'redux-thunk';
import getConfig from 'next/config';
import rootReducer from '../reducers';
const { publicRuntimeConfig } = getConfig();

const middleware: any[] = [thunk];

if (publicRuntimeConfig.NODE_ENV !== 'production') {
	const { createLogger } = require('redux-logger');
	middleware.push(createLogger());
}

const enhancer =
	publicRuntimeConfig.NODE_ENV !== 'production'
		? composeWithDevTools(applyMiddleware(...middleware))
		: compose(applyMiddleware(...middleware));

export default (initialState, options) => {
	return createStore(rootReducer, initialState, enhancer);
};
