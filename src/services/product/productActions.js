import { productActionTypes } from "./productActionTypes";
import { productServices } from "./productService";

const createProduct = (product) => {
  return (dispatch) => {
    productServices.createProduct(product).then((res) => {
      dispatch({ type: productActionTypes.CREATE_PRODUCT, payload: res._doc });
    });
  };
};

const loadProducts = () => {
  return (dispatch) => {
    dispatch({ type: productActionTypes.GET_ALL_PRODUCTS });
    productServices.getAllProducts().then((res) => {
      const products = res.map((r) => r._doc);
      dispatch({
        type: productActionTypes.GET_ALL_PRODUCTS_SUCCESS,
        payload: products,
      });
    });
  };
};

export const productActions = {
  createProduct,
  loadProducts,
};
