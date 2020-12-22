import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Tresorerie from '../components/Cloture/Tresorerie';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { tresorActions } from '../services/tresorerie/tresorActions';

const getCaisses = (state) => {
  const {stations} = state.parametresReducer.parametres.options;
  if (stations) {
    return stations.filter( (st) => st.origine.toLowerCase() === "caisse" );
  }
  return null;
}

const mapStateToProps = (state) => {
  return {
      loading: state.tresorReducer.loading,
      error: state.tresorReducer.error,
      mouvements: state.tresorReducer.tresors,
      caisse: state.parametresReducer.parametres.options.caisse,
      caisses: getCaisses(state),
      heure_fin: (state.parametresReducer.parametres.entreprise && state.parametresReducer.parametres.entreprise.heure_fin) || '05:00',
      user: state.authentication.user
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getLastOuvertureAndAfter: tresorActions.getLastOuvertureAndAfter,
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