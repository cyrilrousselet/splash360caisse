import { commandeActionTypes } from './commandeActionTypes';

const initialState = {
  loading: false,
  error: null,
  commandeslist: {},
  nonconfirmeeslist: {},
  liststart: null,
  listend: null,
  ticketsrestau: [],
  caisses: [],
  schedules: [],
  lots: [],
  pastnonconfirmed: 0,
}


export function commandesListReducer(state = initialState, action) {

  let ticketsrestau = state.ticketsrestau;
  let schedules = state.schedules;
  let lots = state.lots;
  let nonconfirmeeslist = state.nonconfirmeeslist;

  switch (action.type) {
    case commandeActionTypes.GET_ALLCOMMANDES_REQUEST:
    case commandeActionTypes.GETALL_TICKETSRESTAU_REQUEST:
    case commandeActionTypes.GET_COMMANDES_CAISSES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case commandeActionTypes.GET_COMMANDESLIST_REQUEST:

      let start = null;
      let end = null;

      if (action.params.hasOwnProperty('$and')) {
        if (action.params['$and'][0].hasOwnProperty('createdAt') && action.params['$and'][1].hasOwnProperty('createdAt')) {
          start = action.params['$and'][0].createdAt['$gt'];
          end = action.params['$and'][1].createdAt['$lte'];
        }
      } else if (action.params.hasOwnProperty('createdAt')) {
        if (action.params.createdAt.hasOwnProperty('$gt')) {
          start = action.params.createdAt['$gt'];
        } 
        if (action.params.createdAt.hasOwnProperty('$lte')) {
          end = action.params.createdAt['$lte'];
        } 
      }

      return {
        ...state,
        liststart: start,
        listend: end,
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

    case commandeActionTypes.GET_COMMANDESNCLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        nonconfirmeeslist: action.commandeslist
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

    case commandeActionTypes.GET_LOTS:
      return {
        ...state,
        lots: action.lots
      };

    case commandeActionTypes.CREATE_LOT:
      return {
        ...state,
        lots: [...lots, action.lot]
      };
    
    case commandeActionTypes.ADD_COMMANDE_TO_LOT:

      const index = lots.findIndex(l => l.lot_id===action.lot_id );
      lots[index].commandes.push(action.ticket_id);

      return {
        ...state,
        lots: [...lots]
      };

    case commandeActionTypes.DELETE_LOT:

      return {
        ...state,
        lots: [...lots.filter(l=>l.lot_id!==action.lot_id)]
      };

    case commandeActionTypes.PAST_NONCONFIRMEDCMD:
      return {
        ...state,
        pastnonconfirmed: action.value
      };

    case commandeActionTypes.REMOVE_COMMANDENC:
      delete nonconfirmeeslist[action.ticketId];
      return {
        ...state,
        pastnonconfirmed: nonconfirmeeslist
      };

    default:
    return state;
  }
}

export const getCommandesList = state => state.commandesListReducer.commandeslist;
export const getCommandesNonconfirmeesList = state => state.commandesListReducer.nonconfirmeeslist;
export const getCommandesListLoading = state => state.commandesListReducer.loading;
export const getCommandesListError = state => state.commandesListReducer.error;
export const getTicketsRestau = state => state.commandesListReducer.ticketsrestau;