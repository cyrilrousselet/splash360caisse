import { parametresActionTypes } from './parametresActionTypes';
import { parametresServices } from './parametresServices';
import { commandeActions } from './../commande/commandeActions';


function getAll() {
  return dispatch => {
   //   dispatch({ type: parametresActionTypes.GETALL_REQUEST });

      parametresServices.getAll()
          .then(
              data => dispatch({ type: parametresActionTypes.GETALL_SUCCESS, ...data }),
              error => dispatch({ type: parametresActionTypes.GETALL_FAILURE, error: error.toString() })
          );
  }
};


function update(payload) {
  return (dispatch, getState) => {
  //    dispatch({ type: parametresActionTypes.UPDATE_REQUEST });

      console.log('ParametresActions.update', payload);

      parametresServices.update(payload)
          .then(
              data => {
                dispatch({ type: parametresActionTypes.UPDATE_SUCCESS, ...data });
                
                // si dans le payload on traite de la numérotation des commandes
                // parametres.commandes.numerotation_[start|hex|max]
                // on lance la mise à jour des numéros
                let in_numerotation = false;
                if (Array.isArray(payload)) {
                  in_numerotation =  payload.findIndex( obj => (obj.domaine=="commandes" && ['numerotation_start', 'numerotation_hex', 'numerotation_max'].indexOf(obj.cle)!=-1) ) != -1;
                }
                else {
                  in_numerotation = (payload.domaine=="commandes" && ['numerotation_start', 'numerotation_hex', 'numerotation_max'].indexOf(payload.cle)!=-1);
                }
                const { numerotation_start, numerotation_max, numerotation_hex } = getState().parametresReducer.parametres.commandes;
                if (in_numerotation) dispatch(commandeActions.setNewNumero(numerotation_start));

              },
              error => dispatch({ type: parametresActionTypes.UPDATE_FAILURE, error: error.toString() })
          );
  }
};



export const parametresActions = {
  getAll,
  update
};