import { catalogueActionTypes } from './catalogueActionTypes';
import { catalogueServices } from './catalogueServices';


function getAllActive() {
  return dispatch => {
      dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_REQUEST });

      catalogueServices.getAllActive()
          .then(
              data => dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_SUCCESS, ...data }),
              error => dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_FAILURE, error: error.toString() })
          );
  }
};


function getAll() {
  return dispatch => {
      dispatch({ type: catalogueActionTypes.GETALL_REQUEST });

      catalogueServices.getAll()
          .then(
              data => dispatch({ type: catalogueActionTypes.GETALL_SUCCESS, ...data }),
              error => dispatch({ type: catalogueActionTypes.GETALL_FAILURE, error: error.toString() })
          );
  }
};

export const catalogueActions = {
  getAllActive,
  getAll
};