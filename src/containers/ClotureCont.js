import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Cloture from '../components/Cloture/Cloture';
import { clotureActions } from '../services/cloture/clotureActions';
import { getPeriode } from '../services/cloture/clotureReducer';
import { commandeActions } from '../services/commande/commandeActions';
import { notificationActions } from '../services/notification/notificationActions';
import { tresorActions } from '../services/tresorerie/tresorActions';
import { tresorServices } from '../services/tresorerie/tresorServices';

// import {data} from '../constants/translations';
// import LocalizedStrings from 'react-localization';
// let strings = new LocalizedStrings(data);



const getCaisses = (state) => {
  const {stations} = state.parametresReducer.parametres.options;
  const {commandeslist} = state.commandesListReducer;

  let caisses = [];

  if (commandeslist) {  
    Object.entries(commandeslist).forEach(([ticketId, commande]) => {
      if (caisses.filter(c => c.uniqid===commande.caisse.uniqid).length===0) {
        caisses.push(commande.caisse);
      }
    })
  } else {
    caisses = stations;
  }

  return caisses.length>0 ? caisses : null;

  // if (stations) {
  //   // return stations.filter( (st) => st.origine.toLowerCase() === "caisse" );
  //   return stations;
  // }
  // return null;
}

const mapStateToProps = (state) => {
  return {
    periode: getPeriode(state),
    listeCommandes: state.commandesListReducer.commandeslist,
    catalogue: state.catalogueReducer,
    caisse: state.parametresReducer.parametres.options.caisse,
    caisses: getCaisses(state),
    user: state.authentication.user,
    mouvements: state.tresorReducer.tresors,
    fonddecaisse_activation: state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.fonddecaisse_activation,
    fonddecaissetheo: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.fonddecaisse_activation) ? state.parametresReducer.parametres.financier.fonddecaisse_montant : 0 
  };
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getCommandesList: commandeActions.getCommandesList,
    getLastOuvertureAndAfter: tresorActions.getLastOuvertureAndAfter,
    getCurrentPeriode: clotureActions.getCurrentPeriode,
    makeCloture: clotureActions.makeCloture,
    addTresor: tresorActions.addTresor,
    resync: notificationActions.resync,
  }, dispatch);
  return {
    ...bound,
    getLastMouvement: tresorServices.getLastMouvement,    
  };
}

console.log('CLOTURE SELECTEUR');

const ClotureCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cloture);

export default ClotureCont;