// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Utilisateurs from '../components/Parametres/Utilisateurs';
import { parametresActions } from '../services/parametres/parametresActions';
import { userActions } from './../services/user/userActions';


const mapStateToProps = (state) => {
  return {
    users: state.userReducer.users,
    options: state.parametresReducer.parametres.options,
    clavier: state.parametresReducer.parametres.entreprise.clavier,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: userActions.getAll,
    updateUser: userActions.updateUser,
    createUser: userActions.createUser,
    updateValeur: parametresActions.update,
    exportListe: userActions.exportListe,
  },dispatch);
}

const ParametresUtilisateursCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Utilisateurs);

export default ParametresUtilisateursCont;