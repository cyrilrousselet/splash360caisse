import { connect } from 'react-redux'
import { userActions } from '../services/user/userActions';
import { hasUsers } from '../services/user/userReducer';
import Login from '../components/Login';
import { bindActionCreators } from 'redux';
import { signatureActions } from '../services/signature/signatureActions';
import { journalActions } from '../services/journal/journalActions';

const mapStateToProps = (state) => { 
  return {
    hasUsers: hasUsers(state),
    error: state.authentication.error,
    superuserLoginMode: state.authentication.superuserMode
  };
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    login: userActions.login,
    loginSU: userActions.loginSU,
    checkUsers: userActions.checkUsers,
    setAdmin: userActions.setAdmin,
    resetError: userActions.resetError,
    storeKeys: signatureActions.storeKeys,
    storeNumerotation: signatureActions.storeNumerotation,
    log: journalActions.log
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