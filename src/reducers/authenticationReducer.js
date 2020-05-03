import { userActionTypes } from './../services/user/userActionTypes';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { loggedIn: true, user } : {loggedIn: false};

export function authentication(state = initialState, action) {

  switch (action.type) {
    case userActionTypes.LOGIN_REQUEST:
      return {
        loggingIn: true,
        user: action.user
      };
    case userActionTypes.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        user: action.user
      };
    case userActionTypes.LOGIN_FAILURE:
    case userActionTypes.LOGIN_ERROR:
    case userActionTypes.LOGIN_DENIED:
      return {
        loggedIn: false,
        error: action.payload
      };
    case userActionTypes.RESET_LOGIN_ERROR:
      return {
        ...state,
        error: null
      };
    case userActionTypes.LOGOUT:
      
      return {loggedIn: false};
    default:
      return state
  }
}