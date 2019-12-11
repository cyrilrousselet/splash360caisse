import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { catalogueActions } from '../services/catalogue/catalogueActions'
import { commandeActions } from '../services/commande/commandeActions';
import { getCatalogueError, getCatalogue, getCatalogueLoading } from '../services/catalogue/catalogueReducer';
import Selecteur from '../components/Encaissement/Selecteur';


const mapStateToProps = (state) => {
  return {
    loading: getCatalogueLoading(state),
    catalogue: getCatalogue(state),
    error: getCatalogueError(state)
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