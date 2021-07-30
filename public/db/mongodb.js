const mongoose = require("mongoose");
// const log = require("electron-log");
const log = require('../utils/logger');

let db = null;

async function connect() {
  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    // useUnifiedTopology: true,
    poolSize: 10,
  };
  log.info('cnx', mongoose.connection!==null);
  
  if (db===null) {
    db = mongoose.connect("mongodb://localhost/splash", mongooseOpts);
  } else {
    return db;
  }
  
  mongoose.connection.on("error", function (error) {
    console.error("Cannot connect to mongo: ", error);
  });

  mongoose.connection.on("connected", function() {
    return db;
  });
  
  mongoose.connection.on("connected", function() {
    return db;
  });

}

module.exports = connect;
