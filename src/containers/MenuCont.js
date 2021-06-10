// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Menu from '../components/Menu';
import { catalogueActions } from '../services/catalogue/catalogueActions';
import { peripheralActions } from '../services/peripheral/peripheralActions';
import { parametresActions } from '../services/parametres/parametresActions';

const mapStateToProps = (state) => {
  return {
    catalogue: state.catalogueReducer.catalogue,
    categories: state.catalogueReducer.categories,
    ingredients: state.catalogueReducer.ingredients,
    ingredientTypes: state.catalogueReducer.ingredientTypes,
    tickets: state.peripheralReducer.tickets,
    clavier: state.parametresReducer.parametres.entreprise.clavier,
    noprintAllowed: ((state.authentication.user.status === 'superuser') || (state.authentication.user.droits.hasOwnProperty("no_print") && (state.authentication.user.droits["no_print"]===true))) ? true : false
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getCatalogue: catalogueActions.getAll,
    getAllTickets: peripheralActions.getAllTickets,
    updateProduit: catalogueActions.updateProduit,
    updateIngredient: catalogueActions.updateIngredient,
    updateMultipleProduits: catalogueActions.updateMultipleProduits,
    updateMultipleIngredients: catalogueActions.updateMultipleIngredients,
    updateGroupe: catalogueActions.updateGroupe,
    updateIngredientType: catalogueActions.updateIngredientType,
    getParametres: parametresActions.getAll
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