import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { commandeActions } from '../services/commande/commandeActions';
import { clotureActions } from '../services/cloture/clotureActions';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { parametresActions } from '../services/parametres/parametresActions';

import history from '../helpers/history';
import paths from './../constants/routes.json';
import MainLoader from '../components/MainLoader';



const gotoDashboard = () => {

  history.push(paths.DASHBOARD);

}


const mapStateToProps = (state) => {
  return {
    paramLoaded: Object.entries(state.parametresReducer.parametres).length>0,
    catLoaded: Object.entries(state.catalogueReducer.catalogue).length>0,
    periLoaded: Object.entries(state.peripheralReducer).length>0, 
    cloLoaded: Object.entries(state.clotureReducer).length>0
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getCommandesList: commandeActions.getCommandesList,
    getAllActive: catalogueActions.getAllActive,
    getParametres: parametresActions.getAll,
    getCurrentPeriode: clotureActions.getCurrentPeriode,
    getCloturesList: clotureActions.getCloturesList,
  }, dispatch);
  return {
    ...bound,
    loadingComplete: gotoDashboard
  }
}

const MainLoaderCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(MainLoader);

export default MainLoaderCont;