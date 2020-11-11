import LocalizedStrings from "react-localization";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import { data } from "../constants/translations";
import history from "../helpers/history";
import TopZoneView from "./../components/TopZoneView";
import paths from "./../constants/routes.json";

let strings = new LocalizedStrings(data);

const userLogout = () => {
  Swal.fire({
    type: "warning",
    title: strings.dashboard.logout.titre,
    text: strings.dashboard.logout.texte,
    showCancelButton: true,
    focusCancel: true,
    focusConfirm: false,
  }).then((result) => {
    if (result.value) {
      history.push(paths.LOGIN);
    }
  });
};

const mapStateToProps = (state) => {
  return {
    cashname: state.parametresReducer.parametres.options?.caisse?.nom,
    username: state.authentication.user.nom,
    userid: state.authentication.user.id,
    homename: strings.dashboard.nom,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClickUseraccount: userLogout,
  };
};

const TopZone = connect(mapStateToProps, mapDispatchToProps)(TopZoneView);

export default TopZone;
