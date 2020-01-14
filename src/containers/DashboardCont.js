import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Dashboard from '../components/Dashboard';
import { modulesList } from '../constants/modules';
import { commandeActions } from '../services/commande/commandeActions'
import { getCommandesListError, getCommandesListLoading, getCommandesList } from '../services/commande/commandesListReducer';
import history from '../helpers/history';
import paths from './../constants/routes.json';
import Swal from 'sweetalert2';


import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
let strings = new LocalizedStrings(data);

const getModulesFromDroits = (droits) => {
  droits = [...droits, 'encaissement'];
  return modulesList.filter(function(value) {
    return droits.indexOf(value) > -1;
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



const mapStateToProps = (state) => {
  return {
    cashname: 'Caisse n°1',
    username: state.authentication.user.nom,
    userid: state.authentication.user.id,
    commandeslist: getCommandesList(state),
    points: 200,
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
    getCommandesList: commandeActions.getCommandesList
  }, dispatch);
  return {
    ...binded,
    onClickUseraccount: userLogout,
    onClickModule: text => history.push(paths[text])
  };
}

const DashboardPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

export default DashboardPage;