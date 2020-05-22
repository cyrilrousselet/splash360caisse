import { notificationActionTypes } from './notificationActionTypes';

const initialState = {
  loading: false,
  sseInit: false
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
    default:
      return state;
  }
}