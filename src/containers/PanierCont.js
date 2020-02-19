import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions';
import { getAll, parametresActions } from '../services/parametres/parametresActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import { getSteps } from '../services/catalogue/catalogueReducer';
import { getParametres } from '../services/parametres/parametresReducer';
import Panier from '../components/Encaissement/Panier';

import history from './../helpers/history';
import paths from './../constants/routes.json';

const gotoListeCommandes = () => {
  history.push(paths.LISTECOMMANDES);
}

const mapStateToProps = (state) => {
  return {
    loading: getCommandeLoading(state),
    commande: getCommande(state),
    error: getCommandeError(state),
    steps: getSteps(state),
    parametres: getParametres(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  const binded = bindActionCreators({
    getCommande: commandeActions.getCommande,
    getParametres: parametresActions.getAll,
    updateProduit: commandeActions.updateProduit,
    updateCommande: commandeActions.updateCommande,
    standByCommande: commandeActions.standByCommande,
    livraisonCommande: commandeActions.livraisonCommande,
    deleteCommande: commandeActions.deleteCommande,
    openDrawer: peripheralActions.openDrawer
  }, dispatch);
  return {
    ...binded,
    gotoListeCommandes: gotoListeCommandes
  };
}

const PanierCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Panier);

export default PanierCont;