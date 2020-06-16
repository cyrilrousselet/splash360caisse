import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions'
import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import { getTiroirOuvert } from '../services/peripheral/peripheralReducer';
import { getParametres } from '../services/parametres/parametresReducer';
import Reglement from '../components/Encaissement/Reglement';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { marketingActions } from '../services/marketing/marketingActions';


const getCommandeTotal = (items, modificateurs) => {
  // montant à payer (somme des items)
  let __total = 0;
  if (undefined!==items) {
    items.forEach(itm => {
      __total += itm.quantite * itm.prix;      
    });
  }

    // en attendant d'avoir un discount sur chaque item / ingredient
    if (modificateurs && modificateurs.length) {
      const ispc = String(modificateurs[0].valeur).substr(-1,1)==='%';
      const val = Math.abs(Number(String(modificateurs[0].valeur).slice(0,-1)));
      if (ispc) {
        __total *= (100 - val) / 100;
      } else {
        __total -= val;
      }
    }


  console.log('getCommandeTotal : '+__total);
  return __total;
}



const mapStateToProps = (...args) => { 
    const state = args[0];
    const props = args[1];
  return {
    //open: state.openReglement,
    valueToPay: getCommandeTotal(getCommande(state).items, getCommande(state).modificateurs),
    tiroirOuvert: getTiroirOuvert(state),
    loading: getCommandeLoading(state),
    commande: getCommande(state),
    error: getCommandeError(state),
    params: getParametres(state).entreprise,
    avoirs: state.marketingReducer.avoirs
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getCommande: commandeActions.getCommande,
    updateCommande: commandeActions.updateCommande,
    addReglement: commandeActions.addReglement,
    removeReglement: commandeActions.removeReglement,
    addRendu: commandeActions.addRendu,
    validateCommande: commandeActions.validateCommandeAndUpdateList,
    printTest: peripheralActions.printTest,
    printTicket: peripheralActions.printTicket,
    openDrawer: peripheralActions.openDrawer,
    closeDrawer: peripheralActions.closeDrawer,
    persistTicketsRestaurants: commandeActions.persistTicketsRestaurants,
    createAvoir: marketingActions.createAvoir,
    updateAvoir: marketingActions.updateAvoir
  }, dispatch);
}

const ReglementCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Reglement);

export default ReglementCont;