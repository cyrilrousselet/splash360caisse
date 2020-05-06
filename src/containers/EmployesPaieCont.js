// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { getPointages } from '../services/employes/employesReducer';
import { getUsers } from '../services/user/userReducer';
import { employesActions } from '../services/employes/employesActions';
import { userActions } from '../services/user/userActions';
import Paies from '../components/Employes/Paies';


const mapStateToProps = (state) => {
  return {
    pointages: getPointages(state),
    users: getUsers(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getAllPointages: employesActions.getPointagesList,
    getUsers: userActions.getAll
  }, dispatch);
  return {
    ...bound
  };
}

const EmployesPaiesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Paies);

export default EmployesPaiesCont;