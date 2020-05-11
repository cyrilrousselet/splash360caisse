// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { getPointages, getShifts, getTimeadjusts } from '../services/employes/employesReducer';
import { getUsers } from '../services/user/userReducer';
import { employesActions } from '../services/employes/employesActions';
import { userActions } from '../services/user/userActions';
import Paies from '../components/Employes/Paies';
import { parametresActions } from '../services/parametres/parametresActions';


const getActiveUsers = (state) => {
  if (state.userReducer.users) {
    return state.userReducer.users.filter(u=>u.status!=='deleted');
  } else {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    pointages: getPointages(state),
    users: getUsers(state),
    shifts: getShifts(state),
    adjusts: getTimeadjusts(state),
    params: state.parametresReducer.parametres.planning,
    employes: getActiveUsers(state),
    admin: state.authentication.user
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getAllPointages: employesActions.getPointagesList,
    getAllShifts: employesActions.getShiftsList,
    getParametres: parametresActions.getAll,
    getAllTimeadjusts: employesActions.getTimeadjustsList,
    getUsers: userActions.getAll,
    createTimeadjust: employesActions.createTimeadjust,
    updateTimeadjust: employesActions.updateTimeadjust,
    deleteTimeadjust: employesActions.deleteTimeadjust
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