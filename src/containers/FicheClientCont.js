// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import FicheClient from '../components/Clients/FicheClient';
import { clientsActions } from './../services/clients/clientsActions';


const mapStateToProps = (state) => {
  return {
    clients: state.clientsReducer.clients
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: clientsActions.getClientsList,
    updateClient: clientsActions.updateClient,
    createClient: clientsActions.createClient
  },dispatch);
}

const FicheClientCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(FicheClient);

export default FicheClientCont;