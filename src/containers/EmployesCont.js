// @flow
import { connect } from 'react-redux'
import Employes from '../components/Employes';


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const EmployesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Employes);

export default EmployesCont;