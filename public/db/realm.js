const Realm = require("realm");
const fs = require("fs");
const mkdirp = require("mkdirp");
const { app } = require("electron");

const ProductSchema = {
  name: "Products",
  properties: {
    _id: "objectId",
    id: "number",
    name: "string",
    price: "number",
  },
  primaryKey: "id",
};

const checkDirectorySync = (directory) => {
  try {
    fs.statSync(directory);
  } catch (e) {
    // fs.mkdirSync(directory);
    mkdirp.sync(directory);
  }
};

let realm;
async function openRealm() {
  try {
    const dataPath = `${
      process.env.NODE_ENV === "dev"
        ? "./localRealmDb"
        : app.getPath("userData")
    }/data/splash`;

    console.log(`Data path: ${dataPath}`);

    const config = {
      schema: [ProductSchema],
      path: dataPath,
    };
    realm = Realm.open(config);
  } catch (e) {
    output.error(e);
  }
}

async function getRealm() {
  if (!realm) {
    checkDirectorySync(
      `${
        process.env.NODE_ENV === "dev"
          ? "./localRealmDb"
          : app.getPath("userData")
      }/data`
    );
    console.log("Opening realm DB ...");
    await openRealm();
  }

  return Promise.resolve(realm);
}

async function closeRealm() {
  if (realm) {
    await realm.close();
    realm = undefined;
  }
}

exports.getRealm = getRealm;
exports.closeRealm = closeRealm;
