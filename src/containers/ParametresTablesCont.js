// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Tables from '../components/Parametres/Tables';
import { parametresActions } from './../services/parametres/parametresActions';
import { tableActions } from './../services/table/tableActions';


const mapStateToProps = (state) => {
  return {
    activation: state.parametresReducer.parametres.commandes!==undefined ? state.parametresReducer.parametres.commandes.gestion_tables : false,
    salles: state.tableReducer.salles,
    clavier: state.parametresReducer.parametres.entreprise.clavier
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getSallesList: tableActions.getSallesList,
    updateValeur: parametresActions.update,
    addSalle: tableActions.addSalle,
    updateSalle: tableActions.updateSalle,
    deleteSalle: tableActions.deleteSalle,
    addTable: tableActions.addTable,
    updateTable: tableActions.updateTable,
    deleteTable: tableActions.deleteTable
  },dispatch);
}

const ParametresTablesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tables);

export default ParametresTablesCont;