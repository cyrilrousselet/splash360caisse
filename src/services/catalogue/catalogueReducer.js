import { catalogueActionTypes } from './catalogueActionTypes';

const initialState = {
  loading: false,
  catalogue: {},
  tva: {},
  steps: {},
  ingredients: {},
  error: null
};

export function catalogueReducer(state = initialState, action) {
console.log(action);

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

export const getCatalogue = state => state.catalogueReducer.catalogue;
export const getCatalogueLoading = state => state.catalogueReducer.loading;
export const getCatalogueError = state => state.catalogueReducer.error;