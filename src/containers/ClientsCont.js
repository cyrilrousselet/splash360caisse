// @flow
import { connect } from 'react-redux'
import Clients from '../components/Clients/index.js';
import { clientsActions } from '../services/clients/clientsActions';

const mapStateToProps = (state) => {
  return {
    clients: state.clientsReducer.clients
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getClients: clientsActions.getClientsList
  }
}

const ClientsCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Clients);

export default ClientsCont;