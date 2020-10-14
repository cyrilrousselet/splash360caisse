// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesGeneral from '../components/Parametres/CommandesGeneral';
import { parametresActions } from '../services/parametres/parametresActions';
import { commandeActions } from '../services/commande/commandeActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    lastnumero: state.commandeReducer.numero,
    options: state.parametresReducer.parametres.options
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update,
  //  setNewNumero: commandeActions.setNewNumero,
    resetNumero: commandeActions.resetNumero
  },dispatch);
}

const ParametresCommandesGeneralCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesGeneral);

export default ParametresCommandesGeneralCont;