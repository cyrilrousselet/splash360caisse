import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import ListeClotures from '../components/Cloture/ListeClotures';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { clotureActions } from '../services/cloture/clotureActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { tresorServices } from '../services/tresorerie/tresorServices';


const mapStateToProps = (state) => {
  return {
      loading: state.clotureReducer.loading,
      error: state.clotureReducer.error,
      heure_fin: (state.parametresReducer.parametres.entreprise && state.parametresReducer.parametres.entreprise.heure_fin) || '05:00',
      clotureslist: state.clotureReducer.clotures,
      fonddecaisse_activation: state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.fonddecaisse_activation===true
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getCloturesList: clotureActions.getCloturesList,
      printCloture: peripheralActions.printCloture
  }, dispatch);
  return {
    ...bound,
    onClickSubModule: text => history.push(paths[text]),
    getServiceMouvements: tresorServices.getServiceMouvements
  }
}

const ListeCloturesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeClotures);

export default ListeCloturesCont;