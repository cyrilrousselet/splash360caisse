const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbClientsGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbClientsGetAll() in API");
    
    (await db.clients)._.mixin(lodashId);
    const proxies = await _getAllClients();
      
    res.send(proxies);
  },
  dbClientsGetClient: async (req,res) => {
    const {payload} = req;
    log.info("dbClientsGetClient("+payload.client_id+") in API");
    (await db.clients)._.mixin(lodashId);
    const proxies = await _findClient({client_id: payload.client_id});
    log.info(proxies);
    res.send(proxies);
  },

  dbClientsFindClient: async (req, res) => {

    const {payload} = req;
    log.info("dbClientsFindClient("+payload+") in API");
    (await db.clients)._.mixin(lodashId);
    const proxies = await _findClient(payload);
    log.info("dbClientsFindClient", proxies);
    res.send(proxies);
  },

  dbClientPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbClientPersist() in API");

      (await db.clients)._.mixin(lodashId);
      const confirm = await _persistClient(payload.client);

      res.send(confirm);
  },
  dbClientDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbClientDelete() in API");

    (await db.clients)._.mixin(lodashId);
    const confirm = await _deleteClient(payload.client_id);

    res.send(confirm);
  },

  dbGetItems: async (itemtype, ids) => {

    (await db.clients)._.mixin(lodashId);
    const response = await (await db.clients).get('clients')
                                             .filter( c => ids.includes(c.client_id) )
                                             .value();
    
    return response;
  },

  dbClientsSummary: async (query) => {

    (await db.clients)._.mixin(lodashId);


    const {stationid, exclusion} = query;

    let _cltSummary = [];

    const _clt = await (await db.clients).get('clients')
                                         .filter( c => {
                                           return exclusion 
                                             ? (c.localsync === undefined) || !c.localsync.includes(stationid)
                                             : (c.localsync === undefined) ||  c.localsync.includes(stationid)
                                             ;
                                         })
                                         .value();
    if (_clt) {
      _cltSummary = _clt.map(c => (
        {
          id: c.client_id,
          updatedAt: c.updatedAt
        }
      ));
    }
    return {
      clients: _cltSummary
    };
  }

}



async function _getAllClients() {
  
  const __rawdata = await _findClient();
  return _parseClient(__rawdata);
}


/**
 * Get clients data from DB
 */
async function _findClient(criteriae={}) {
  log.info(criteriae);
  let _clt = [];
  if ("client_id" in criteriae) {
    _clt = await (await db.clients).get('clients')
                                   .find(criteriae)
                                   .value();
  } else if ("telephone" in criteriae) {
    _clt = await (await db.clients).get('clients')
                                   .find((c) => (
                                      (criteriae.telephone!=="" && (c.telephone===criteriae.telephone || c.telephone2===criteriae.telephone)) ||  
                                      (criteriae.telephone2!=="" && (c.telephone===criteriae.telephone2 || c.telephone2===criteriae.telephone2)) || 
                                      (criteriae.email!=="" && (String(c.email).toLowerCase()===String(criteriae.email).toLowerCase()))
                                   ))
                                   .value();
  } else {
    _clt = await (await db.clients).get('clients')
                                   .value();
  }
  return { _clt };
}

async function _persistClient(payload) {

  const __now = new Date().getTime();
  let _clt = await (await db.clients).get('clients')
                                    .find({client_id: payload.client_id})
                                    .value();
  log.info(_clt);
  if (_clt) {
    log.info('clt existe, donc on update');
    let __upd = {..._clt, ...payload, updatedAt: __now};
    _clt = await (await db.clients).get('clients')
                                  .find({client_id: payload.client_id})
                                  .assign(__upd)
                                  .write();
  }
  else {
    log.info('pas de clt donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _clt = await (await db.clients).get('clients')
                                  .insert(__ins)
                                  .write();
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

  const _clt = await (await db.clients).get('clients')
                                      .remove({ client_id: client_id })
                                      .write();
  return _clt.length>0;

}

module.exports = actions;