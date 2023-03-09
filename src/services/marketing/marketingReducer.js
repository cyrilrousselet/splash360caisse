import { marketingActionTypes } from './marketingActionTypes';

const initialState = {
  loading: false,
  error: null,
  avoirs: [],
  reglespanier: [],
  reglescatalogue: [],
  gifts: [],
}

export function marketingReducer(state = initialState, action) {

  switch (action.type) {

    
    case marketingActionTypes.GET_AVOIRS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        avoirs: action.avoirslist
      };
    case marketingActionTypes.GET_REGLESCATALOGUE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reglescatalogue: action.reglescataloguelist
      };
    case marketingActionTypes.GET_REGLESPANIER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reglespanier: action.reglespanierlist
      };
    case marketingActionTypes.GET_GIFTS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        gifts: action.giftslist
      };
    default:
      return state;
  }
}

export const getAvoirs = state => state.marketingReducer.avoirs;
export const getReglesPanier = state => state.marketingReducer.reglespanier;
export const getReglesCatalogue = state => state.marketingReducer.reglescatalogue;
export const getGifts = state => state.marketingReducer.gifts;