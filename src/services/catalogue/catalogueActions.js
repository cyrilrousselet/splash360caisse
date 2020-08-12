import { catalogueActionTypes } from './catalogueActionTypes';
import { catalogueServices } from './catalogueServices';
import Logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';
import { userActions } from '../user/userActions';

import history from '../../helpers/history';
import paths from '../../constants/routes.json';
import { parametresActions } from '../parametres/parametresActions';
import { parametresActionTypes } from '../parametres/parametresActionTypes';

const logger = new Logger();


function replaceDatabase(database) {
  return (dispatch, getState) => {
    dispatch({type: catalogueActionTypes.REPLACE_DATABASE_REQUEST});

    catalogueServices.replaceDatabase(database)
    .then(
      conf => {
        dispatch({type: catalogueActionTypes.REPLACE_DATABASE_SUCCESS})
        const {dbupdated} = getState().parametresReducer;
        let upd = ['catalogue'];
        if (dbupdated) {
          upd = [...dbupdated, ...upd];
        }
        dispatch({type: parametresActionTypes.INSTALL_DATABASE, value:upd});
      },
      error => dispatch({type: catalogueActionTypes.REPLACE_DATABASE_SUCCESS})

    )
  }
}

function getAllActive() {
  return dispatch => {
      dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_REQUEST });


      logger.log('getAllActive()');

      catalogueServices.getAllActive()
          .then(
              data => dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_SUCCESS, ...data }),
              error => dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_FAILURE, error: error.toString() })
          );
  }
};


function getAll() {
  return dispatch => {
      dispatch({ type: catalogueActionTypes.GETALL_REQUEST });

      catalogueServices.getAll()
          .then(
              data => dispatch({ type: catalogueActionTypes.GETALL_SUCCESS, ...data }),
              error => dispatch({ type: catalogueActionTypes.GETALL_FAILURE, error: error.toString() })
          );
  }
};

function updateProduit(payload) {
  // return (dispatch, getState) => {
  return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_REQUEST});

    const {produit_id, update} = payload;

    // const catalogue = getState().catalogueReducer.catalogue;
    // let produit = {};
    // Object.values(catalogue).forEach(grp => {
    //   const p = grp.produits.find(p=>p.id==produit_id);
    //   if (p!==undefined) {
    //     produit = p;
    //     return;
    //   }
    // });

    // filtrage des propriétés à mettre à jour
    // (color, prix, active)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['color','prix','active','noprint']).indexOf(cle)!=-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateProduit({produit_id, ...filtered_update})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_SUCCESS});
        dispatch(notificationActions.syncDispatch('produit', data));

        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_PRODUIT_FAILURE, error})
    );
  }
}


function updateIngredient(payload) {
  // return (dispatch, getState) => {
  return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_REQUEST});

    const {ingredient_id, update} = payload;

    // const ingredients = getState().catalogueReducer.ingredients;
    // const ingredient = ingredients[ingredient_id];

    // filtrage des propriétés à mettre à jour
    // (color, supplement, active)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['color','supplement','active','asproduct', 'noprint']).indexOf(cle)!=-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateIngredient({ingredient_id, ...filtered_update})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_SUCCESS});
        dispatch(notificationActions.syncDispatch('ingredient', data));
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_INGREDIENT_FAILURE, error})
    );
  }
}


function updateIngredientType(payload) {
  // return (dispatch, getState) => {
  return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_TYPE_REQUEST});

    const {type_id, update} = payload;

    // const ingredientTypes = getState().catalogueReducer.ingredientTypes;
    // const type = ingredientTypes[type_id];

    // filtrage des propriétés à mettre à jour
    // (noprint)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['noprint']).indexOf(cle)!=-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateIngredientType({type_id, ...filtered_update})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_TYPE_SUCCESS});
        dispatch(notificationActions.syncDispatch('type', data));
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_TYPE_FAILURE, error})
    );
  }
}

function updateGroupe(payload) {
  // return (dispatch, getState) => {
  return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_GROUPE_REQUEST});

    const {groupe_id, update} = payload;

    // const catalogue = getState().catalogueReducer.catalogue;
    // const groupe = catalogue[groupe_id];

    // filtrage des propriétés à mettre à jour
    // (noprint)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['noprint']).indexOf(cle)!=-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateGroupe({...filtered_update, groupe_id})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_GROUPE_SUCCESS});
        dispatch(notificationActions.syncDispatch('groupe', data));
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_GROUPE_FAILURE, error})
    );
  }
}




/** 
 * ajout / modif de produit depuis la synchro
 */
function setProduitFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    catalogueServices.updateProduit(data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('produit',data, emitter));
        }
        dispatch(getAll());
      }
    )
  }
}
/** 
 * ajout / modif de groupe depuis la synchro
 */
function setGroupeFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    catalogueServices.updateGroupe(data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_GROUPE_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('groupe',data, emitter));
        }
        dispatch(getAll());
      }
    )
  }
}
/** 
 * ajout / modif d'ingrédient depuis la synchro
 */
function setIngredientFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    catalogueServices.updateIngredient(data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('ingredient',data, emitter));
        }
        dispatch(getAll());
      }
    )
  }
}
/** 
 * ajout / modif de type d'ingrédient depuis la synchro
 */
function setIngredientTypeFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    catalogueServices.updateIngredientType(data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_TYPE_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('type',data, emitter));
        }
        dispatch(getAll());
      }
    )
  }
}



export const catalogueActions = {
  replaceDatabase,
  getAllActive,
  getAll,
  updateProduit,
  updateIngredient,
  updateGroupe,
  updateIngredientType,
  setProduitFromSync,
  setGroupeFromSync,
  setIngredientFromSync,
  setIngredientTypeFromSync
};