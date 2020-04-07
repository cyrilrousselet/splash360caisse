const db = require('../db.js');
const log = require('electron-log');
const hydration = require('../dev/dbhydration_chickenstreet.js');
const {clotures} = hydration;


const actions = {
  dbClotureGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbClotureGetAll() in API");
    
    const proxies = await _getAll();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbClotureGetCloture: async (req,res) => {
    const {payload} = req;
    log.info("dbClotureGetCloture("+payload.clotureId+") in API");
    const proxies = await _findCommande({ticketId: payload.clotureId});
    log.info(proxies);
    res.send(proxies);
  },
  dbCloturePersist: async (req,res) => {
      const {payload} = req;
      log.info("dbCloturePersist() in API");

      const confirm = await _persistCloture(payload.cloture);

      res.send(confirm);
  }

}



async function _getAll() {
  
  let __rawdata;
  let __clonum = await db.clotures.count();
  if (__clonum==0) {
    log.info('dbClotureApi._getAll() : init DB');
    __rawdata = await _fillinCloture();
  } else {
    __rawdata = await _findCloture();
  }
  return _parseCloture(__rawdata);
}


/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinCloture() {
  const _clo = await db.clotures.insert(clotures);
  return { _clo };
}

/**
 * Get clotures data from DB
 */
async function _findCloture(criteriae={}) {
  log.info(criteriae);
  let _clo = [];
  if ("clotureId" in criteriae) {
    _clo = await db.clotures.findOne(criteriae);
  } else {
    _clo = await db.clotures.find(criteriae);
  }
  return { _clo };
}

async function _persistCloture(payload) {

  let _clo = await db.clotures.findOne({clotureId: payload.clotureId});
  log.info(_clo);
  if (_clo) {
    log.info('clo existe, donc on update');
    let __upd = {..._clo, ...payload};
    _clo = await db.clotures.update({clotureId: payload.clotureId}, __upd);
  }
  else {
    log.info('pas de clo donc on insert');
    _clo = await db.clotures.insert(payload);
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