import { connect } from 'react-redux'
import { userActions } from '../actions/userActions'
import Login from '../components/Login';

const mapStateToProps = (state) => {
  return {};
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: userActions.logout,
    login: (passphrase) => {
      dispatch(userActions.login(passphrase))
    }
  }
}

const LoginCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

export default LoginCont;