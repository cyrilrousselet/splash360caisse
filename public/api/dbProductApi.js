const connect = require("../db/mongodb");
const ProductModel = require("../db/productModel");

const createProduct = async (req, res) => {
  console.log("Create product req: ", req);
  const db = await connect();
  const { payload } = req;
  const product = await ProductModel.create(payload);
  db.disconnect();

  res.send(product);
};

const deleteProduct = async (req, res) => {
  const db = await connect();
  const { payload } = req;
  const product = ProductModel.find({ id: payload.id });
  const deletion = ProductModel.remove(product);

  db.disconnect();
  res.send({ count: deletion });
};

const getProducts = async (_req, res) => {
  const db = await connect();
  const products = await ProductModel.find({});
  db.disconnect();

  res.send(products);
};

module.exports = {
  createProduct,
  deleteProduct,
  getProducts,
};
