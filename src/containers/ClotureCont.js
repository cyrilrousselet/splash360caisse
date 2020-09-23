import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Cloture from '../components/Cloture';
import { commandeActions } from '../services/commande/commandeActions';
import { clotureActions } from '../services/cloture/clotureActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { parametresActions } from '../services/parametres/parametresActions';
import { getPeriode } from '../services/cloture/clotureReducer';

// import {data} from '../constants/translations';
// import LocalizedStrings from 'react-localization';
// let strings = new LocalizedStrings(data);


const mapStateToProps = (state) => {
  return {
    periode: getPeriode(state),
    listeCommandes: state.commandesListReducer.commandeslist,
    catalogue: state.catalogueReducer,
    clotures: state.clotureReducer.clotures,
    fonddecaissetheo: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.fonddecaisse_activation) ? state.parametresReducer.parametres.financier.fonddecaisse_montant : 0 
  };
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    // getCommandesList: commandeActions.getCommandesList,
    // getParametres: parametresActions.getAll,
    getCloturesList: clotureActions.getCloturesList,
    getCurrentPeriode: clotureActions.getCurrentPeriode,
    printPeriodeX: peripheralActions.printPeriodeX,
    printLastCloture: peripheralActions.printCloture,
    makeCloture: clotureActions.makeCloture
  }, dispatch);
  return {
    ...bound    
  };
}

const ClotureCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cloture);

export default ClotureCont;