import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
// import { commandeActions } from '../services/commande/commandeActions'
// import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import Personnalisation from '../components/Encaissement/Personnalisation';


// const getCommandeTotal = (items) => {
//   // montant à payer (somme des items)
//   let __total = 0;
//   if (undefined!==items) {
//     items.forEach(itm => {
//       __total += itm.quantite * itm.prix;      
//     });
//   }
//   console.log('getCommandeTotal : '+__total);
//   return __total;
// }



const mapStateToProps = (...args) => { 
  console.log('PersonnalisationCont.mapStateToProps');
    const state = args[0];
    const props = args[1];
  return {
    // valueToPay: getCommandeTotal(getCommande(state).items),
    // tiroirOuvert: getTiroirOuvert(state),
    // loading: getCommandeLoading(state),
    // commande: getCommande(state),
    // error: getCommandeError(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
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