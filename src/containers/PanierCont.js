import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions';
import { parametresActions } from '../services/parametres/parametresActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import { getCommandesList } from '../services/commande/commandesListReducer';
import { getSteps } from '../services/catalogue/catalogueReducer';
import { getParametres } from '../services/parametres/parametresReducer';
import Panier from '../components/Encaissement/Panier';

import history from './../helpers/history';
import paths from './../constants/routes.json';
import { clientsActions } from '../services/clients/clientsActions';
import { tableActions } from '../services/table/tableActions';
import { numeroActions } from '../services/commande/numeroActions';
import { tresorServices } from '../services/tresorerie/tresorServices';
import { tresorActions } from '../services/tresorerie/tresorActions';
import { userServices } from '../services/user/userServices';
import { commandeServices } from '../services/commande/commandeServices';
import { journalActions } from '../services/journal/journalActions';


const gotoListeCommandes = () => {
  history.push(paths.LISTECOMMANDES);
}


// const getCaisses = (state) => {
//   const {stations} = state.parametresReducer.parametres.options;
//   if (stations) {
//     return stations.filter( (st) => st.origine.toLowerCase() === "caisse" );
//   }
//   return null;
// }


const mapStateToProps = (state) => {
  return {
    loading: getCommandeLoading(state),
    commande: getCommande(state),
    commandeslist: getCommandesList(state),
    error: getCommandeError(state),
    steps: getSteps(state),
    parametres: getParametres(state),
    clients: state.clientsReducer.clients,
    caisse: state.parametresReducer.parametres.options.caisse,
    ouverture: state.tresorReducer.ouverture,
    solde: state.tresorReducer.solde,
    blocage_encaissement: state.tresorReducer.blocage,
 //   caisses: getCaisses(state),
  };
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getCommande: commandeActions.getCommande,
    getParametres: parametresActions.getAll,
    getListeCommandes: commandeActions.getCommandesList,
    getLots: commandeActions.getLots,
    updateProduit: commandeActions.updateProduit,
    updateCommande: commandeActions.updateCommande,
    updateMode: commandeActions.updateMode,
    standByCommande: commandeActions.standByCommande,
    livraisonCommande: commandeActions.livraisonCommande,
    deleteCommande: commandeActions.deleteCurrentCommande,
    getNumero: numeroActions.takeNumero,
    uncheckItemSteps: commandeActions.uncheckItemSteps,
    openDrawer: peripheralActions.openDrawer,
    addComment: commandeActions.addComment,
    updateComment: commandeActions.updateComment,
    deleteComment: commandeActions.deleteComment,
    addDiscount: commandeActions.addDiscount,
    checkMarketing: commandeActions.checkMarketing,
    updateDiscount: commandeActions.updateDiscount,
    deleteDiscount: commandeActions.deleteDiscount,
    getClientsList: clientsActions.getClientsList,
    getSallesList: tableActions.getSallesList,
    addTresor: tresorActions.addTresor,
    log: journalActions.log,
  }, dispatch);
  return {
    ...bound,
    gotoListeCommandes: gotoListeCommandes,
    getLastMouvement: tresorServices.getLastMouvement,
    getLastClotureAndAfter: tresorServices.getLastClotureAndAfter,
    getUser: userServices.login,
    getCommandesList: commandeServices.getCommandesList
  };
}

const PanierCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Panier);

export default PanierCont;