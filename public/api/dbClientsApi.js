// const db = require('../db.js');
// const lodashId = require('lodash-id');
// const log = require('electron-log');
const log = require('../utils/logger');
const connect = require("../db/mongodb");
const ClientModel = require("../db/clientModel");
const { uuid } = require("uuidv4");


const actions = {
  dbClientsGetAll: async (req,res) => {
    // const {payload} = req;
    log.info("dbClientsGetAll() in API");
    
    const proxies = await _getAllClients();
      
    res.send(proxies);
  },
  dbClientsGetClient: async (req,res) => {
    const {payload} = req;
    log.info("dbClientsGetClient("+payload.client_id+") in API");
    const proxies = await _findClient({client_id: payload.client_id});
    log.info(proxies);
    res.send(proxies);
  },

  dbClientsFindClient: async (req, res) => {

    const {payload} = req;
    log.info("dbClientsFindClient("+payload+") in API");
    const proxies = await _findClient(payload);
    log.info("dbClientsFindClient", proxies);
    res.send(proxies);
  },

  dbClientPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbClientPersist() in API");

      const confirm = await _persistClient(payload.client);

      res.send(confirm);
  },
  dbClientDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbClientDelete() in API");

    const confirm = await _deleteClient(payload.client_id);

    res.send(confirm);
  },

  dbGetItems: async (itemtype, ids) => {

    const _clt = await _findClient({client_id: {$in: ids}});
    return _clt;
  },

  dbClientsSummary: async (query) => {

    const _clt = await _findClient(query);

    return {
      client: _clt
    };
  },

  syncConfirm: async (db, ids, from) => {
    const _n = await _addLocalSync(ids,from);
    return _n;
  },

}



async function _getAllClients() {
  
  const __rawdata = await _findClient();
  return _parseClient(__rawdata);
}


async function _addLocalSync(ids, store_id) {
  const mongo = await connect();
  if (!mongo) return false;

  const _clts = await ClientModel.updateMany(
    {client_id: {$in: ids}, localsync: { $ne: store_id }},
    {$push: {localsync: store_id}}
  );

  return _clts.n;

}


/**
 * Get clients data from DB
 */
async function _findClient(criteriae={}) {
  log.info(criteriae);
  const mongo = await connect();
  if (!mongo) return false;
  // let _clt = [];
 // if ("client_id" in criteriae) {
    // _clt = await (await db.clients).get('clients')
    //                                .find(criteriae)
    //                                .value();
    const _clt = await ClientModel.find(criteriae).lean().sort({nom: 1, prenom: 1}).exec();

  // } else if ("telephone" in criteriae) {
  //   _clt = await (await db.clients).get('clients')
  //                                  .find((c) => (
  //                                     (criteriae.telephone!=="" && (c.telephone===criteriae.telephone || c.telephone2===criteriae.telephone)) ||  
  //                                     (criteriae.telephone2!=="" && (c.telephone===criteriae.telephone2 || c.telephone2===criteriae.telephone2)) || 
  //                                     (criteriae.email!=="" && (String(c.email).toLowerCase()===String(criteriae.email).toLowerCase()))
  //                                  ))
  //                                  .value();
  // } else {
  //   _clt = await (await db.clients).get('clients')
  //                                  .value();
  // }
  return { _clt };
}

async function _persistClient(payload) {

  const __now = new Date().getTime();
  const mongo = await connect();
  if (!mongo) return false;
  let _clt = await ClientModel.where({client_id: payload.client_id})
                              .findOne()
                              .lean()
                              .exec();
  if (_clt) {
    log.info('clt existe, donc on update');
    _clt = {..._clt, ...payload, updatedAt: __now};
    _clt = await ClientModel.updateOne({client_id: payload.client_id}, _clt).exec();
  }
  else {
    log.info('pas de clt donc on insert');
    const id = await _generateClientId();
    let __ins = {...payload, id: id, createdAt: __now, updatedAt: __now};
    _clt = await ClientModel.create(__ins);
    _clt = __ins;
  }

  return _clt;
}

function _parseClient(_rawdata) {
  // let __pointages = {};
  // _rawdata._pnt.forEach(p => {
  //   __pointages[p.pointage_id] = p;
  // });

  // return {pointageslist: __pointages};
  return {clientslist: _rawdata._clt};
}

async function _deleteClient(client_id) {
  const mongo = await connect();
  if (!mongo) return false;

  const _clt = await ClientModel.deleteOne({client_id: client_id});
  return _clt.deleteCount>0;

}


async function _generateClientId() {
  let id;

  do {
    id = uuid();
  } while (await ClientModel.exists({ id: id }));

  return id;
}

module.exports = actions;