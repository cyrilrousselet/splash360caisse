import { marketingActionTypes } from "./marketingActionTypes";
import { marketingServices } from "./marketingServices";
import { peripheralActions } from "../peripheral/peripheralActions";
import { notificationActions } from "../notification/notificationActions";



function getAvoirsList(params={}) {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_AVOIRS_LIST_REQUEST });

    return marketingServices.getAvoirsList(params)
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_AVOIRS_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: marketingActionTypes.GET_AVOIRS_LIST_FAILURE, error: error.toString() }) }
    );
  }
}

function createAvoir(payload) {
  return (dispatch, getState) => {
    dispatch({ type: marketingActionTypes.CREATE_AVOIR_REQUEST });
    
    const { user } = getState().authentication;

    if (!payload.operator_id) {
      payload = {...payload, operator_id: user.user_id};
    }

    marketingServices.createAvoir(payload)
    .then(
      data => {
        dispatch({ type: marketingActionTypes.CREATE_AVOIR_SUCCESS, ...data });
        dispatch(peripheralActions.printAvoir(data));
        dispatch(notificationActions.syncDispatch('avoir', data));
        dispatch(getAvoirsList());
      },
      error => dispatch({ type: marketingActionTypes.CREATE_AVOIR_FAILURE, error: error.toString() })
    );
  }
}

function updateAvoir(payload) {
  return (dispatch, getState) => {
    dispatch({ type: marketingActionTypes.UPDATE_AVOIR_REQUEST });
    

//    marketingServices.updateAvoir({...avoir, ...payload})
    marketingServices.updateAvoir({...payload})
    .then(
      data => {
        dispatch({ type: marketingActionTypes.UPDATE_AVOIR_SUCCESS, ...data });
        dispatch(notificationActions.syncDispatch('avoir', data));
        dispatch(getAvoirsList());
      },
      error => dispatch({ type: marketingActionTypes.UPDATE_AVOIR_FAILURE, error: error.toString() })
    );
  }
}

function deleteAvoir(payload) {
  return dispatch => {
    dispatch({ type: marketingActionTypes.DELETE_AVOIR_REQUEST });

    marketingServices.deleteAvoir(payload)
    .then(
      data => {
        dispatch({ type: marketingActionTypes.DELETE_AVOIR_SUCCESS, ...data });
        dispatch(notificationActions.syncDispatch('deleteavoir', payload));
        dispatch(getAvoirsList());
      },
      error => dispatch({ type: marketingActionTypes.DELETE_AVOIR_FAILURE, error: error.toString() })
    );
  }
}



function getReglesPanierList(params={}) {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_REGLESPANIER_LIST_REQUEST });

    return marketingServices.getReglesPanierList(params)
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_REGLESPANIER_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: marketingActionTypes.GET_REGLESPANIER_LIST_FAILURE, error: error.toString() }) }
    );
  }
}


function getReglesCatalogueList(params={}) {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_REGLESCATALOGUE_LIST_REQUEST });

    return marketingServices.getReglesCatalogueList(params)
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_REGLESCATALOGUE_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: marketingActionTypes.GET_REGLESCATALOGUE_LIST_FAILURE, error: error.toString() }) }
    );
  }
}

/** 
 * ajout / modif d'avoir depuis la synchro
 */
function setAvoirFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    marketingServices.updateAvoir(data)
    .then(
      avoir => {

        dispatch({ type: marketingActionTypes.SET_AVOIR_FROM_SYNC, ...avoir });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('avoir', data, emitter));
        }
        dispatch(getAvoirsList());
      }
    )
  }
}
/** 
 * suppression d'avoir depuis la synchro
 */
function deleteAvoirFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    marketingServices.deleteAvoir(data)
    .then(
      avoir => {

        dispatch({ type: marketingActionTypes.DELETE_AVOIR_FROM_SYNC, ...avoir });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('deleteavoir', data, emitter));
        }
        dispatch(getAvoirsList());
      }
    )
  }
}


export const marketingActions = {
  getAvoirsList,
  createAvoir,
  updateAvoir,
  deleteAvoir,
  getReglesPanierList,
  getReglesCatalogueList,
  setAvoirFromSync,
  deleteAvoirFromSync
};