import { clientsActionTypes } from './clientsActionTypes';
import { clientsServices } from './clientsServices';
import { commandeActions } from './../commande/commandeActions';
import Logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';

const logger = new Logger();

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
    const {caisse} = getState().parametresReducer.parametres.options;

    clientsServices.createClient({...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: clientsActionTypes.CREATE_SUCCESS, ...data });
        dispatch(notificationActions.syncDispatch('client', data));
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
    

    const {caisse} = getState().parametresReducer.parametres.options;


    clientsServices.updateClient({...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: clientsActionTypes.UPDATE_SUCCESS, ...data });
        dispatch(notificationActions.syncDispatch('client', data));
        dispatch(getClientsList());
        if (payload.autoselect) {
          dispatch(commandeActions.updateCommande({client:{nom:data.nom, prenom:data.prenom, client_id:data.client_id}}));
        }
      },
      error => dispatch({ type: clientsActionTypes.UPDATE_FAILURE, error: error.toString() })
    );
  }
}

function setClientFromAPI(payload) {
  return (dispatch, getState) => {
    logger.log('CltA.setClientFromAPI()');
  }
}


/** 
 * ajout / modif de client depuis la synchro
 */
function setClientFromSync(client) {
  return (dispatch, getState) => {

    const {data, emitter, response} = client;
    
    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync}

    clientsServices.updateClient(__data)
    .then(
      result => {

        dispatch({ type: clientsActionTypes.SET_FROM_API, ...result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('client', result, emitter));
        }
        dispatch(getClientsList());
      }
    )
  }
}


export const clientsActions = {
  getClientsList,
  createClient,
  updateClient,
  setClientFromAPI,
  setClientFromSync
};