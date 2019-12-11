import { userActionTypes } from './userActionTypes';

export function userReducer(state = {}, action) {
  switch (action.type) {
    case userActionTypes.GETALL_REQUEST:
      return {
        loading: true
      };
    case userActionTypes.GETALL_SUCCESS:
      return {
        items: action.users
      };
    case userActionTypes.GETALL_FAILURE:
      return {
        error: action.error
      };
    default:
      return state
  }
}