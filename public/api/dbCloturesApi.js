const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbClotureGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbClotureGetAll() in API");
    
    (await db.clotures)._.mixin(lodashId);
    const proxies = await _getAll();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbClotureGetCloture: async (req,res) => {
    const {payload} = req;
    log.info("dbClotureGetCloture("+payload.clotureId+") in API");
    (await db.clotures)._.mixin(lodashId);
    const proxies = await _findCommande({ticketId: payload.clotureId});
    log.info(proxies);
    res.send(proxies);
  },
  dbCloturePersist: async (req,res) => {
      const {payload} = req;
      log.info("dbCloturePersist() in API");

      (await db.clotures)._.mixin(lodashId);
      const confirm = await _persistCloture(payload.cloture);

      res.send(confirm);
  }

}



async function _getAll() {
  
  const __rawdata = await _findCloture();
  return _parseCloture(__rawdata);
}


/**
 * Get clotures data from DB
 */
async function _findCloture(criteriae={}) {
  log.info(criteriae);
  let _clo = [];
  if ("clotureId" in criteriae) {
    _clo = await (await db.clotures).get('clotures')
                                    .find(criteriae)
                                    .value();
  } else {
    _clo = await (await db.clotures).get('clotures')
                                    .value();
  }
  return { _clo };
}

async function _persistCloture(payload) {

  const __now = new Date().getTime();
  let _clo = await (await db.clotures).get('clotures')
                                      .find({clotureId: payload.clotureId})
                                      .value();
  log.info(_clo);
  if (_clo) {
    log.info('clo existe, donc on update');
    let __upd = {..._clo, ...payload, updatedAt: __now};
    _clo = await (await db.clotures).get('clotures')
                                    .find({clotureId: payload.clotureId})
                                    .assign(__upd)
                                    .write();
  }
  else {
    log.info('pas de clo donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _clo = await (await db.clotures).get('clotures')
                                    .insert(__ins)
                                    .write();
  }

  return _clo != null;
}

function _parseCloture(_rawdata) {
  let __clotures = {};
  _rawdata._clo.forEach(c => {
    __clotures[c.clotureId] = c;
  });

  return {clotureslist: __clotures};
}

module.exports = actions;