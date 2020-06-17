import { clientsActionTypes } from './clientsActionTypes';

const initialState = {
  loading: false,
  error: null,
  clients: []
}

export function clientsReducer(state = initialState, action) {

  switch (action.type) {

    case clientsActionTypes.GETALL_REQUEST:
      return {
        ...state,
        loading: true
      };
    case clientsActionTypes.GETALL_SUCCESS:
      return {
        ...state,
        loading: false,
        clients: action.clientslist
      };
    default:
      return state;
  }
}