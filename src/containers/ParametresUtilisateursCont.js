// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Utilisateurs from '../components/Parametres/Utilisateurs';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { userActions } from './../services/user/userActions';


const mapStateToProps = (state) => {
  return {
    users: state.userReducer.users
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