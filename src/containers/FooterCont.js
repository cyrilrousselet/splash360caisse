import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Footer from '../components/Footer';
import history from '../helpers/history';
import paths from './../constants/routes.json';
import Swal from 'sweetalert2';


import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
import { userActions } from '../services/user/userActions';
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
    online: state.parametresReducer.online,
    status: localStorage.getItem("status"),
    expiredate: localStorage.getItem("expireDate"),
    integrite_error: false, //state.signatureReducer.integrite_error,
    sequence_error: false,  //state.signatureReducer.sequence_error,
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    toggleMode: userActions.toggleSuperUserMode
  }, dispatch);
  return {
    ...bound,
    userLogout: userLogout
  }
}

const FooterCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Footer);

export default FooterCont;