import { peripheralActionTypes } from './peripheralActionTypes';

const initialState = {
  drawerOpen: false
}

export function peripheralReducer(state = initialState, action) {
  switch (action.type) {
    case peripheralActionTypes.OPEN_DRAWER:
    case peripheralActionTypes.OPEN_DRAWER_FAILURE:
      return {
        ...state,
        drawerOpen: true
      };
    case peripheralActionTypes.CLOSE_DRAWER:
      return {
        ...state,
        drawerOpen: false
      };
    default:
      return state;
  }
}


export const getTiroirOuvert = state => state.peripheralReducer.drawerOpen;