// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Options from '../components/Parametres/Options';
import { parametresActions } from './../services/parametres/parametresActions';
import { data } from '../constants/translations';

const _getLangues = () => {
  let __lg = [];
  if (Object.keys(data).length>1) {
    __lg = Object.entries(data).map( ([k,v]) => ({code: k, nom: v.params.nom}) );
  }
  return __lg;
}

const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.options,
    langues: _getLangues()
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update,
  },dispatch);
}

const ParametresOptionsCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Options);

export default ParametresOptionsCont;