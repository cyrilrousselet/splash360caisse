// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesCanaux from '../components/Parametres/CommandesCanaux';
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
    // setPOS: notificationActions.setPOS,
    setRestaurantOnline: notificationActions.setRestaurantOnline
  },dispatch);
}

const ParametresCommandesCanauxCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesCanaux);

export default ParametresCommandesCanauxCont;