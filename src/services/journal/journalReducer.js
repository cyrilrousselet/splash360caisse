import { journalActionTypes } from "./journalActionTypes";

const initialState = {
  spool: []
};


export function journalReducer(state = initialState, action) {

  let {spool} = state;

  switch (action.type) {

    case journalActionTypes.LOG:
      return {
        ...state,
        spool: [...spool, action.event]
      };

    case journalActionTypes.LOGGED:
      return {
        ...state,
        spool: [...spool.filter(evt => evt['JET-NID']!==action.event['JET-NID'])]
      };

      
    default:
      return state;
  }
}