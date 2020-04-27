// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import PeripheriquesImpression from '../components/Parametres/PeripheriquesImpression';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { peripheralActions } from './../services/peripheral/peripheralActions';


const mapStateToProps = (state) => {
  return {
    imprimantes: state.peripheralReducer.imprimantes,
    tickets: state.peripheralReducer.tickets
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAllImprimantes: peripheralActions.getAllImprimantes,
    updateImprimante: peripheralActions.updateImprimante,
    createImprimante: peripheralActions.createImprimante,
    deleteImprimante: peripheralActions.deleteImprimante,
    getAllTickets: peripheralActions.getAllTickets,
    updateTicket: peripheralActions.updateTicket,
    createTicket: peripheralActions.createTicket,
    deleteTicket: peripheralActions.deleteTicket
  },dispatch);
}

const ParametresPeripheriquesImpressionCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(PeripheriquesImpression);

export default ParametresPeripheriquesImpressionCont;