import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Tresorerie from '../components/Cloture/Tresorerie';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { tresorActions } from '../services/tresorerie/tresorActions';


const mapStateToProps = (state) => {
  return {
      loading: state.tresorReducer.loading,
      error: state.tresorReducer.error,
      mouvements: state.tresorReducer.tresors,
      caisse: state.parametresReducer.parametres.caisse,
      canaux: state.parametresReducer.parametres.canaux,
      user: state.authentication.user
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getTresors: tresorActions.getTresors,
    addTresor: tresorActions.addTresor,
    updateTresor: tresorActions.updateTresor
  }, dispatch);
  return {
    ...bound,
    onClickSubModule: text => history.push(paths[text])
  }
}

const TresorerieCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tresorerie);

export default TresorerieCont;