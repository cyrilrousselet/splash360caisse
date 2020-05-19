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
    default:
      return state;
  }
}

export const getAvoirs = state => state.marketingReducer.avoirs;
export const getReglesPanier = state => state.marketingReducer.reglespanier;
export const getReglesCatalogue = state => state.marketingReducer.reglescatalogue;