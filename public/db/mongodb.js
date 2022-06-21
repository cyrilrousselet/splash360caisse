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
  // log.info('cnx '+JSON.stringify(mongoose.connection!==null));
  
  if (db===null) {
  
    try {
      db = mongoose.connect("mongodb://localhost/splash", mongooseOpts);
      // db = await mongoose.connect("mongodb://splash:splash360@localhost/splash", mongooseOpts);
      log.info('App connected to mongo');
      return db;
    }
    catch(e) {
      log.error("Cannot connect to mongo: ", e);
      return false;
    }
  } else {
    return db;
  }
  
}

module.exports = connect;
