import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Dashboard from '../components/Dashboard';
import { modulesList } from '../constants/modules';
import { commandeActions } from '../services/commande/commandeActions';
import { clotureActions } from '../services/cloture/clotureActions';
import { getCommandesList } from '../services/commande/commandesListReducer';
import history from '../helpers/history';
import paths from './../constants/routes.json';
// import Swal from 'sweetalert2';


// import {data} from '../constants/translations';
// import LocalizedStrings from 'react-localization';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { parametresActions } from '../services/parametres/parametresActions';
import { marketingActions } from '../services/marketing/marketingActions';
import { journalActions } from '../services/journal/journalActions';
// let strings = new LocalizedStrings(data);

const getModulesFromDroits = (droits) => {
  droits = {...droits, employes: true, encaissement: true, listecommandes: true};
  return modulesList.filter(function(value) {
    // return droits.indexOf(value) > -1;
    return (droits.hasOwnProperty(value) && droits[value]===true);
  });
}


const userAccount = () => {
  console.log('userAccount');
}


const gotoCloture = () => {

  history.push(paths.CLOTURE);

}




const beforeClickModule = (text) => {
  if (text==='CLOTURE') {
    gotoCloture();
  } else {
    history.push(paths[text]);
  }
}


const mapStateToProps = (state) => {
  return {
    cashname: (state.parametresReducer.parametres.options && state.parametresReducer.parametres.options.caisse && state.parametresReducer.parametres.options.caisse.nom) || '',
    username: state.authentication.user.nom,
    userid: state.authentication.user.id,
    commandeslist: getCommandesList(state),
    today_ca: state.clotureReducer.today_ca,
    today_numtickets: state.clotureReducer.today_numtickets,
   // periode: getPeriode(state),
    points: null, //200,
    modules: (state.authentication.user.status === 'superuser') ? modulesList : getModulesFromDroits(state.authentication.user.droits),
    devise: ' €',
    caisse: 0,
    blocage_encaissement: state.tresorReducer.blocage,
    blocage_commande: state.clotureReducer.blocage,
    pastnonconfirmed: state.commandesListReducer.pastnonconfirmed,
    mandatoryError: state.parametresReducer.mandatoryError,
    dateError: state.clotureReducer.date_error,
  }
}

// const mapDispatchToProps = (dispatch) => {
//   return {
//     getCommandesList: commandeActions.getCommandesList,
//     onClickUseraccount: userLogout,
//     onClickModule: text => history.push(paths[text])
//   }
// }

// const userLogout = () => {
//   Swal.fire({
//     type: 'warning',
//     title: strings.dashboard.logout.titre,
//     text: strings.dashboard.logout.texte,
//     showCancelButton: true,
//     focusCancel: true,
//     focusConfirm: false
//   }).then((result)=> {
//     if (result.value) {
//       history.push(paths.LOGIN);
//     }
//   });
// }


const mapDispatchToProps = (dispatch) => {
  const binded = bindActionCreators({
    getTodayCommandesList: commandeActions.getTodayCommandesList,
    getAllActive: catalogueActions.getAllActive,
    getParametres: parametresActions.getAll,
    getTodayCa: clotureActions.getTodayCa,
    getAvoirsList: marketingActions.getAvoirsList,
    getReglesCatalogueList: marketingActions.getReglesCatalogueList,
    getReglesPanierList: marketingActions.getReglesPanierList,
    getCommande: commandeActions.getCommande,
    log: journalActions.log,
    getPastNonConfirmed: commandeActions.getPastNonConfirmed,
    testCloturesAuto: clotureActions.testCloturesAuto,
  }, dispatch);
  return {
    ...binded,
    onClickUseraccount: userAccount,
    onClickModule: beforeClickModule,
    // userLogout: userLogout
  };
}

const DashboardPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

export default DashboardPage;