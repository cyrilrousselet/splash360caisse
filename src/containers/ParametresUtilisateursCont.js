// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Utilisateurs from '../components/Parametres/Utilisateurs';
import { userActions } from './../services/user/userActions';


const mapStateToProps = (state) => {
  return {
    users: state.userReducer.users,
    clavier: state.parametresReducer.parametres.entreprise.clavier
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: userActions.getAll,
    updateUser: userActions.updateUser,
    createUser: userActions.createUser
  },dispatch);
}

const ParametresUtilisateursCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Utilisateurs);

export default ParametresUtilisateursCont;