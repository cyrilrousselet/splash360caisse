import { commandeActionTypes } from '../constants/commandeActionTypes';

const initialState = {
  loading: false,
  error: null,
  commandeslist: {}
}


export function commandesListReducer(state = initialState, action) {

  switch (action.type) {
    case commandeActionTypes.GET_ALLCOMMANDES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case commandeActionTypes.GET_ALLCOMMANDES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        commandeslist: action.commandeslist
      };

    case commandeActionTypes.GET_ALLCOMMANDES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };

    default:
    return state;
  }
}

export const getCommandesList = state => state.commandesListReducer.commandeslist;
export const getCommandesListLoading = state => state.commandesListReducer.loading;
export const getCommandesListError = state => state.commandesListReducer.error;