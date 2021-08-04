import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions'
// import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import { getSteps, getIngredients, getIngredientTypes } from '../services/catalogue/catalogueReducer';
import Personnalisation from '../components/Encaissement/Personnalisation';


// const getCommandeTotal = (items) => {
//   // montant à payer (somme des items)
//   let __total = 0;
//   if (undefined!==items) {
//     items.forEach(itm => {
//       __total += itm.quantite * itm.prix;      
//     });
//   }
//   return __total;
// }

const MODES = {
  'surplace': 0,
  'emporter': 1,
  'livraison': 2
};

const _findStep = (state, stepId) => {
  if (stepId===-1) return null;

  const steps = getSteps(state);
  let stepobj = {};
  
  Object.values(steps).forEach(st => {
    const stepo = st.find(so => so.step_id === stepId);
    if (stepo) stepobj = stepo;
  });

  return stepobj;
}

const _getIngredientTypes = (state, stepId) => {
  if (stepId===-1) return null;
  
  const stepObj = _findStep(state, stepId);
  const {mode} = state.commandeReducer.commande;
  let ingredientTypes = {};
  if (stepObj) {
    const allIng = getIngredients(state);

    const allTypes = getIngredientTypes(state);
    stepObj.regles.forEach(regle => {
      const rglType = {nom: allTypes[regle.type].nom, regle:regle.regle, ingredients:[]};
      allTypes[regle.type].ingredients.forEach(ingid => {
        rglType.ingredients.push({
          id: ingid,
          nom: allIng[ingid].nom,
          supplement: allIng[ingid].supplementArray[MODES[mode]].ttc,
          color: allIng[ingid].color,
          weight:  allIng[ingid].weight,
          active: allIng[ingid].active
        });
      });

      rglType.ingredients.sort((a,b) => a.weight - b.weight);

      Object.defineProperty(ingredientTypes, regle.type, {
        value: rglType,
        writable: true,
        enumerable: true
      });
    });
  }

  return ingredientTypes;
}

/**
 * Retourne la liste des ingredients de l'item en cours de personnalisation
 * @param {*} state   state (pour en récupérer le commandeReducer)
 * @param {*} itemid  id de l'item en cours de personnalisation
 */
const _getItemIngredients = (state, itemid) => {
  if (itemid===-1) return null;
  if (undefined === state.commandeReducer.commande.items) return null;
 const item_obj = state.commandeReducer.commande.items.find(item=>item.itemid===itemid);
 if (undefined===item_obj) return null;
 return item_obj.ingredients;
}

const _getItemSteps = (state, itemid) => {
  if (itemid===-1) return null;
  if (undefined === state.commandeReducer.commande.items) return null;
  const item_obj = state.commandeReducer.commande.items.find(item=>item.itemid===itemid);
  if (undefined===item_obj) return null;
  return item_obj.steps;
}

const mapStateToProps = (...args) => { 
    const state = args[0];
    const props = args[1];
  return {
    stepObject: _findStep(state, props.step),
    ingredientTypes: _getIngredientTypes(state, props.step),
    itemIngredients: _getItemIngredients(state, props.item),
    itemSteps: _getItemSteps(state, props.item)
    // valueToPay: getCommandeTotal(getCommande(state).items),
    // tiroirOuvert: getTiroirOuvert(state),
    // loading: getCommandeLoading(state),
    // commande: getCommande(state),
    // error: getCommandeError(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    addIngredient: commandeActions.addIngredient,
    removeIngredient: commandeActions.removeIngredient,
    noIngredientForStep: commandeActions.noIngredientForStep,
    updateProduit: commandeActions.updateProduit,
    completeStep: commandeActions.completeStep
    // getCommande: commandeActions.getCommande,
    // updateCommande: commandeActions.updateCommande,
    // addReglement: commandeActions.addReglement,
    // removeReglement: commandeActions.removeReglement,
    // addRendu: commandeActions.addRendu,
    // validateCommande: commandeActions.validateCommandeAndUpdateList,
    // printTest: peripheralActions.printTest,
    // printTicket: peripheralActions.printTicket,
    // openDrawer: peripheralActions.openDrawer,
    // closeDrawer: peripheralActions.closeDrawer,
  }, dispatch);

}

const PersonnalisationCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Personnalisation);

export default PersonnalisationCont;