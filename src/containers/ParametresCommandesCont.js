// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Commandes from '../components/Parametres/Commandes';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    lastnumero: state.commandeReducer.lastnumero
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresCommandesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Commandes);

export default ParametresCommandesCont;