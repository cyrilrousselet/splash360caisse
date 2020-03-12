import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import ListeCommandes from '../components/ListeCommandes';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { commandeActions } from '../services/commande/commandeActions';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { getCommandesListError, getCommandesListLoading, getCommandesList } from '../services/commande/commandesListReducer';
import { peripheralActions } from '../services/peripheral/peripheralActions';

const mapStateToProps = (state) => {
  return {
      loading: getCommandesListLoading(state),
      error: getCommandesListError(state),
      commandeslist: getCommandesList(state),
      tickets: ['sac','commande', 'cuisine', 'sucré', 'brasserie']
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getAllActive: catalogueActions.getAllActive,
      getCommandesList: commandeActions.getCommandesList,
      getCommande: commandeActions.getCommande,
      printTicket: peripheralActions.printTicket
  }, dispatch);
  return {
    ...bound,
    onClickSubModule: text => history.push(paths[text])
  }
}

const ListeCommandesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeCommandes);

export default ListeCommandesCont;