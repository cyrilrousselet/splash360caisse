import { journalActionTypes } from './journalActionTypes';

const initialState = {
  pending: []
}

export function journalReducer(state = initialState, action) {

  const { pending } = state;

  switch (action.type) {
    
    case journalActionTypes.ADD_EVENT:
      return {
        ...state,
        pending: [...pending, action.event]
      };
    case journalActionTypes.LOG_EVENT:
      return {
        ...state,
        pending: [...pending.filter(e => e.id !== action.event.id)]
      };
    default:
      return state;
  }
}