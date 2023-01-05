// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Financier from '../components/Parametres/Financier';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.financier,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresFinancierCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Financier);

export default ParametresFinancierCont;