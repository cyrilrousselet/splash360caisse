// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Statistiques from '../components/Statistiques';
import { commandeActions } from '../services/commande/commandeActions';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { getCommandesListError, getCommandesListLoading, getCommandesList } from '../services/commande/commandesListReducer';


const mapStateToProps = (state) => {
  return {
    loading: getCommandesListLoading(state),
    error: getCommandesListError(state),
    commandeslist: getCommandesList(state),
    canaux: state.parametresReducer.parametres.options.canaux || []
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getAllActive: catalogueActions.getAllActive,
      getCommandesList: commandeActions.getCommandesList
  }, dispatch);
  return {
    ...bound
  }
}

const StatistiquesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Statistiques);

export default StatistiquesCont;