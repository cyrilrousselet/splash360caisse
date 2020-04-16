import { peripheralActionTypes } from './peripheralActionTypes';
import { parametresActionTypes } from '../parametres/parametresActionTypes';

const initialState = {
  drawerOpen: false,
  imprimantes: {},
  tickets: {}
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
    case parametresActionTypes.GETALL_SUCCESS:
      return {
        ...state,
        imprimantes: action.imprimantes,
        tickets: action.tickets
      }
    default:
      return state;
  }
}


export const getTiroirOuvert = state => state.peripheralReducer.drawerOpen;