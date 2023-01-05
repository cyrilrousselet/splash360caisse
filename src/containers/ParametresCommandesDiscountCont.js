// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesDiscount from '../components/Parametres/CommandesDiscount';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    entreprise: state.parametresReducer.parametres.entreprise,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
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