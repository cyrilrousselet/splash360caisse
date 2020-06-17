import { clientsActionTypes } from './clientsActionTypes';
import { clientsServices } from './clientsServices';
import { commandeActions } from './../commande/commandeActions';

function getClientsList(params={}) {

  return dispatch => {
    dispatch({type: clientsActionTypes.GETALL_REQUEST});

    return clientsServices.getClientsList(params)
    .then(
      data => { dispatch({ type: clientsActionTypes.GETALL_SUCCESS, ...data}) },
    )
    .catch(
      error => { dispatch({ type: clientsActionTypes.GETALL_FAILURE, error: error.toString() }) }
    );
  }
}

function createClient(payload) {
  return (dispatch, getState) => {
    dispatch({ type: clientsActionTypes.CREATE_REQUEST });
    
    // const { user } = getState().authentication;
    // payload = {...payload, operator_id: user.user_id};

    clientsServices.createClient(payload)
    .then(
      data => {
        dispatch({ type: clientsActionTypes.CREATE_SUCCESS, ...data });
        dispatch(getClientsList());
        if (payload.autoselect) {
          dispatch(commandeActions.updateCommande({client:{nom:data.nom, prenom:data.prenom, client_id:data.client_id}}));
        }
      },
      error => dispatch({ type: clientsActionTypes.CREATE_FAILURE, error: error.toString() })
    );
  }
}


function updateClient(payload) {
  return (dispatch, getState) => {
    dispatch({ type: clientsActionTypes.UPDATE_REQUEST });
    
    const { clients } = getState().clientsReducer;
    const client = clients.find(c => c.client_id = payload.client_id);

    clientsServices.updateClient({...payload})
    .then(
      data => {
        dispatch({ type: clientsActionTypes.UPDATE_SUCCESS, ...data });
        dispatch(getClientsList());
        if (payload.autoselect) {
          dispatch(commandeActions.updateCommande({client:{nom:data.nom, prenom:data.prenom, client_id:data.client_id}}));
        }
      },
      error => dispatch({ type: clientsActionTypes.UPDATE_FAILURE, error: error.toString() })
    );
  }
}

export const clientsActions = {
  getClientsList,
  createClient,
  updateClient
};