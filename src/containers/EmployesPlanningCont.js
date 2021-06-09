// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { getPointages, getShifts } from '../services/employes/employesReducer';
import { employesActions } from '../services/employes/employesActions';
import { userActions } from '../services/user/userActions';
import Planning from '../components/Employes/Plannings';
import { parametresActions } from '../services/parametres/parametresActions';


const getActiveUsers = (state) => {
  if (state.userReducer.users) {
    return state.userReducer.users.filter(u=>u.status!=='deleted' && u.status!=='superuser');
  } else {
    return null;
  }
}


const mapStateToProps = (state) => {
  return {
    pointages: getPointages(state),
    shifts: getShifts(state),
    params: state.parametresReducer.parametres.planning,
    employes: getActiveUsers(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getAllPointages: employesActions.getPointagesList,
    getAllShifts: employesActions.getShiftsList,
    getParametres: parametresActions.getAll,
    getUsers: userActions.getAll,
    createShift: employesActions.createShift,
    updateShift: employesActions.updateShift,
    deleteShift: employesActions.deleteShift
  }, dispatch);
  return {
    ...bound
  };
}

const EmployesPlanningCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Planning);

export default EmployesPlanningCont;