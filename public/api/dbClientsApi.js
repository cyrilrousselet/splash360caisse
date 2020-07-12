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

  dbClientsSummary: async () => {

    (await db.clients)._.mixin(lodashId);

    const _clt = await (await db.clients).get('clients').value();
    const _cltSummary = _clt.map(c => (
      {
        client_id: c.client_id,
        updatedAt: c.updatedAt
      }
    ));
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