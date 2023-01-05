import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { catalogueActions } from '../services/catalogue/catalogueActions'
import { commandeActions } from '../services/commande/commandeActions';
import { getCatalogueError, getCatalogue, getCatalogueLoading, getCategories } from '../services/catalogue/catalogueReducer';
import Selecteur from '../components/Encaissement/Selecteur';


const mapStateToProps = (state) => {
  return {
    loading: getCatalogueLoading(state),
    catalogue: getCatalogue(state),
    categories: getCategories(state),
    error: getCatalogueError(state),
    mode: state.commandeReducer.commande.mode,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
      getAllActive: catalogueActions.getAllActive,
      addProduit: commandeActions.addProduit
  }, dispatch);
}

const SelecteurCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(Selecteur);

export default SelecteurCont;