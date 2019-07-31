import { FLASH_GREEN_SET, FLASH_RED_SET } from '../constants';
import { AnyAction } from 'redux';

export interface IFlashState {
	green: string;
	red: string;
}

export const initialState: IFlashState = {
	green: '',
	red: ''
};

export default (state = initialState, action: AnyAction) => {
	switch (action.type) {
		case FLASH_GREEN_SET: {
			return {
				...state,
				green: action.green
			};
		}
		case FLASH_RED_SET: {
			return {
				...state,
				red: action.red
			};
		}
		default:
			return state;
	}
};
