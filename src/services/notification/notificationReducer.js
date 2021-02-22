import { notificationActionTypes } from './notificationActionTypes';

const initialState = {
  loading: false,
  sseInit: false,
  getdbInit: false,
  getdbLoaded: false,
  stack: false
}

export function notificationReducer(state = initialState, action) {

  let stack = state.stack;

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
    case notificationActionTypes.ADD_TO_STACK:
      return {
        ...state,
        stack : [...stack, action.cmdcandidate]
      };
    case notificationActionTypes.REMOVE_FROM_STACK:
      return {
        ...state,
        stack : stack.filter(s=>s.id!==action.cmdcandidateid)
      };
    default:
      return state;
  }
}