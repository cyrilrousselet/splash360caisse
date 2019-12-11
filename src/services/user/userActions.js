import { userActionTypes } from './userActionTypes';
import { alertActions } from './../../actions';
import { userServices } from './userServices';
import history from './../../helpers/history';
import paths from './../../constants/routes.json';


function login(passphrase) {

  return dispatch => {


    dispatch({ type: userActionTypes.LOGIN_REQUEST, payload: passphrase });

    userServices.login(passphrase)
        .then(
            user => {
                dispatch({ type: userActionTypes.LOGIN_SUCCESS, user });
                history.push(paths.DASHBOARD);
            },
            error => {
                dispatch({ type: userActionTypes.LOGIN_FAILURE, payload: error.toString() });
                dispatch(alertActions.error(error.toString()));
            }
        );
  }
};



function logout() {
  userServices.logout();
  return dispatch => { dispatch({ type: userActionTypes.LOGOUT }) };
}


function getAll() {
  return dispatch => {
      dispatch({ type: userActionTypes.GETALL_REQUEST });

      userServices.getAll()
          .then(
              users => dispatch({ type: userActionTypes.GETALL_SUCCESS, users }),
              error => dispatch({ type: userActionTypes.GETALL_FAILURE, payload: error.toString() })
          );
  }
};

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
  return dispatch => {
      dispatch({ type: userActionTypes.DELETE_REQUEST, id });

      userServices.delete(id)
          .then(
              user => dispatch({ type: userActionTypes.DELETE_SUCCESS, id }),
              error => dispatch({ type: userActionTypes.DELETE_FAILURE, id, payload: error.toString() })
          );
          }
        }




export const userActions = {
  login,
  logout,
  getAll,
  delete: _delete
}