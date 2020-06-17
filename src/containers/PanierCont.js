import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions';
import { getAll, parametresActions } from '../services/parametres/parametresActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import { getCommandesList } from '../services/commande/commandesListReducer';
import { getSteps } from '../services/catalogue/catalogueReducer';
import { getParametres } from '../services/parametres/parametresReducer';
import Panier from '../components/Encaissement/Panier';

import history from './../helpers/history';
import paths from './../constants/routes.json';
import { clientsActions } from '../services/clients/clientsActions';

const gotoListeCommandes = () => {
  history.push(paths.LISTECOMMANDES);
}

const mapStateToProps = (state) => {
  return {
    loading: getCommandeLoading(state),
    commande: getCommande(state),
    commandeslist: getCommandesList(state),
    error: getCommandeError(state),
    steps: getSteps(state),
    parametres: getParametres(state),
    clients: state.clientsReducer.clients
  };
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getCommande: commandeActions.getCommande,
    getParametres: parametresActions.getAll,
    getListeCommandes: commandeActions.getCommandesList,
    updateProduit: commandeActions.updateProduit,
    updateCommande: commandeActions.updateCommande,
    standByCommande: commandeActions.standByCommande,
    livraisonCommande: commandeActions.livraisonCommande,
    deleteCommande: commandeActions.deleteCurrentCommande,
    setNewNumero: commandeActions.setNewNumero,
    uncheckItemSteps: commandeActions.uncheckItemSteps,
    openDrawer: peripheralActions.openDrawer,
    addComment: commandeActions.addComment,
    updateComment: commandeActions.updateComment,
    deleteComment: commandeActions.deleteComment,
    addDiscount: commandeActions.addDiscount,
    updateDiscount: commandeActions.updateDiscount,
    deleteDiscount: commandeActions.deleteDiscount,
    getClientsList: clientsActions.getClientsList
  }, dispatch);
  return {
    ...bound,
    gotoListeCommandes: gotoListeCommandes
  };
}

const PanierCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Panier);

export default PanierCont;