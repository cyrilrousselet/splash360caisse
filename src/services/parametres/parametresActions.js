import { parametresActionTypes } from './parametresActionTypes';
import { parametresServices } from './parametresServices';
import { commandeActions } from './../commande/commandeActions';



function replaceDatabase(database) {
  return (dispatch, getState) => {
    dispatch({type: parametresActionTypes.REPLACE_DATABASE_REQUEST, dd:database.database.parametres});

    parametresServices.replaceDatabase(database.database.parametres)
    .then(
      conf => {
        dispatch({type: parametresActionTypes.REPLACE_DATABASE_SUCCESS});
        const {dbupdated} = getState().parametresReducer;
        let upd = ['parametres'];
        if (dbupdated) {
          upd = [...dbupdated, ...upd];
        }
        dispatch({type: parametresActionTypes.INSTALL_DATABASE, value:upd});

        if (dbupdated && dbupdated.length>=1) {
          dispatch(parametresActions.update({
            domaine: "options",
            cle: "first_start",
            valeur: false
          }));
        }
      },
      error => dispatch({type: parametresActionTypes.REPLACE_DATABASE_SUCCESS})

    )
  }
}


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
                const __numkeys = ['numerotation_start', 'numerotation_hex', 'numerotation_max'];
                if (Array.isArray(payload)) {
                  in_numerotation =  payload.findIndex( obj => (obj.domaine==="commandes" && __numkeys.indexOf(obj.cle)>-1) ) > -1;
                }
                else {
                  in_numerotation = (payload.domaine==="commandes" && __numkeys.indexOf(payload.cle)>-1);
                }
                const { numerotation_start } = getState().parametresReducer.parametres.commandes;
                if (in_numerotation) dispatch(commandeActions.setNewNumero(numerotation_start));

              },
              error => dispatch({ type: parametresActionTypes.UPDATE_FAILURE, error: error.toString() })
          );
  }
};



export const parametresActions = {
  getAll,
  update,
  replaceDatabase
};