// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesGeneral from '../components/Parametres/CommandesGeneral';
import history from '../helpers/history';
import paths from '../constants/routes.json';
import { parametresActions } from '../services/parametres/parametresActions';
import { commandeActions } from '../services/commande/commandeActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    lastnumero: state.commandeReducer.numero
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update,
    setNewNumero: commandeActions.setNewNumero
  },dispatch);
}

const ParametresCommandesGeneralCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesGeneral);

export default ParametresCommandesGeneralCont;