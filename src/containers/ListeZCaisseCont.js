import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import ListeZCaisse from '../components/Cloture/ListeZCaisse';
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
      zcaisselist: state.clotureReducer.zcaisse,
      fonddecaisse_activation: state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.fonddecaisse_activation===true,
      monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getZCaisse: clotureActions.getZCaisse,
      printZCaisse: peripheralActions.printZCaisse,
      exportComptable: clotureActions.exportComptable
  }, dispatch);
  return {
    ...bound,
    onClickSubModule: text => history.push(paths[text]),
    getServiceMouvements: tresorServices.getServiceMouvements
  }
}

const ListeZCaisseCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeZCaisse);

export default ListeZCaisseCont;