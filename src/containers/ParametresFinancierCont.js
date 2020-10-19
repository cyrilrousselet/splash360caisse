// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Financier from '../components/Parametres/Financier';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.financier
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