import { parametresActionTypes } from './parametresActionTypes';

const initialState = {
  loading: false,
  parametres: {},
  imprimantes: {},
  tickets: {},
  error: null
};


export function parametresReducer(state=initialState, action) {

  let { parametres } = state;

  switch (action.type) {

    case parametresActionTypes.GETALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case parametresActionTypes.GETALL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        parametres: action.parametres,
        imprimantes: action.imprimantes,
        tickets: action.tickets
      };

    case parametresActionTypes.GETALL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };

    case parametresActionTypes.UPDATE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case parametresActionTypes.UPDATE_SUCCESS:
      const __upd = {
        ...parametres,
        [action.payload.domaine]: {
          [action.payload.cle]: action.payload.valeur
        }
      };
      return {
        ...state,
        loading: false,
        error: null,
        parametres: __upd
      };

    case parametresActionTypes.UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };

    default:
      return state;
  }

}

export const getParametres = state => state.parametresReducer.parametres;