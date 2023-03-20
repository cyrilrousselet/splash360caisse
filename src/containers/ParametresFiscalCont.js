// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Fiscal from '../components/Parametres/Fiscal';
import { clotureActions } from '../services/cloture/clotureActions';
// import { clotureServices } from '../services/cloture/clotureServices';
import { parametresActions } from './../services/parametres/parametresActions';


const mapStateToProps = (state) => {
  return {
    data: state.parametresReducer.parametres.options,
    archives_fiscales: state.clotureReducer.archives_fiscales
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getAll: parametresActions.getAll,
    updateValeur: parametresActions.update,
    archiveFiscale: clotureActions.archiveFiscale,
    getArchivesFiscales: clotureActions.getArchivesFiscales,
    checkArchive: clotureActions.checkArchive,
    exportArchive: clotureActions.exportArchive,
    exportSignature: clotureActions.exportSignature
  },dispatch);
}

const ParametresFiscalCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Fiscal);

export default ParametresFiscalCont;