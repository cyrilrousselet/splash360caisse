import { clotureActionTypes } from './clotureActionTypes';

const initialState = {
  loading: false,
  error: null,
  periode: {},
  clotures: []
}

export function clotureReducer(state = initialState, action) {

  switch (action.type) {

    case clotureActionTypes.GET_CURRENT_PERIODE:
      return {
        ...state,
        periode: action.periode,
        error: action.error
      };
    case clotureActionTypes.GET_CLOTURES_LIST_SUCCESS:
      return {
        ...state,
        clotures: action.clotureslist
      };
    default:
      return state;
  }
}


export const getPeriode = state => state.clotureReducer.periode;