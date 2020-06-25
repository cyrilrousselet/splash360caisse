import { catalogueActionTypes } from './catalogueActionTypes';
import { catalogueServices } from './catalogueServices';


function getAllActive() {
  return dispatch => {
      dispatch({ type: catalogueActionTypes.GETALL_ACTIVE_REQUEST });

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
    dispatch({ type: catalogueActionTypes.UPDATE_PRODUIT_REQUEST});

    const {produit_id, update} = payload;

    const catalogue = getState().catalogueReducer.catalogue;
    let produit = {};
    Object.values(catalogue).forEach(grp => {
      const p = grp.produits.find(p=>p.id==produit_id);
      if (p!==undefined) {
        produit = p;
        return;
      }
    });


    catalogueServices.updateProduit({...produit, ...update})
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
  return (dispatch, getState) => {
    dispatch({ type: catalogueActionTypes.UPDATE_INGREDIENT_REQUEST});

    const {ingredient_id, update} = payload;

    const ingredients = getState().catalogueReducer.ingredients;
    const ingredient = ingredients[ingredient_id];

    catalogueServices.updateIngredient({...ingredient, ...update})
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
  return (dispatch, getState) => {
    dispatch({ type: catalogueActionTypes.UPDATE_TYPE_REQUEST});

    const {type_id, update} = payload;

    const ingredientTypes = getState().catalogueReducer.ingredientTypes;
    const type = ingredientTypes[type_id];

    catalogueServices.updateIngredientType({...type, ...update})
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
  return (dispatch, getState) => {
    dispatch({ type: catalogueActionTypes.UPDATE_GROUPE_REQUEST});

    const {groupe_id, update} = payload;

    const catalogue = getState().catalogueReducer.catalogue;
    const groupe = catalogue[groupe_id];

    catalogueServices.updateGroupe({...groupe, ...update})
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