import { tresorActionTypes } from './tresorActionTypes';

const initialState = {
  loading: false,
  error: null,
  tresors: {}
}

export function tresorReducer(state = initialState, action) {

  const { tresors } = state;
  let tresor = null;
 // let table = null;

  switch (action.type) {


    case tresorActionTypes.GET_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        tresors: action.tresors
      };


    case tresorActionTypes.ADD_SUCCESS:
    case tresorActionTypes.UPDATE_SUCCESS:
      
      tresor = action.tresor;

      return {
        ...state,
        tresors: {...tresors, [tresor.tresorId]:tresor}
      };

    default:
      return state;
  }
}