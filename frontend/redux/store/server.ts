import { createStore, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import getConfig from 'next/config';
import rootReducer from '../reducers';
const { publicRuntimeConfig } = getConfig();

const middleware: any[] = [thunk];

const enhancer =
	publicRuntimeConfig.NODE_ENV !== 'production'
		? composeWithDevTools(applyMiddleware(...middleware))
		: compose(applyMiddleware(...middleware));

export default (initialState, options) => {
	return createStore(rootReducer, initialState, enhancer);
};
