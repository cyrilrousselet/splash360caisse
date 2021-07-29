const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbSecteursGetAll: async (req,res) => {
    // const {payload} = req;
    log.info("dbSecteursGetAll() in API");
    
    const proxies = await _getAllZip();
      
    res.send(proxies);
  },

  dbSecteursFindZip: async (req, res) => {

    const {payload} = req;
    log.info("dbSecteursFindZip("+payload+") in API");
    const proxies = await _findZip(payload);
    log.info("dbSecteursFindZip", proxies);
    res.send(proxies);
  },

  dbSecteursGetLot: async (req, res) => {
    const {payload} = req;
    log.info('dbSecteursGetLot() in API');

    (await db.lots)._.mixin(lodashId);
    const proxies = await _findLot(payload);
    res.send(proxies);
  },

  dbSecteursPersistLot: async (req, res) => {

    const {payload} = req;
    log.info("dbSecteursPersistLot() in API");

    (await db.lots)._.mixin(lodashId);
    const confirm = await _persistLot(payload.lot);

    res.send(confirm);

  },
  dbSecteursDeleteLot: async (req,res) => {
    const {payload} = req;
    log.info("dbSecteursDeleteLot() in API");

    (await db.lots)._.mixin(lodashId);
    const confirm = await _deleteLot(payload.lot_id);

    res.send(confirm);
  }


}



async function _getAllZip() {
  
  const __rawdata = await _findZip();
  return _parseZip(__rawdata);
}


/**
 * Get clients data from DB
 */
async function _findZip(criteriae={}) {
  log.info(criteriae);
  let _sct = [];
  if (criteriae!=={}) {

    if (criteriae.hasOwnProperty('zip')) {
      
      _sct = await (await db.secteurs).get('secteurs')
                                      .filter(sct => {
                                       return sct.zip.toString().includes(criteriae.zip);
                                      })
                                      .value();
    }
    else if (criteriae.hasOwnProperty('nom')) {
    
      _sct = await (await db.secteurs).get('secteurs')
                                      .filter(sct => {
                                        return sct.nom.includes(criteriae.nom) || sct.ligne5.includes(criteriae.nom);
                                      })
                                      .value();
    }

  } else {
    _sct = await (await db.secteurs).get('secteurs')
                                   .value();
  }
  return { secteurs: _sct };
}

function _parseZip(_rawdata) {
  // let __pointages = {};
  // _rawdata._pnt.forEach(p => {
  //   __pointages[p.pointage_id] = p;
  // });

  // return {pointageslist: __pointages};
  return {secteurslist: _rawdata._sct};
}

/**
 * Get lots data from DB
 */
 async function _findLot(criteriae={}) {
  log.info(criteriae);
  let _lot = [];
  if ("lot_id" in criteriae) {
    _lot = await (await db.lots).get('lots')
                                   .find(criteriae)
                                   .value();
  } else {
    _lot = await (await db.lots).get('lots')
                                  .value();
  }
  return _lot;
}

async function _persistLot(payload) {

  const __now = new Date().getTime();
  let _lot = await (await db.lots).get('lots')
                                    .find({lot_id: payload.lot_id})
                                    .value();
  log.info(_lot);
  if (_lot) {
    log.info('lot existe, donc on update');
    let __upd = {..._lot, ...payload, updatedAt: __now};
    _lot = await (await db.lots).get('lots')
                                  .find({lot_id: payload.lot_id})
                                  .assign(__upd)
                                  .write();
  }
  else {
    log.info('pas de lot donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _lot = await (await db.lots).get('lots')
                                .insert(__ins)
                                .write();
  }

  return _lot;
}


async function _deleteLot(lot_id) {

  const _lot = await (await db.lots).get('lots')
                                      .remove({ lot_id: lot_id })
                                      .write();
  return _lot.length>0;

}


module.exports = actions;