import { productActionTypes } from "./productActionTypes";

const initialState = {
  items: [],
};

export function productReducer(state = initialState, action) {
  switch (action.type) {
    case productActionTypes.GET_ALL_PRODUCTS:
      return { ...state, items: [] };
    case productActionTypes.CREATE_PRODUCT:
      return { ...state, items: [...state.items, action.payload] };
    case productActionTypes.GET_ALL_PRODUCTS_SUCCESS:
      return { ...state, items: [...action.payload] };
    default:
      return state;
  }
}

export const getProducts = (state) => state.items;
