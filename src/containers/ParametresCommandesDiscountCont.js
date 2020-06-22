// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesDiscount from '../components/Parametres/CommandesDiscount';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    entreprise: state.parametresReducer.parametres.entreprise
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresCommandesDiscountCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesDiscount);

export default ParametresCommandesDiscountCont;