import { catalogueActionTypes } from './catalogueActionTypes';
import { catalogueServices } from './catalogueServices';
import Logger from '../../helpers/Logger';

const logger = new Logger();


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
      if ((['color','prix','active']).indexOf(cle)!=-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateProduit({produit_id, ...filtered_update})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_SUCCESS});
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
      if ((['color','supplement','active']).indexOf(cle)!=-1) {
        filtered_update[cle] = valeur;
      }
    });

    catalogueServices.updateIngredient({ingredient_id, ...filtered_update})
    .then(
      data => {
        dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_SUCCESS});
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
        dispatch(getAll());
      },
      error => dispatch({type: catalogueActionTypes.UPDATE_GROUPE_FAILURE, error})
    );
  }
}

export const catalogueActions = {
  getAllActive,
  getAll,
  updateProduit,
  updateIngredient,
  updateGroupe,
  updateIngredientType
};