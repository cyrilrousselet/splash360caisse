// @flow
import { connect } from 'react-redux'
import Menu from '../components/Menu';

const mapStateToProps = (state) => {
  return {
    catalogue: state.catalogueReducer.catalogue,
    categories: state.catalogueReducer.categories,
    ingredients: state.catalogueReducer.ingredients,
    ingredientTypes: state.catalogueReducer.ingredientTypes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const MenuCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);

export default MenuCont;