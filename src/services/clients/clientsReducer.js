import { clientsActionTypes } from './clientsActionTypes';

const initialState = {
  loading: false,
  error: null,
  clients: []
}

export function clientsReducer(state = initialState, action) {


  let clients = state.clients;
  let client = null;

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
    case clientsActionTypes.FIND_CLIENT:

      client = action.client;
      let _clt = clients.find(c => (c.client_id === client.client_id) );
      if (!_clt) {
        clients = [...clients, client];
      }
      return {
        ...state,
        loading: false,
        clients: [
          ...clients
        ]
      }
    case clientsActionTypes.CREATE_SUCCESS:

      client = action.client;
      return {
        ...state,
        loading: false,
        clients: [
          ...clients,
          client
        ]
      }
    default:
      return state;
  }
}