import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions'
import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import Panier from '../components/Encaissement/Panier';


const mapStateToProps = (state) => {
  return {
    loading: getCommandeLoading(state),
    commande: getCommande(state),
    error: getCommandeError(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getCommande: commandeActions.getCommande,
    updateProduit: commandeActions.updateProduit,
    updateCommande: commandeActions.updateCommande,
    deleteCommande: commandeActions.deleteCommande
  }, dispatch);
}

const PanierCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Panier);

export default PanierCont;