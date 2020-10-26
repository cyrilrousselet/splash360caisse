import { emit } from "eiphop";

const createProduct = (product) => {
  return emit("createProduct", product);
};

const getAllProducts = () => {
  return emit("getProducts");
};

export const productServices = {
  createProduct,
  getAllProducts,
};
