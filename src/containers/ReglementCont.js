import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions'
import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import { getTiroirOuvert } from '../services/peripheral/peripheralReducer';
import { getParametres } from '../services/parametres/parametresReducer';
import Reglement from '../components/Encaissement/Reglement';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { marketingActions } from '../services/marketing/marketingActions';


const getCommandeTotal = (items, modificateurs, symbolemonnaie) => {


    let __total = 0;
    if (undefined!==items) {
      items.forEach(itm => {

        let __itemtotal = itm.quantite * itm.prix;
        
        // modificateur sur l'item
        const __moditem = (modificateurs && modificateurs.length) ? modificateurs.find(m => m.item===itm.itemid && m.ingredient===null) : null;
        if (__moditem) {
          const ispc = String(__moditem.valeur).includes("%");
          const val = Math.abs(ispc 
            ? Number(String(__moditem.valeur).slice(0, -1))
            : Number(String(__moditem.valeur).slice(0, -symbolemonnaie.length))
          );
          if (ispc) {
            __itemtotal *= __moditem.operation>0 ? (100 + val) / 100 : (100 - val) / 100;
          } else {
            __itemtotal = __moditem.operation>0 ? __itemtotal + val : __itemtotal - val;
          }
        }
        __total += Math.round(__itemtotal * 100) / 100;
      });
    }




    // modificateur sur le panier entier
    const modpanier = (modificateurs && modificateurs.length) ? modificateurs.find(m => m.item===null && m.ingredient===null) : null;
    if (modpanier) {
      const ispc = String(modpanier.valeur).includes("%");
      const val = Math.abs(ispc 
        ? Number(String(modpanier.valeur).slice(0, -1))
        : Number(String(modpanier.valeur).slice(0, -symbolemonnaie.length))
      );
      if (ispc) {
        __total *= modpanier.operation>0 ? (100 + val) / 100 : (100 - val) / 100;
      } else {
        __total = modpanier.operation>0 ? __total + val : __total - val;
      }
    }
    

    return __total;
  


}



const mapStateToProps = (...args) => { 
    const state = args[0];
    const __monnaie = (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'};
  //  const props = args[1];
  return {
    //open: state.openReglement,
    valueToPay: getCommandeTotal(getCommande(state).items, getCommande(state).modificateurs, __monnaie.symbole),
    tiroirOuvert: getTiroirOuvert(state),
    loading: getCommandeLoading(state),
    commande: getCommande(state),
    error: getCommandeError(state),
    params: getParametres(state).entreprise,
    avoirs: state.marketingReducer.avoirs,
    monnaie: __monnaie,
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getCommande: commandeActions.getCommande,
    updateCommande: commandeActions.updateCommande,
    addReglement: commandeActions.addReglement,
    removeReglement: commandeActions.removeReglement,
    addRendu: commandeActions.addRendu,
    removeRendu: commandeActions.removeRendu,
    addTroppercu: commandeActions.addTroppercu,
    confirmCommande: commandeActions.confirmCommande,
    // printTicket: peripheralActions.printTicket,
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