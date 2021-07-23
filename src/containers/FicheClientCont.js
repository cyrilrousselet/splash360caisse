// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import FicheClient from '../components/Clients/FicheClient';
// import { clientsServices } from '../services/clients/clientsServices';
import { clientsActions } from './../services/clients/clientsActions';


const mapStateToProps = (state) => {
  return {
    clients: state.clientsReducer.clients,
    secteurs: state.clientsReducer.secteurs,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: clientsActions.getClientsList,
    updateClient: clientsActions.updateClient,
    createClient: clientsActions.createClient,
    // searchSecteurs: clientsServices.searchSecteurs,
  },dispatch);
}

const FicheClientCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(FicheClient);

export default FicheClientCont;