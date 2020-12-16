import { tresorActionTypes } from "./tresorActionTypes";
import { tresorServices } from "./tresorServices";

import { notificationActions } from '../notification/notificationActions';

import Logger from '../../helpers/Logger';
const logger = new Logger();


function addTresor(payload) {
  return (dispatch, getState) => {

    logger.log('addTresor()', payload);

    dispatch({ type: tresorActionTypes.ADD_REQUEST });

    const user = getState().authentication.user;

    const params = {
      ...payload,
      user: { 
        id: user.id,
        nom: user.nom,
        user_id: user.user_id
      }
    };

    const tresor = tresorServices.createTresor(params);

    tresorServices.saveTresor(tresor).then(
      data => {
        dispatch({
          type: tresorActionTypes.ADD_SUCCESS,
          tresor: data
        });

        dispatch(notificationActions.syncDispatch('tresorerie', data));
      },
      error => dispatch({ type: tresorActionTypes.ADD_FAILURE, error: error.toString() })
    );

  }
}



function getTresors(params={}) {

  return dispatch => {
    dispatch({type: tresorActionTypes.GET_REQUEST});

    tresorServices.getTresors(params).then(
      data => { 
        dispatch({ 
          type: tresorActionTypes.GET_SUCCESS, 
          tresors: data
        }); 
      },
    )
    .catch(
      error => { 
        dispatch({ type: tresorActionTypes.GET_FAILURE, error: error.toString() }) }
    );
  }
}



function updateTresor(payload) {
  return (dispatch, getState) => {

    dispatch({ type: tresorActionTypes.UPDATE_REQUEST });

    tresorServices.saveTresor(payload).then(

      data => {
 
        dispatch({ 
          type: tresorActionTypes.UPDATE_SUCCESS,
          tresor: data 
        });

        dispatch(notificationActions.syncDispatch('tresorerie', data));
      },
      error => dispatch({ type: tresorActionTypes.UPDATE_FAILURE, error: error.toString() })
    );
  }
}


function setTresorFromSync(tresor) {
  return dispatch => {
    const { data, emitter, response } = tresor;
    tresorServices.persistTresor(data)
    .then(
      result => {
        dispatch({ type: tresorActionTypes.SETSYNCED_SUCCESS, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('tresorerie', result, emitter));
        }
        dispatch(getTresors());
      }
    )
  }
}



export const tresorActions = {
  addTresor,
  getTresors,
  updateTresor,
  setTresorFromSync
}