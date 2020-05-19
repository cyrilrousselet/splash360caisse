import { marketingActionTypes } from "./marketingActionTypes";
import { marketingServices } from "./marketingServices";



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
  return dispatch => {
    dispatch({ type: marketingActionTypes.CREATE_AVOIR_REQUEST });
    
    marketingServices.createAvoir(payload)
    .then(
      data => {
        dispatch({ type: marketingActionTypes.CREATE_AVOIR_SUCCESS, ...data });
        dispatch(getAvoirsList());
      },
      error => dispatch({ type: marketingActionTypes.CREATE_AVOIR_FAILURE, error: error.toString() })
    );
  }
}

function updateAvoir(payload) {
  return (dispatch, getState) => {
    dispatch({ type: marketingActionTypes.UPDATE_AVOIR_REQUEST });
    
    const { avoirs } = getState().marketingReducer;
    const avoir = avoirs.find(av => av.avoir_id = payload.avoir_id);

    marketingServices.updateAvoir({...avoir, ...payload})
    .then(
      data => {
        dispatch({ type: marketingActionTypes.UPDATE_AVOIR_SUCCESS, ...data });
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


export const marketingActions = {
  getAvoirsList,
  createAvoir,
  updateAvoir,
  deleteAvoir,
  getReglesPanierList,
  getReglesCatalogueList
};