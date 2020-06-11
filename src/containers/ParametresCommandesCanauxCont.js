// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesCanaux from '../components/Parametres/CommandesCanaux';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { parametresActions } from './../services/parametres/parametresActions';
import { notificationActions } from '../services/notification/notificationActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update,
    setPOS: notificationActions.setPOS
  },dispatch);
}

const ParametresCommandesCanauxCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesCanaux);

export default ParametresCommandesCanauxCont;