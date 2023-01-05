// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesGeneral from '../components/Parametres/CommandesGeneral';
import { parametresActions } from '../services/parametres/parametresActions';
import { numeroActions } from '../services/commande/numeroActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    lastnumero: state.commandeReducer.numero,
    options: state.parametresReducer.parametres.options,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update,
    resetNumero: numeroActions.resetNumero
  },dispatch);
}

const ParametresCommandesGeneralCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesGeneral);

export default ParametresCommandesGeneralCont;