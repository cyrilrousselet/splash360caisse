// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import CommandesCommentaires from '../components/Parametres/CommandesCommentaires';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.commandes,
    entreprise: state.parametresReducer.parametres.entreprise
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresCommandesCommentairesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandesCommentaires);

export default ParametresCommandesCommentairesCont;