import { catalogueActionTypes } from './catalogueActionTypes';

const initialState = {
  loading: false,
  catalogue: {},
  tva: {},
  steps: {},
  ingredients: {},
  ingredientTypes: {},
  categories: [],
  error: null
};

export function catalogueReducer(state = initialState, action) {

  switch (action.type) {
    case catalogueActionTypes.GETALL_ACTIVE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case catalogueActionTypes.GETALL_ACTIVE_SUCCESS:
      return {
        ...state,
        loading: false,
        catalogue: action.catalogue,
        tva: action.tva,
        steps: action.steps,
        ingredients: action.ingredients,
        ingredientTypes: action.ingredientTypes,
        categories: action.categories,
        error: null
      };
    case catalogueActionTypes.GETALL_ACTIVE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
        catalogue: {}
      };
    case catalogueActionTypes.GETALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case catalogueActionTypes.GETALL_SUCCESS:
      return {
        ...state,
        loading: false,
        catalogue: action.catalogue,
        tva: action.tva,
        steps: action.steps,
        ingredients: action.ingredients,
        ingredientTypes: action.ingredientTypes,
        categories: action.categories,
        error: null
      };
    case catalogueActionTypes.GETALL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
        catalogue: {}
      };
    default:
      return state
  }
}

export const getSteps = state => state.catalogueReducer.steps;
export const getIngredients = state => state.catalogueReducer.ingredients;
export const getIngredientTypes = state => state.catalogueReducer.ingredientTypes;
export const getCategories = state => state.catalogueReducer.categories;
export const getCatalogue = state => state.catalogueReducer.catalogue;
export const getCatalogueLoading = state => state.catalogueReducer.loading;
export const getCatalogueError = state => state.catalogueReducer.error;