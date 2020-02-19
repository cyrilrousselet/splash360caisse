import { parametresActionTypes } from './parametresActionTypes';
import { parametresServices } from './parametresServices';


function getAll() {
  return dispatch => {
      dispatch({ type: parametresActionTypes.GETALL_REQUEST });

      parametresServices.getAll()
          .then(
              data => dispatch({ type: parametresActionTypes.GETALL_SUCCESS, ...data }),
              error => dispatch({ type: parametresActionTypes.GETALL_FAILURE, error: error.toString() })
          );
  }
};


function update(payload) {
  return dispatch => {
      dispatch({ type: parametresActionTypes.UPDATE_REQUEST });

      parametresServices.update(payload)
          .then(
              data => dispatch({ type: parametresActionTypes.UPDATE_SUCCESS, ...data }),
              error => dispatch({ type: parametresActionTypes.UPDATE_FAILURE, error: error.toString() })
          );
  }
};


export const parametresActions = {
  getAll,
  update
};