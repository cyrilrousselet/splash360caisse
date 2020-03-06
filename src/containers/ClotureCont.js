import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Cloture from '../components/Cloture';
import { commandeActions } from '../services/commande/commandeActions';
import { clotureActions } from '../services/cloture/clotureActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { getPeriode } from '../services/cloture/clotureReducer';

// import {data} from '../constants/translations';
// import LocalizedStrings from 'react-localization';
// let strings = new LocalizedStrings(data);


const mapStateToProps = (state) => {
  return {
    periode: getPeriode(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  const binded = bindActionCreators({
    // getCommandesList: commandeActions.getCommandesList,
    getCurrentPeriode: clotureActions.getCurrentPeriode,
    printPeriodeX: peripheralActions.printPeriodeX
  }, dispatch);
  return {
    ...binded    
  };
}

const ClotureCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cloture);

export default ClotureCont;