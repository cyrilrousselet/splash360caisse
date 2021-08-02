import { employesActionTypes } from "./employesActionTypes";
import { employesServices } from "./employesServices";
import { notificationActions } from "../notification/notificationActions";
import logger from "../../helpers/Logger";

function getPointagesList(params={}) {

  return dispatch => {
    dispatch({ type: employesActionTypes.GET_POINTAGES_LIST_REQUEST });

    return employesServices.getPointagesList(params)
    .then(
        data => { dispatch({ type: employesActionTypes.GET_POINTAGES_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: employesActionTypes.GET_POINTAGES_LIST_FAILURE, error: error.toString() }) }
    );
  }
}

function getShiftsList(params={}) {

  return dispatch => {
    dispatch({ type: employesActionTypes.GET_SHIFTS_LIST_REQUEST });

    return employesServices.getShiftsList(params)
    .then(
        data => { dispatch({ type: employesActionTypes.GET_SHIFTS_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: employesActionTypes.GET_SHIFTS_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}

function createShift(payload) {
  return (dispatch, getState) => {
    dispatch({ type: employesActionTypes.CREATE_SHIFT_REQUEST });

    const {caisse} = getState().parametresReducer.parametres.options;
    
    employesServices.createShift({...payload, localsync: [caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: employesActionTypes.CREATE_SHIFT_SUCCESS, ...data });
        dispatch(getShiftsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: employesActionTypes.CREATE_SHIFT_FAILURE, error: error.toString() })
      }
    );
  }
}

function updateShift(payload) {
  return (dispatch, getState) => {
    dispatch({ type: employesActionTypes.UPDATE_SHIFT_REQUEST });
    
    const { shifts } = getState().employesReducer;
    const shift = shifts.find(sh => sh.shift_id = payload.shift_id);
    const {caisse} = getState().parametresReducer.parametres.options;

    employesServices.updateShift({...shift, ...payload, localsync: [caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: employesActionTypes.UPDATE_SHIFT_SUCCESS, ...data });
        dispatch(getShiftsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: employesActionTypes.UPDATE_SHIFT_FAILURE, error: error.toString() })
      }
    );
  }
}

function deleteShift(payload) {
  return dispatch => {
    dispatch({ type: employesActionTypes.DELETE_SHIFT_REQUEST });

    employesServices.deleteShift(payload)
    .then(
      data => {
        dispatch({ type: employesActionTypes.DELETE_SHIFT_SUCCESS, ...data });
        dispatch(getShiftsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: employesActionTypes.DELETE_SHIFT_FAILURE, error: error.toString() })
      }
    );
  }
}



function getTimeadjustsList(params={}) {

  return dispatch => {
    dispatch({ type: employesActionTypes.GET_TIMEADJUSTS_LIST_REQUEST });

    return employesServices.getTimeajustsList(params)
    .then(
        data => { dispatch({ type: employesActionTypes.GET_TIMEADJUSTS_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: employesActionTypes.GET_TIMEADJUSTS_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}

function createTimeadjust(payload) {
  return (dispatch, getState) => {
    dispatch({ type: employesActionTypes.CREATE_TIMEADJUST_REQUEST });
    const {caisse} = getState().parametresReducer.parametres.options;
    employesServices.createTimeadjust({...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: employesActionTypes.CREATE_TIMEADJUST_SUCCESS, ...data });
        dispatch(getTimeadjustsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: employesActionTypes.CREATE_TIMEADJUST_FAILURE, error: error.toString() })
      }
    );
  }
}

function updateTimeadjust(payload) {
  return (dispatch, getState) => {
    dispatch({ type: employesActionTypes.UPDATE_TIMEADJUST_REQUEST });
    
    const { timeajusts } = getState().employesReducer;
    const timeajust = timeajusts.find(ta => ta.adjust_id = payload.adjust_id);
    const {caisse} = getState().parametresReducer.parametres.options;

    employesServices.updateTimeadjust({...timeajust, ...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: employesActionTypes.UPDATE_TIMEADJUST_SUCCESS, ...data });
        dispatch(getTimeadjustsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: employesActionTypes.UPDATE_TIMEADJUST_FAILURE, error: error.toString() })
      }
    );
  }
}

function deleteTimeadjust(payload) {
  return dispatch => {
    dispatch({ type: employesActionTypes.DELETE_TIMEADJUST_REQUEST });

    employesServices.deleteTimeadjust(payload)
    .then(
      data => {
        dispatch({ type: employesActionTypes.DELETE_TIMEADJUST_SUCCESS, ...data });
        dispatch(getTimeadjustsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: employesActionTypes.DELETE_TIMEADJUST_FAILURE, error: error.toString() })
      }
    );
  }
}



function setClockIn(payload) {

  return (dispatch, getState) => {

    dispatch({ type: employesActionTypes.CLOCKIN_REQUEST });

    const {caisse} = getState().parametresReducer.parametres.options;

    employesServices.newPointage({...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({type: employesActionTypes.CLOCKIN_SUCCESS, ...data});
        dispatch(notificationActions.syncDispatch('pointage', data));
        dispatch(getPointagesList());
      },
      error => {
        logger.error(error);
        dispatch({type:employesActionTypes.CLOCKIN_FAILURE, error: error.toString()})
      }
    );

  }
}

function setClockOut(payload) {

  return (dispatch, getState) => {

    const { time, pointage_id } = payload;
    dispatch({ type: employesActionTypes.CLOCKOUT_REQUEST });

    const {caisse} = getState().parametresReducer.parametres.options;

    const pointage = getState().employesReducer.pointages.find(p => p.pointage_id===pointage_id);

    employesServices.updatePointage({...pointage, clockout: time, status: 'closed', localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({type: employesActionTypes.CLOCKOUT_SUCCESS, ...data});
        dispatch(notificationActions.syncDispatch('pointage', data));
        dispatch(getPointagesList());
      },
      error => {
        logger.error(error);
        dispatch({type:employesActionTypes.CLOCKOUT_FAILURE, error: error.toString()})
      }
    );

  }
}

function setPointageFromSync(payload) {
  return (dispatch,getState) => {

    const {data, emitter, response} = payload;
    
    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync};

    employesServices.updatePointage(__data)
    .then(
      pointage => {

        dispatch({ type: employesActionTypes.SET_POINTAGE_FROM_SYNC, pointage });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('pointage', __data, emitter));
        }
        dispatch(getPointagesList());
      }
    )
  }
}

export const employesActions = {
  getPointagesList,
  getShiftsList,
  createShift,
  updateShift,
  deleteShift,
  getTimeadjustsList,
  createTimeadjust,
  updateTimeadjust,
  deleteTimeadjust,
  setClockIn,
  setClockOut,
  setPointageFromSync
};