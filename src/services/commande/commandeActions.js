import { commandeActionTypes } from './commandeActionTypes';
import { commandeServices } from './commandeServices';


function getCommandesList(params={}) {

  return dispatch => {
    dispatch({ type: commandeActionTypes.GET_ALLCOMMANDES_REQUEST });

    return commandeServices.getCommandesList(params)
    .then(
        data => { dispatch({ type: commandeActionTypes.GET_ALLCOMMANDES_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: commandeActionTypes.GET_ALLCOMMANDES_FAILURE, error: error.toString() }) }
    );
  }
}

/**
 * Recupere la commande à partir de son ID 
 * ou crée une nouvelle commande si aucun ID n'est passé en paramètre
 * @param {*} commandeId 
 */
function getCommande(commandeId=null) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.GET_COMMANDE_REQUEST, id:commandeId });

    // sans id de commande, on crée une nouvelle commande
    if (null===commandeId) {
      console.log('on demande une nouvelle commande');
      const state = getState();
      const { user } = state.authentication;
      const commande = commandeServices.getNewCommande({operator:user, caisse:0});
      dispatch({ type: commandeActionTypes.GET_COMMANDE_SUCCESS, commande });
    }
    // avec id de commande, on va chercher la commande en base
    else {
      console.log('on va chercher la commande #'+commandeId);
      commandeServices.getCommandeById(commandeId)
      .then(
        response => {
          const commande = response._cmd;
          dispatch({ type: commandeActionTypes.GET_COMMANDE_SUCCESS, commande });
        },
        error => dispatch({ type: commandeActionTypes.GET_COMMANDE_FAILURE, error: error.toString() })
      );
    }
  }
}

function validateCommande(payload) {
  return (dispatch, getState) => {

    dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_REQUEST });

   // payload.status = 'confirmed';
    const state = getState();
    
    return commandeServices.saveCommande(payload, state)
    .then(
      confirm => {
        const { user } = state.authentication;
        const commande = commandeServices.getNewCommande({operator:user, caisse:0});
        dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS, commande});
      },
      error => {
        console.log(error);
        dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error.toString() })
      }
    );
    
  }
}

function validateCommandeAndUpdateList(payload) {

  console.log('commandeActions.validateCommandeAndUpdateList()');

  return (dispatch) => {
    dispatch(validateCommande(payload)).then((dataFromValidate) => {
      dispatch(getCommandesList())
    })
  }
}

function standByCommande(payload) {

  return (dispatch, getState) => {

    dispatch({ type: commandeActionTypes.STANDBY_COMMANDE });

    payload.status = 'standby';
    console.log(payload);
    const state = getState();
    
    commandeServices.saveCommande(payload, state)
    .then(
      confirm => {
        const { user } = state.authentication;
        const commande = commandeServices.getNewCommande({operator:user, caisse:0});
        dispatch(getCommandesList());
        return dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS, commande});
      },
      error => {
        console.log(error);
        return dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error.toString() })
      }
    );
    
  }
}

function livraisonCommande(payload) {

  return (dispatch, getState) => {

    dispatch({ type: commandeActionTypes.AENCAISSER_COMMANDE });

    payload.status = 'a_encaisser';
    console.log(payload);
    const state = getState();
    
    commandeServices.saveCommande(payload, state)
    .then(
      confirm => {
        const { user } = state.authentication;
        const commande = commandeServices.getNewCommande({operator:user, caisse:0});
        dispatch(getCommandesList());
        return dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS, commande});
      },
      error => {
        console.log(error);
        return dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error.toString() })
      }
    );
    
  }
}

function addProduit(payload) {

  return (dispatch, getState) => {
    
    const state = getState();
    const items = state.commandeReducer.commande.items;
    const tva = state.catalogueReducer.tva[payload.tva_id];
    const steps = state.catalogueReducer.steps[payload.produitid];
    const composition = payload.composition.map(cmp => (
        {...cmp, 
         type: state.catalogueReducer.ingredients[cmp.ingredient].type, 
         tva: state.catalogueReducer.ingredients[cmp.ingredient].tva_id,
         prix: Number(state.catalogueReducer.ingredients[cmp.ingredient].supplement) ,
         fromStep: null 
        }
    ));
    payload = {...payload, composition};

    const { commandeItem, mode } = commandeServices.addProduit(payload, tva, items, steps);
    
    if ('add'===mode) dispatch({ type: commandeActionTypes.ADD_PRODUIT, commandeItem });
    if ('update'===mode) dispatch({ type: commandeActionTypes.UPDATE_PRODUIT, commandeItem });
  }
}

function updateProduit(payload) {

  return (dispatch, getState) => {

    const { itemid } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);

    const { commandeItem, mode } = commandeServices.updateProduit(payload, item);

    if ('update'===mode) dispatch({ type: commandeActionTypes.UPDATE_PRODUIT, commandeItem });
    if ('delete'===mode) dispatch({ type: commandeActionTypes.DELETE_PRODUIT, commandeItem });

  }
}

function addIngredient(payload) {

  return (dispatch, getState) => {


    console.log(payload);

    const { itemid, stepid, ingredientid, quantite } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);
    const step = state.catalogueReducer.steps[item.produitid].find(step => step.step_id === stepid);
    const ingredient = state.catalogueReducer.ingredients[ingredientid];

    const commandeItem = commandeServices.addIngredient(ingredient, quantite, step, item);
    dispatch({ type: commandeActionTypes.ADD_INGREDIENT, commandeItem });
  }
}


function updateCommande(payload) {
  return (dispatch) => {
    console.log(payload);
    dispatch({ type: commandeActionTypes.UPDATE_COMMANDE, payload });
  }
}

function deleteCommande() {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.DELETE_COMMANDE });
  }
}

function addReglement(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const reglements = state.commandeReducer.commande.reglements;

    const reglement = commandeServices.addReglement(payload, reglements);
    dispatch({ type: commandeActionTypes.ADD_REGLEMENT, reglement });
  }
}

function removeReglement(payload) {
  return (dispatch, getState) => {

  //  commandeServices.removeReglement(reglementId);

    dispatch({ type: commandeActionTypes.REMOVE_REGLEMENT, reglementId: payload.reglementId });
    
  }
}

function addRendu(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const rendus = state.commandeReducer.commande.rendus;

    const rendu = commandeServices.addRendu(payload, rendus);
    dispatch({ type: commandeActionTypes.ADD_RENDU, rendu });
  }
}
function removeRendu(payload) {
  return (dispatch, getState) => {

  //  commandeServices.removeReglement(reglementId);

    dispatch({ type: commandeActionTypes.REMOVE_RENDU, reglementId: payload.renduId });
    
  }
}


export const commandeActions = {
  getCommande,
  addProduit,
  updateProduit,
  updateCommande,
  deleteCommande,
  addReglement,
  removeReglement,
  addRendu,
  removeRendu,
  validateCommande,
  standByCommande,
  livraisonCommande,
  getCommandesList,
  validateCommandeAndUpdateList,
  addIngredient
};