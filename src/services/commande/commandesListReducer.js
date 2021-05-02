import { commandeActionTypes } from './commandeActionTypes';

const initialState = {
  loading: false,
  error: null,
  commandeslist: {},
  ticketsrestau: [],
  caisses: [],
  schedules: [],
}


export function commandesListReducer(state = initialState, action) {

  let ticketsrestau = state.ticketsrestau;
  let schedules = state.schedules;

  switch (action.type) {
    case commandeActionTypes.GET_ALLCOMMANDES_REQUEST:
    case commandeActionTypes.GETALL_TICKETSRESTAU_REQUEST:
    case commandeActionTypes.GET_COMMANDESLIST_REQUEST:
    case commandeActionTypes.GET_COMMANDES_CAISSES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case commandeActionTypes.GET_ALLCOMMANDES_SUCCESS:
    case commandeActionTypes.GET_COMMANDESLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        commandeslist: action.commandeslist
      };
    
    case commandeActionTypes.GET_COMMANDES_CAISSES_SUCCESS:
      return {
        ...state,
        loading: false,
        caisses: action.caisses
      }

    case commandeActionTypes.GET_ALLCOMMANDES_FAILURE:
    case commandeActionTypes.GET_COMMANDESLIST_FAILURE:
    case commandeActionTypes.GET_COMMANDES_CAISSES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error.message
      };

    case commandeActionTypes.SET_SCHEDULE:
      return {
        ...state,
        schedules: [...schedules, action.schedule]
      };

    case commandeActionTypes.DELETE_SCHEDULE:
      return {
        ...state,
        schedules: [ ...schedules.filter(s=>s!==action.schedule) ]
      };
    
    case commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        ticketsrestau: [...ticketsrestau, action.ticketrestau]
      }
    case commandeActionTypes.PERSIST_TICKETRESTAU_SUCCESS:
      let __newtr = action.ticketsrestau;
      return {
        ...state,
        loading: false,
        error: null,
        ticketsrestau: [...ticketsrestau, ...__newtr]
      }

    case commandeActionTypes.GETALL_TICKETSRESTAU_SUCCESS:
      return {
        ...state,
        loading: false,
        ticketsrestau: action.ticketsrestaulist
      };

    default:
    return state;
  }
}

export const getCommandesList = state => state.commandesListReducer.commandeslist;
export const getCommandesListLoading = state => state.commandesListReducer.loading;
export const getCommandesListError = state => state.commandesListReducer.error;
export const getTicketsRestau = state => state.commandesListReducer.ticketsrestau;