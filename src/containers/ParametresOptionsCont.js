// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Options from '../components/Parametres/Options';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.options
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update
  },dispatch);
}

const ParametresOptionsCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Options);

export default ParametresOptionsCont;