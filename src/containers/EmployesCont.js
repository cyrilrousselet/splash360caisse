// @flow
import { connect } from 'react-redux'
import Employes from '../components/Employes';
import { getPointages } from '../services/employes/employesReducer';
import { employesActions } from '../services/employes/employesActions';
import { userActions } from '../services/user/userActions';


const mapStateToProps = (state) => {
  return {
    pointages: getPointages(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getAllPointages: employesActions.getPointagesList,
    getAllUsers: userActions.getAll
  }
}

const EmployesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Employes);

export default EmployesCont;