// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Utilisateurs from '../components/Parametres/Utilisateurs';
import { parametresActions } from '../services/parametres/parametresActions';
import { userActions } from './../services/user/userActions';


const mapStateToProps = (state) => {
  return {
    users: state.userReducer.users,
    options: state.parametresReducer.parametres.options,
    clavier: state.parametresReducer.parametres.entreprise.clavier
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: userActions.getAll,
    updateUser: userActions.updateUser,
    createUser: userActions.createUser,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresUtilisateursCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Utilisateurs);

export default ParametresUtilisateursCont;