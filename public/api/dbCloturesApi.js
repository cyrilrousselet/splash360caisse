const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');
const isAfter = require('date-fns/isAfter');


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
  },

  dbClotureGetToSync: async (req,res) => {
    const {payload} = req;
    const limit = payload.limit;
    (await db.clotures)._.mixin(lodashId);
    const proxies = await _getCloturesToSync(limit);
    res.send(proxies);
  },

  dbCloturesSummary: async () => {

    (await db.clotures)._.mixin(lodashId);

    const _clo = await (await db.clotures).get('clotures').value();
    const _cloSummary = _clo.map(c => (
      {
        id: c.clotureId,
        updatedAt: c.updatedAt
      }
    ));
    return {
      clotures: _cloSummary
    };
  },
  dbClotureSetSynced: async (req,res) => {
    const { payload } = req;
    log.info('dbClotureSetSynced(['+payload.ids+'],'+payload.datetime+') in API');

    (await db.clotures)._.mixin(lodashId);
    const confirm = await _setSynced(payload.ids, payload.datetime);

    res.send(confirm);
  },

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

  return _clo;
}

function _parseCloture(_rawdata) {
  let __clotures = {};
  _rawdata._clo.forEach(c => {
    __clotures[c.clotureId] = c;
  });

  return {clotureslist: __clotures};
}



async function _getCloturesToSync(limit=null) {

  let _clo = [];

  if (limit!==null && limit>0) {
    _clo = await (await db.clotures).get('clotures')
                                         .filter(c => {
                                           let toadd = true;
                                           if (c.hasOwnProperty('sync')==true) {
                                             if (isAfter(new Date(c.sync), new Date(c.updatedAt))) {
                                               toadd = false;
                                             }
                                           }
                                           return toadd;
                                         })
                                         .slice(0,limit)
                                         .value();
  } else {

    _clo = await (await db.clotures).get('clotures')
                                         .filter(c => {
                                           let toadd = true;
                                           if (c.hasOwnProperty('sync')==true) {
                                             if (isAfter(new Date(c.sync), new Date(c.updatedAt))) {
                                               toadd = false;
                                             }
                                           }
                                           return toadd;
                                         })
                                         .value();
  }

  
  return {clotures:_clo};
}


async function _setSynced(ids, datetime) {

  const __datetime = new Date(datetime).getTime();

  log.info('datetime', __datetime);

  // on en profite pour vider la propriété cmdtoarchive de chaque cloture synchronisée

  let _clo = await (await db.clotures).get('clotures')
                                       .filter(c => ids.includes(c.id))
                                       .each((c) => {
                                         c.sync = __datetime;
                                         c.updatedAt = __datetime;
                                         c.cmdtoarchive = [];
                                        })
                                        .write();
                                       

  log.info('_clo', _clo.length);
  // let _cmd = 1;
  return _clo != null;
}

module.exports = actions;