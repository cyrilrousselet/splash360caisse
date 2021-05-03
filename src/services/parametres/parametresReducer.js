import { parametresActionTypes } from './parametresActionTypes';

const initialState = {
  loading: false,
  parametres: {},
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

    case parametresActionTypes.INSTALL_DATABASE:
      return {
        ...state,
        dbupdated: action.value
      };

    case parametresActionTypes.GETALL_SUCCESS:

      let newparams = action.parametres;

      

      return {
        ...state,
        loading: false,
        error: null,
        parametres: {...parametres, ...newparams}
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

      // update d'une liste de propriétés
      if (Array.isArray(action.payload)) {
        const __up = {...parametres};

        action.payload.forEach(obj => {
          __up[obj.domaine][obj.cle] = obj.valeur;
          console.log('up d:'+obj.domaine+', c:'+obj.cle+', v:'+obj.valeur, __up);
        }, __up);

        return {
          ...state,
          loading: false,
          error: null,
          parametres: __up
        };

      } 
      // update d'une seule propriété
      else {
        const __dom = parametres[action.payload.domaine] || {};

        const __newval = {
          [action.payload.cle]: action.payload.valeur
        };
  
        const __upd = {
          ...parametres,
          [action.payload.domaine]: {
            ...__dom,
            ...__newval
          }
        };
        return {
          ...state,
          loading: false,
          error: null,
          parametres: __upd
        };
      }


      

    case parametresActionTypes.UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };

    case parametresActionTypes.INSTALL_STATION_SUCCESS:
      console.log(action);

      const __up = {...parametres};

      action.payload.forEach(obj => {
        __up[obj.domaine][obj.cle] = obj.valeur;
        console.log('up d:'+obj.domaine+', c:'+obj.cle+', v:'+obj.valeur, __up);
      }, __up);

      return {
        ...state,
        loading: false,
        error: null,
        parametres: __up,
        stationinstalled: true
      };

    case parametresActionTypes.INSTALL_STATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      }

    default:
      return state;
  }

}

export const getParametres = state => state.parametresReducer.parametres;