import { userActionTypes } from './userActionTypes';


const initialState = {
  hasUsers: false,
  users: []
}

export function userReducer(state = initialState, action) {

  let { users } = state;

  switch (action.type) {
    case userActionTypes.GETALL_REQUEST:
    case userActionTypes.CHECK_REQUEST:
      return {
        ...state,
        loading: true
      };
    case userActionTypes.CHECK_SUCCESS:
      return {
        ...state,
        hasUsers: action.result
      }
    case userActionTypes.GETALL_SUCCESS:
      return {
        ...state,
        users: action.users
      };
    case userActionTypes.UPDATE_SUCCESS:
      const userindex = users.findIndex(usr=>usr.user_id===action.user.user_id);
      users[userindex] = action.user;
      return {
        ...state,
        loading: false,
        error: null,
        users:  [...users]
      };
    case userActionTypes.CREATE_SUCCESS:
      const user = action.user;
      return {
        ...state,
        loading: false,
        error: null,
        users:  [...users, user]
      };
    case userActionTypes.GETALL_FAILURE:
    case userActionTypes.CHECK_FAILURE:
      return {
        ...state,
        error: action.error
      };
    default:
      return state
  }
}

export const hasUsers = state => state.userReducer.hasUsers;
export const getUsers = state => state.userReducer.users;
export const getLivreurs = state => state.userReducer.users.filter(u => u.hasOwnProperty('livreur') && u.livreur)