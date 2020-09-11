import { notificationActionTypes } from './notificationActionTypes';

const initialState = {
  loading: false,
  sseInit: false,
  getdbInit: false,
  getdbLoaded: false
}

export function notificationReducer(state = initialState, action) {

  switch (action.type) {

    case notificationActionTypes.INIT_SSE:
      return {
        ...state,
        sseInit: true
      };
    case notificationActionTypes.INIT_SSE_FAILURE:
      return {
        ...state,
        sseInit: true
      };
    case notificationActionTypes.GET_DATABASE_REQUEST:
      return {
        ...state,
        getdbInit: true
      };
    case notificationActionTypes.GET_DATABASE_SUCCESS:
      return {
        ...state,
        getdbLoaded: true
      };
    default:
      return state;
  }
}