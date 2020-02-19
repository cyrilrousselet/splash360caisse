import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions';
import { parametresActions } from '../services/parametres/parametresActions';
import { getCommande } from '../services/commande/commandeReducer';
import { getParametres } from '../services/parametres/parametresReducer';
import Encaissement from '../components/Encaissement';


const mapStateToProps = (state) => {
  return {
    commande: getCommande(state),
    parametres: getParametres(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  const binded = bindActionCreators({
    getCommande: commandeActions.getCommande,
    getParametres: parametresActions.getAll,
  }, dispatch);
  return {
    ...binded,
  };
}

const EncaissementCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Encaissement);

export default EncaissementCont;