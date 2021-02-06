import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import { commandeActions } from '../services/commande/commandeActions';
import { clotureActions } from '../services/cloture/clotureActions';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { parametresActions } from '../services/parametres/parametresActions';
import { notificationActions } from '../services/notification/notificationActions';

import history from '../helpers/history';
import paths from './../constants/routes.json';
import MainLoader from '../components/MainLoader';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { tresorActions } from '../services/tresorerie/tresorActions';



const gotoDashboard = () => {
  console.log('gotoDashboard()');
  history.push(paths.DASHBOARD);

}


const mapStateToProps = (state) => {
  return {
    // paramLoading : state.parametresReducer.loading,
    paramLoaded: Object.entries(state.parametresReducer.parametres).length>0,
    // catLoading : state.catalogueReducer.loading,
    catLoaded: Object.entries(state.catalogueReducer.catalogue).length>0,
    // cmdLoading: state.commandesListReducer.loading,
    // cmdLoaded: Object.entries(state.commandesListReducer).length>0,
    // cloLoading : state.clotureReducer.loading,
    cloLoaded: Object.entries(state.clotureReducer).length>0,
    sseInit: state.notificationReducer.sseInit,
    params: state.parametresReducer.parametres.options,
    dbupdated: state.parametresReducer.dbupdated,
    dbgetInit: state.notificationReducer.getdbInit,
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getParametres: parametresActions.getAll,
    getLastClotureAndAfter: tresorActions.getLastClotureAndAfter,
    getCatalogue: catalogueActions.getAllActive,
    // getTodayCommandesList: commandeActions.getTodayCommandesList,
    getCloturesList: clotureActions.getCloturesList,
    getCurrentPeriode: clotureActions.getCurrentPeriode,
    getTodayCa: clotureActions.getTodayCa,
    initSSE: notificationActions.initSSE,
    setPOS: notificationActions.setPOS,
    initSync: notificationActions.initSync,
    getDatabase: notificationActions.getDatabase,
    initSyncCommandes: notificationActions.initSyncCommandes,
    initSyncClotures: notificationActions.initSyncClotures,
    quitApp: peripheralActions.quitApp,
    // loadNumero: commandeActions.loadNumero
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