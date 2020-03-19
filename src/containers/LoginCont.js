import { connect } from 'react-redux'
import { userActions } from '../services/user/userActions';
import { hasUsers } from '../services/user/userReducer';
import Login from '../components/Login';
import { bindActionCreators } from 'redux';

const mapStateToProps = (state) => { 
  return {
    hasUsers: hasUsers(state),
    error: state.authentication.error
  };
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    login: userActions.login,
    checkUsers: userActions.checkUsers,
    setAdmin: userActions.setAdmin,
    resetError: userActions.resetError
  }, dispatch);
  return {
    ...bound,
    logout: userActions.logout
  };
}

const LoginCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

export default LoginCont;