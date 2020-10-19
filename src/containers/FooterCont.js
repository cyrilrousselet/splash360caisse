import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux';
import Footer from '../components/Footer';
import history from '../helpers/history';
import paths from './../constants/routes.json';
import Swal from 'sweetalert2';


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
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    userLogout: userLogout
  };
}

const FooterCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Footer);

export default FooterCont;