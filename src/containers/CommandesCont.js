import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Commandes from '../components/Parametres/Commandes';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { commandeActions } from '../services/commande/commandeActions'
import { getCommandesListError, getCommandesListLoading, getCommandesList } from '../services/commande/commandesListReducer';


const mapStateToProps = (state) => {
  return {
      loading: getCommandesListLoading(state),
      error: getCommandesListError(state),
      commandeslist: getCommandesList(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  const binded = bindActionCreators({
      getCommandesList: commandeActions.getCommandesList
  }, dispatch);
  return {
    ...binded,
    onClickSubModule: text => history.push(paths[text])
  }
}

const CommandesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Commandes);

export default CommandesCont;