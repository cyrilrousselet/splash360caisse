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
    heure_fin: (state.parametresReducer.parametres.entreprise && state.parametresReducer.parametres.entreprise.heure_fin) || '05:00',
    canaux: state.parametresReducer.parametres.options.canaux || [],
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getAllActive: catalogueActions.getAllActive,
      getCommandesList: commandeActions.getCommandesList,
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