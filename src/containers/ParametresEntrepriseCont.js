// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Entreprise from '../components/Parametres/Entreprise';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.entreprise,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresEntrepriseCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Entreprise);

export default ParametresEntrepriseCont;