import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Cloture from '../components/Cloture/Cloture';
import { clotureActions } from '../services/cloture/clotureActions';
import { getPeriode } from '../services/cloture/clotureReducer';
import { commandeActions } from '../services/commande/commandeActions';
import { notificationActions } from '../services/notification/notificationActions';
import { tresorActions } from '../services/tresorerie/tresorActions';
import { tresorServices } from '../services/tresorerie/tresorServices';


const mapStateToProps = (state) => {
  return {
    periode: getPeriode(state),
    listeCommandes: state.commandesListReducer.commandeslist,
    catalogue: state.catalogueReducer,
    caisse: state.parametresReducer.parametres.options.caisse,
    caisses: state.commandesListReducer.caisses,
    stations: state.parametresReducer.parametres.options,
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
    getCommandesCaisses: commandeActions.getCommandesCaisses
  }, dispatch);
  return {
    ...bound,
    getLastMouvement: tresorServices.getLastMouvement, 
    // getCommandesCaisses: commandeServices.getCommandesCaisses   
  };
}


const ClotureCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cloture);

export default ClotureCont;