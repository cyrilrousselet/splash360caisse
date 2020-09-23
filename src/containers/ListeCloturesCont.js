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
      clotureslist: state.clotureReducer.clotures
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getCloturesList: clotureActions.getCloturesList,
      printCloture: peripheralActions.printPeriodeX
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