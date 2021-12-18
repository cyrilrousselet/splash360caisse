import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import ListeCommandes from '../components/ListeCommandes';
import history from './../helpers/history';
import paths from './../constants/routes.json';
import { commandeActions } from '../services/commande/commandeActions';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { getCommandesListError, getCommandesListLoading, getCommandesList } from '../services/commande/commandesListReducer';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { clientsActions } from '../services/clients/clientsActions';
import { getLivreurs } from '../services/user/userReducer';
import { userActions } from '../services/user/userActions';


const getTicketsListe = (state) => {

  const { tickets } = state.peripheralReducer;
  const liste = Object.values(tickets).filter(tck => (tck.imprimantes.length>0 && (['commande','partiel','principal']).indexOf(tck.template)>-1));
  return liste;
}


const mapStateToProps = (state) => {
  return {
      loading: getCommandesListLoading(state),
      error: getCommandesListError(state),
      commandeslist: getCommandesList(state),
      tickets: getTicketsListe(state),
      livreurs: getLivreurs(state),
      commande : state.commandeReducer.commande,
      heure_fin: (state.parametresReducer.parametres.entreprise && state.parametresReducer.parametres.entreprise.heure_fin) || '05:00',
      thiscash: (state.parametresReducer.parametres.options && state.parametresReducer.parametres.options.caisse) || {},
      pastnonconfirmed: state.commandesListReducer.pastnonconfirmed
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
      getAllActive: catalogueActions.getAllActive,
      getCommandesList: commandeActions.getCommandesList,
      getCommande: commandeActions.getCommande,
      getClientsList: clientsActions.getClientsList,
      deleteCommande: commandeActions.deleteCommande,
      printTicket: peripheralActions.printTicket,
      duplicata: commandeActions.duplicata,
      setLivreur: commandeActions.setLivreur,
      getUsers: userActions.getAll,
      addPrintnum: commandeActions.addPrintnum,
      deleteCurrentCommande: commandeActions.deleteCurrentCommande,
      getPastNonConfirmed: commandeActions.getPastNonConfirmed 
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