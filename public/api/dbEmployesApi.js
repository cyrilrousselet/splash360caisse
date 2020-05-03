const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbPointagesGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbPointagesGetAll() in API");
    
    (await db.pointages)._.mixin(lodashId);
    const proxies = await _getAll();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbPointagesGetPointage: async (req,res) => {
    const {payload} = req;
    log.info("dbPointagesGetPointage("+payload.pointage_id+") in API");
    (await db.pointages)._.mixin(lodashId);
    const proxies = await _findPointage({pointage_id: payload.pointage_id});
    log.info(proxies);
    res.send(proxies);
  },
  dbPointagesPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbPointagesPersist() in API");

      (await db.pointages)._.mixin(lodashId);
      const confirm = await _persistPointage(payload.pointage);

      res.send(confirm);
  }

}



async function _getAll() {
  
  const __rawdata = await _findPointage();
  return _parsePointage(__rawdata);
}


/**
 * Get clotures data from DB
 */
async function _findPointage(criteriae={}) {
  log.info(criteriae);
  let _pnt = [];
  if ("pointage_id" in criteriae) {
    _pnt = await (await db.pointages).get('pointages')
                                    .find(criteriae)
                                    .value();
  } else {
    _pnt = await (await db.pointages).get('pointages')
                                    .value();
  }
  return { _pnt };
}

async function _persistPointage(payload) {

  const __now = new Date().getTime();
  let _pnt = await (await db.pointages).get('pointages')
                                      .find({pointage_id: payload.pointage_id})
                                      .value();
  log.info(_pnt);
  if (_pnt) {
    log.info('pnt existe, donc on update');
    let __upd = {..._pnt, ...payload, updatedAt: __now};
    _pnt = await (await db.pointages).get('pointages')
                                    .find({pointage_id: payload.pointage_id})
                                    .assign(__upd)
                                    .write();
  }
  else {
    log.info('pas de pnt donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _pnt = await (await db.pointages).get('pointages')
                                    .insert(__ins)
                                    .write();
  }

  return _pnt != null;
}

function _parsePointage(_rawdata) {
  let __pointages = {};
  _rawdata._pnt.forEach(p => {
    __pointages[p.pointage_id] = p;
  });

  // return {pointageslist: __pointages};
  return {pointageslist: _rawdata._pnt};
}

module.exports = actions;