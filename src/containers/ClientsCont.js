// @flow
import { connect } from 'react-redux'
import Clients from '../components/Clients';

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const ClientsCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Clients);

export default ClientsCont;