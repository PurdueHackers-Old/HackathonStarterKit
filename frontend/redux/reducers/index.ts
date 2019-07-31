import { combineReducers } from 'redux';
import sessionReducer from './session';
import flashReducer from './flash';
import { initialState as initialFlash } from './flash';
import { initialState as initialSession } from './session';

export const initialState = {
	sessionState: initialSession,
	flashState: initialFlash
};

export default combineReducers({
	sessionState: sessionReducer,
	flashState: flashReducer
});
