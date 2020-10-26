const mongoose = require("mongoose");

async function connect() {
  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    poolSize: 10,
  };

  const db = mongoose.connect("mongodb://localhost/youtill", mongooseOpts);

  mongoose.connection.on("error", function () {
    console.error("Canot connect to mongo: ", error);
  });

  return db;
}

module.exports = connect;
