import { userActionTypes } from './userActionTypes';
import { alertActions } from './../../actions';
import { userServices } from './userServices';
import history from './../../helpers/history';
import paths from './../../constants/routes.json';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { notificationActions } from '../notification/notificationActions';
let strings = new LocalizedStrings(data);

function resetError() {
  return dispatch => {
    dispatch({ type: userActionTypes.RESET_LOGIN_ERROR });
  }
}

function login(passphrase) {

  return dispatch => {


    dispatch({ type: userActionTypes.LOGIN_REQUEST, payload: passphrase });

    userServices.login(passphrase)
        .then(
            user => {
              if (user) {

                // si l'utilisateur n'est pas actif -> refus
                if (user.status!=='active') {
                  dispatch({ type: userActionTypes.LOGIN_DENIED, payload: strings.login.denied.titre });
                } else {
                  dispatch({ type: userActionTypes.LOGIN_SUCCESS, user });
                  // store user details and jwt token in local storage to keep user logged in between page refreshes
                  localStorage.setItem('user', JSON.stringify(user));
                  
                  history.push(paths.DASHBOARD);
                }
                
              }
              else {
                dispatch({ type: userActionTypes.LOGIN_ERROR, payload: strings.login.erreur.titre });
              }
            },
            error => {
                dispatch({ type: userActionTypes.LOGIN_FAILURE, payload: error.toString() });
                dispatch(alertActions.error(error.toString()));
            }
        );
  }
};

function setAdmin(passphrase) {
  return dispatch => {
    dispatch({ type: userActionTypes.SET_ADMIN_REQUEST });

    userServices.setAdmin(passphrase)
      .then(
        user => {
            dispatch({ type: userActionTypes.SET_ADMIN_SUCCESS, user });
            dispatch({ type: userActionTypes.LOGIN_SUCCESS, user });

            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            history.push(paths.MAIN_LOADER);
        },
        error => dispatch({ type: userActionTypes.SET_ADMIN_FAILURE, payload: error.toString() })
      )
  }
}


function logout() {
  userServices.logout();
  return dispatch => { dispatch({ type: userActionTypes.LOGOUT }) };
}

function checkUsers() {
  return dispatch => {
    dispatch({ type: userActionTypes.CHECK_REQUEST });

    userServices.checkUsers()
      .then(
        result => dispatch({ type: userActionTypes.CHECK_SUCCESS, result }),
        error => dispatch({ type: userActionTypes.CHECK_FAILURE, payload: error.toString() })
      )
  }
}

function updateUser(payload) {
  return (dispatch, getState) => {
    dispatch({ type: userActionTypes.UPDATE_REQUEST });

    const {user_id, data} = payload;
    const { users } = getState().userReducer;
    let user = users.find(usr=>usr.user_id===user_id);



    // on ne récupère que les propriétés qui ont été mises à jour
    let updated_data = {};
    Object.entries(data).forEach(([key,value]) => {
      console.log('updateUser: '+key,value);
      if (value!==null) updated_data[key] = value;
      if (key==='status' && value==='deleted') updated_data['identifiant'] = '';
    });

    
    user = {...user, ...updated_data};
    console.log(user);
    
     userServices.update(user)
      .then(
        // data => {
        //   const { user, confirm } = data;
        //   dispatch({ type: userActionTypes.UPDATE_SUCCESS, ...data });
        user => {
          dispatch({ type: userActionTypes.UPDATE_SUCCESS, user });
          dispatch(notificationActions.syncDispatch('user', user));
          dispatch(getAll());
        },
        error => dispatch({ type: userActionTypes.UPDATE_FAILURE, payload: error.toString() })
      )
  }
}

function createUser(payload) {
  return dispatch => {
    dispatch({ type: userActionTypes.CREATE_REQUEST });

    let updated_data = {};
    Object.entries(payload).forEach(([key,value]) => {
      if (value) updated_data[key] = value;
    });
    const newuser = {...updated_data};

     userServices.update(newuser)
      .then(
        // data => {
        //   const { user, confirm } = data;
        //   dispatch({ type: userActionTypes.CREATE_SUCCESS, user: {...user, user_id:confirm.user_id } });
        user => {
          dispatch({ type: userActionTypes.CREATE_SUCCESS, user });
          dispatch(notificationActions.syncDispatch('user', user));
          dispatch(getAll());
        },
        error => dispatch({ type: userActionTypes.CREATE_FAILURE, payload: error.toString() })
      )
  }
}

function getAll() {
  return dispatch => {
      dispatch({ type: userActionTypes.GETALL_REQUEST });

      userServices.getAll()
          .then(
              users => dispatch({ type: userActionTypes.GETALL_SUCCESS, ...users }),
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



/** 
 * ajout / modif de user depuis la synchro
 */
function setUserFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    userServices.update(data)
    .then(
      user => {

        dispatch({ type: userActionTypes.SET_FROM_API, user });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('user', data, emitter));
        }
        dispatch(getAll());
      }
    )
  }
}



export const userActions = {
  login,
  resetError,
  logout,
  setAdmin,
  checkUsers,
  updateUser,
  createUser,
  getAll,
  delete: _delete,
  setUserFromSync
}