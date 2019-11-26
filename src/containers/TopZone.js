import { connect } from 'react-redux'
import history from '../helpers/history';
import paths from './../constants/routes.json';
import Swal from 'sweetalert2';

import TopZoneView from './../components/TopZoneView';

import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
let strings = new LocalizedStrings(data);

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
    homename: strings.dashboard.nom
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClickUseraccount: userLogout,
  }
};

const TopZone = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopZoneView);

export default TopZone;