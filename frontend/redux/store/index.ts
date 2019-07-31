import createStoreFromServer from './server';
import createStoreFromClient from './client';
import { initialState as storeState } from '../reducers';

let store;

export default (initialState = storeState, options) => {
	if (!process.browser) return createStoreFromServer(initialState, options);

	// Reuse store on the client-side
	if (!store) store = createStoreFromClient(initialState, options);

	return store;
};
