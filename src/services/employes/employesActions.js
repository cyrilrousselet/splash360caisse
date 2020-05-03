import { employesActionTypes } from "./employesActionTypes";
import { employesServices } from "./employesServices";

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

function setClockIn(payload) {

  return dispatch => {

    const { time, user_id } = payload;
    dispatch({ type: employesActionTypes.CLOCKIN_REQUEST });

    employesServices.newPointage(payload)
    .then(
      data => {
        dispatch({type: employesActionTypes.CLOCKIN_SUCCESS, ...data});
        dispatch(getPointagesList());
      },
      error => dispatch({type:employesActionTypes.CLOCKIN_FAILURE, error: error.toString()})
    );

  }
}

function setClockOut(payload) {

  return (dispatch, getState) => {

    const { time, pointage_id } = payload;
    dispatch({ type: employesActionTypes.CLOCKOUT_REQUEST });

    const pointage = getState().employesReducer.pointages.find(p => p.pointage_id==pointage_id);

    employesServices.updatePointage({...pointage, clockout: time, status: 'closed'})
    .then(
      data => {
        dispatch({type: employesActionTypes.CLOCKOUT_SUCCESS, ...data});
        dispatch(getPointagesList());
      },
      error => dispatch({type:employesActionTypes.CLOCKOUT_FAILURE, error: error.toString()})
    );

  }
}

export const employesActions = {
  getPointagesList,
  setClockIn,
  setClockOut
};