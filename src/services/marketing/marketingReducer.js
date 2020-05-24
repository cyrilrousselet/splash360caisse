import { marketingActionTypes } from './marketingActionTypes';

const initialState = {
  loading: false,
  error: null,
  avoirs: [],
  reglespanier: [],
  reglescatalogue: []
}

export function marketingReducer(state = initialState, action) {

  switch (action.type) {

    
    case marketingActionTypes.GET_AVOIRS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        avoirs: action.avoirslist
      };
    default:
      return state;
  }
}

export const getAvoirs = state => state.marketingReducer.avoirs;
export const getReglesPanier = state => state.marketingReducer.reglespanier;
export const getReglesCatalogue = state => state.marketingReducer.reglescatalogue;