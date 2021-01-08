import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import ListeClotures from '../components/Cloture/ListeClotures';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { clotureActions } from '../services/cloture/clotureActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';


const mapStateToProps = (state) => {
  return {
      loading: state.clotureReducer.loading,
      error: state.clotureReducer.error,
      heure_fin: (state.parametresReducer.parametres.entreprise && state.parametresReducer.parametres.entreprise.heure_fin) || '05:00',
      clotureslist: state.clotureReducer.clotures
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getCloturesList: clotureActions.getCloturesList,
      printCloture: peripheralActions.printCloture
  }, dispatch);
  return {
    ...bound,
    onClickSubModule: text => history.push(paths[text])
  }
}

const ListeCloturesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeClotures);

export default ListeCloturesCont;