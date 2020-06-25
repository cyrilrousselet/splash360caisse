// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Menu from '../components/Menu';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';

const mapStateToProps = (state) => {
  return {
    catalogue: state.catalogueReducer.catalogue,
    categories: state.catalogueReducer.categories,
    ingredients: state.catalogueReducer.ingredients,
    ingredientTypes: state.catalogueReducer.ingredientTypes,
    tickets: state.peripheralReducer.tickets
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getCatalogue: catalogueActions.getAll,
    getAllTickets: peripheralActions.getAllTickets,
    updateProduit: catalogueActions.updateProduit,
    updateIngredient: catalogueActions.updateIngredient,
    updateGroupe: catalogueActions.updateGroupe,
    updateIngredientType: catalogueActions.updateIngredientType
  }, dispatch);
  return {
    ...bound
  }
}

const MenuCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);

export default MenuCont;