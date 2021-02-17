import { tresorActionTypes } from './tresorActionTypes';

const initialState = {
  loading: false,
  error: null,
  tresors: {},
  ouverture: false,
  solde: 0
}

export function tresorReducer(state = initialState, action) {

  const { tresors } = state;
  let tresor = null;
 // let table = null;
  let __ouv = state.ouverture;

  switch (action.type) {


    case tresorActionTypes.GET_SUCCESS:
    case tresorActionTypes.GET_LASTOUVERTUREANDAFTER_SUCCESS:

      return {
        ...state,
        loading: false,
        error: null,
        tresors: action.tresorslist
      };

    case tresorActionTypes.GET_LASTCLOTUREANDAFTER_SUCCESS:

      return {
        ...state,
        ouverture: action.ouverture,
        solde: action.solde
      };

    case tresorActionTypes.ADD_SUCCESS:
    case tresorActionTypes.UPDATE_SUCCESS:
      
      tresor = action.tresor;
      
      if (action.ouverture!==null) {
        __ouv = action.ouverture;
      }

      return {
        ...state,
        tresors: {...tresors, [tresor.tresorId]:tresor},
        solde: tresor.solde,
        ouverture: __ouv
      };

    default:
      return state;
  }
}