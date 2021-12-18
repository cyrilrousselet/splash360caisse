import { clotureActions } from './clotureActions';
import { clotureActionTypes } from './clotureActionTypes';

const initialState = {
  loading: false,
  error: null,
  blocage: false,
  periode: {},
  clotures: {},
  zcaisse: [],
  gtpca: 0,
  gtpva: 0,
  today_ca: 0,
  today_numtickets: 0,
  archives_fiscales: [],
}

export function clotureReducer(state = initialState, action) {


  let {archives_fiscales} = state;

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
      };
    
    case clotureActionTypes.CHECK_NOCOMPLETED_COMMANDS:
      return {
        ...state,
        blocage: action.blocage
      };

    case clotureActionTypes.GET_ARCHIVE_FISCALE_SUCCESS:
      return {
        ...state,
        archives_fiscales: action.archives
      };
    
    case clotureActionTypes.QUALIFY_ARCHIVE_FISCALE:

      let __index = archives_fiscales.findIndex(a => a['TAG-ARC-DOC']===action.archive['TAG-ARC-DOC']);
      if (__index === -1) return state; 
      archives_fiscales[__index] = action.archive;

      return {
        ...state,
        archives_fiscales: [...archives_fiscales]
      };

    case clotureActionTypes.ADD_ARCHIVE_FISCALE:
      return {
        ...state,
        archives_fiscales: [...archives_fiscales, action.archive]
      };

    default:
      return state;
  }
}


export const getPeriode = state => state.clotureReducer.periode;