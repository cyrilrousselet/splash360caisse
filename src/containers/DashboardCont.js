import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Dashboard from '../components/Dashboard';
import { modulesList } from '../constants/modules';
import { commandeActions } from '../services/commande/commandeActions';
import { clotureActions } from '../services/cloture/clotureActions';
import { getPeriode } from '../services/cloture/clotureReducer';
import { getCommandesListError, getCommandesListLoading, getCommandesList } from '../services/commande/commandesListReducer';
import history from '../helpers/history';
import paths from './../constants/routes.json';
import Swal from 'sweetalert2';


import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { parametresActions } from '../services/parametres/parametresActions';
let strings = new LocalizedStrings(data);

const getModulesFromDroits = (droits) => {
  droits = {...droits, encaissement: true, listecommandes: true};
  return modulesList.filter(function(value) {
    // return droits.indexOf(value) > -1;
    return (droits.hasOwnProperty(value) && droits[value]==true);
  });
}


const userLogout = () => {
  Swal.fire({
    type: 'warning',
    title: strings.dashboard.logout.titre,
    text: strings.dashboard.logout.texte,
    showCancelButton: true,
    focusCancel: true,
    focusConfirm: false
  }).then((result)=> {
    if (result.value) {
      history.push(paths.LOGIN);
    }
  });
}


const gotoCloture = () => {

  history.push(paths.CLOTURE);

  // Swal.fire({
  //   title: 'Souhaitez-vous',
  //   focusConfirm: false,
  //   showCancelButton: true,
  //   customClass: 'cloturePopin',
  //   confirmButtonText: 'Clôturer votre caisse',
  //   cancelButtonText: 'Liste des rapports',
  //   buttonsStyling: false 
  // }).then((result)=> {
  //   if (result.value) {
  //     history.push(paths.CLOTURE);
  //   } else {
  //     console.log('goto liste clotures');
  //   }
  // });
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
    cashname: 'Caisse n°1',
    username: state.authentication.user.nom,
    userid: state.authentication.user.id,
    commandeslist: getCommandesList(state),
    periode: getPeriode(state),
    points: null, //200,
    modules: getModulesFromDroits(state.authentication.user.droits),
    devise: ' €',
    caisse: 0
  }
}

// const mapDispatchToProps = (dispatch) => {
//   return {
//     getCommandesList: commandeActions.getCommandesList,
//     onClickUseraccount: userLogout,
//     onClickModule: text => history.push(paths[text])
//   }
// }


const mapDispatchToProps = (dispatch) => {
  const binded = bindActionCreators({
    getCommandesList: commandeActions.getCommandesList,
    getAllActive: catalogueActions.getAllActive,
    getParametres: parametresActions.getAll,
    getCurrentPeriode: clotureActions.getCurrentPeriode,
  }, dispatch);
  return {
    ...binded,
    onClickUseraccount: userLogout,
    onClickModule: beforeClickModule
  };
}

const DashboardPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

export default DashboardPage;