import { clotureActionTypes } from './clotureActionTypes';

const initialState = {
  loading: false,
  error: null,
  periode: {},
  clotures: {},
  zcaisse: [],
  gtpca: 0,
  gtpva: 0,
  today_ca: 0,
  today_numtickets: 0
}

export function clotureReducer(state = initialState, action) {

  switch (action.type) {

    case clotureActionTypes.GET_CLOTURES_LIST_REQUEST:
      return {
        ...state,
        loading: true
      };

    case clotureActionTypes.GET_CURRENT_PERIODE:
      return {
        ...state,
        loading: false,
        periode: action.periode,
        error: action.error
      };
      
    case clotureActionTypes.GET_CLOTURES_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        clotures: action.clotureslist
      };

    case clotureActionTypes.GET_TODAY_CA:
      return {
        ...state,
        today_ca: action.ca,
        today_numtickets: action.numtickets
      };

    case clotureActionTypes.GET_GTP_SUCCESS:
    case clotureActionTypes.UPDATE_GTP_SUCCESS:
      return {
        ...state,
        gtpca: action.gtpca,
        gtpva: action.gtpva
      };

    case clotureActionTypes.GET_ZCAISSE_SUCCESS:
      return {
        ...state,
        zcaisse: action.zcaisse
      }

    default:
      return state;
  }
}


export const getPeriode = state => state.clotureReducer.periode;