// sconst connect = require("../db/mongodb");
// const ProductModel = require("../db/productModel");
const realmModule = require("../db/realm");

const { getRealm } = realmModule;

const createProduct = async (req, res) => {
  console.log("Create product req: ", req);
  const realm = await getRealm();
  // const db = await connect();
  const { payload } = req;
  // const product = await ProductModel.create(payload);
  // db.disconnect();
  let product;
  realm.write(() => {
    product = realm.create("Products", payload);
  });

  res.send(product || payload);
};

const deleteProduct = async (req, res) => {
  // const db = await connect();
  const realm = await getRealm();
  const { payload } = req;
  // const product = ProductModel.find({ id: payload.id });
  // const deletion = ProductModel.remove(product);
  const products = realm.objects("Products").filtered(`id = ${payload.id}`);
  if (products && products.length === 1) {
    realm.write(() => {
      realm.delete(products[0]);
      products[0] = null;
      res.send({ count: deletion });
    });
  }

  // db.disconnect();
};

const getProducts = async (_req, res) => {
  // const db = await connect();
  // const products = await ProductModel.find({});
  // db.disconnect();
  const realm = await getRealm();
  console.log("Getting Products... ");
  const products = realm.objects("Products");
  console.log("Products: ", products);
  res.send(products || []);
};

module.exports = {
  createProduct,
  deleteProduct,
  getProducts,
};
