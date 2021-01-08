import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Cloture from '../components/Cloture/Cloture';
import { clotureActions } from '../services/cloture/clotureActions';
import { getPeriode } from '../services/cloture/clotureReducer';
import { commandeActions } from '../services/commande/commandeActions';
import { tresorActions } from '../services/tresorerie/tresorActions';
import { tresorServices } from '../services/tresorerie/tresorServices';

// import {data} from '../constants/translations';
// import LocalizedStrings from 'react-localization';
// let strings = new LocalizedStrings(data);

const getCaisses = (state) => {
  const {stations} = state.parametresReducer.parametres.options;
  if (stations) {
    // return stations.filter( (st) => st.origine.toLowerCase() === "caisse" );
    return stations;
  }
  return null;
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