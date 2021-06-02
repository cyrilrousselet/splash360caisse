import { catalogueActionTypes } from './catalogueActionTypes';
import { catalogueServices } from './catalogueServices';
import Logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';

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

        if (dbupdated && dbupdated.length>=1) {
          dispatch(parametresActions.update({
            domaine: "options",
            cle: "first_start",
            valeur: false
          }));
        }


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
  return (dispatch, getState) => {
  // return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_REQUEST});

    const {produit_id, update, catalogue} = payload;
    const {caisse} = getState().parametresReducer.parametres.options;

    console.log("produit_id", produit_id);

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
      if ((['color','prix','active','noprint']).indexOf(cle)>-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateProduit({produit_id, ...filtered_update, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_SUCCESS});
        dispatch(notificationActions.syncDispatch('produit', {...data, catalogue: catalogue}));

        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_PRODUIT_FAILURE, error})
    );
  }
}


function updateIngredient(payload) {
  return (dispatch, getState) => {
  // return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_REQUEST});

    const {ingredient_id, update, catalogue} = payload;

    const {caisse} = getState().parametresReducer.parametres.options;
    // const ingredients = getState().catalogueReducer.ingredients;
    // const ingredient = ingredients[ingredient_id];

    // filtrage des propriétés à mettre à jour
    // (color, supplement, active)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['color','supplement','active','asproduct', 'noprint']).indexOf(cle)>-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateIngredient({ingredient_id, ...filtered_update, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_SUCCESS});
        dispatch(notificationActions.syncDispatch('ingredient', {...data, catalogue: catalogue}));
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_INGREDIENT_FAILURE, error})
    );
  }
}


function updateIngredientType(payload) {
  return (dispatch, getState) => {
  // return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_TYPE_REQUEST});

    const {type_id, update} = payload;

    const {caisse} = getState().parametresReducer.parametres.options;
    // const ingredientTypes = getState().catalogueReducer.ingredientTypes;
    // const type = ingredientTypes[type_id];

    // filtrage des propriétés à mettre à jour
    // (noprint)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['noprint','hilite']).indexOf(cle)>-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateIngredientType({type_id, ...filtered_update, localsync:[caisse.uniqid]})
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

function updateMultipleProduits(payload) {
  return (dispatch, getState) => {
    dispatch({ type: catalogueActionTypes.UPDATE_MULTIPLE_PRODUITS_REQUEST});

    const {groupe_id, catalogue, updates} = payload;
    const {caisse} = getState().parametresReducer.parametres.options;
    
    const prdGrouped = [];

    updates.forEach((prdUpdate) => {
      let update = prdUpdate.update;
      let produit_id = prdUpdate.produit_id;
      let filtered_update = {};
      Object.entries(update).forEach(([cle,valeur])=>{
        if ((['noprint']).indexOf(cle)>-1) {
          filtered_update[cle] = valeur;
        }
      });

      prdGrouped.push({...filtered_update, produit_id, localsync:[caisse.uniqid]});
    })

    console.log("prdGrouped", prdGrouped);

    catalogueServices.updateMultipleProduits(prdGrouped, {groupe_id, localsync:[caisse.uniqid]}) // Envoyer tableau de produits
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_MULTIPLE_PRODUITS_SUCCESS});
        dispatch(notificationActions.syncDispatch('groupe', data));
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_MULTIPLE_PRODUITS_FAILURE, error})
    );
  }
}

function updateMultipleIngredients(payload) {
  return (dispatch, getState) => {
    dispatch({ type: catalogueActionTypes.UPDATE_MULTIPLE_INGREDIENTS_REQUEST});

    const {type_id, catalogue, updates} = payload;
    const {caisse} = getState().parametresReducer.parametres.options;
    
    const ingGrouped = [];

    updates.forEach((ingUpdate) => {
      let update = ingUpdate.update;
      let ingredient_id = ingUpdate.ingredient_id;
      let filtered_update = {};
      Object.entries(update).forEach(([cle,valeur])=>{
        if ((['noprint']).indexOf(cle)>-1) {
          filtered_update[cle] = valeur;
        }
      });

      ingGrouped.push({...filtered_update, ingredient_id, localsync:[caisse.uniqid]});
    })

    console.log("ingGrouped", ingGrouped);

    catalogueServices.updateMultipleIngredients(ingGrouped, {type_id, localsync:[caisse.uniqid]}) // Envoyer tableau de produits
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_MULTIPLE_INGREDIENTS_SUCCESS});
        dispatch(notificationActions.syncDispatch('type', data));
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_MULTIPLE_INGREDIENTS_FAILURE, error})
    );
  }
}

function updateGroupe(payload) {
  return (dispatch, getState) => {
  // return dispatch => {
    dispatch({ type: catalogueActionTypes.UPDATE_GROUPE_REQUEST});

    const {groupe_id, update} = payload;

    // const catalogue = getState().catalogueReducer.catalogue;
    // const groupe = catalogue[groupe_id];
    const {caisse} = getState().parametresReducer.parametres.options;

    // filtrage des propriétés à mettre à jour
    // (noprint)
    const filtered_update = {};
    Object.entries(update).forEach(([cle,valeur])=>{
      if ((['noprint']).indexOf(cle)>-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateGroupe({...filtered_update, groupe_id, localsync:[caisse.uniqid]})
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

function setSyncedCatalogue(payload) {
  return (dispatch, getState) => {
    logger.log('TODO: set synced');
  }
}


/** 
 * ajout / modif de produit depuis la synchro
 */
function setProduitFromSync(payload) {
  return (dispatch, getState) => {

    const {data, emitter, response} = payload;

    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync}

    catalogueServices.updateProduit(__data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('produit', __data, emitter));
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
  return (dispatch, getState) => {

    const {data, emitter, response} = payload;

    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync}

    catalogueServices.updateGroupe(__data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_GROUPE_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('groupe',__data, emitter));
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
  return (dispatch, getState) => {

    const {data, emitter, response} = payload;
    
    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync}

    catalogueServices.updateIngredient(__data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('ingredient', __data, emitter));
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
  return (dispatch, getState) => {

    const {data, emitter, response} = payload;
    
    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync}

    catalogueServices.updateIngredientType(__data)
    .then(
      result => {
        dispatch({ type: catalogueActionTypes.UPDATE_TYPE_FROM_SYNC, result });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('type', __data, emitter));
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
  updateMultipleProduits,
  updateMultipleIngredients,
  updateGroupe,
  updateIngredientType,
  setProduitFromSync,
  setGroupeFromSync,
  setIngredientFromSync,
  setIngredientTypeFromSync,
  setSyncedCatalogue
};