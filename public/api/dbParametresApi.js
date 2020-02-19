const db = require('../db.js');
const log = require('electron-log');
const hydration = require('../dev/dbhydration.js');
const {parametres} = hydration;


const actions = {
  dbParametresGetAll: async (req,res) => {
    const {payload} = req;

    log.info("dbParametresGetAll() in API");

    const proxies = await _getAll();
    res.send(proxies);

  },
  dbParametresUpdate: async (req,res) => {
      const {payload} = req;
      log.info("dbParametresPersist() in API");

      const confirm = await _persistParametres(payload.payload);

      res.send({confirm: confirm, ...payload});

  }
}

async function _getAll() {
  
  let __rawdata;
  let __params = await db.parametres.count();
  log.info('count params = '+__params);
  if (__params==0) {
    log.info('dbParametresApi._getAll() : init DB');
    __rawdata = await _fillinParametres();
  } else {
    __rawdata = await _findParametres();
  }
  return _parseParametres(__rawdata);
}


/** 
 * 
 * @param {object} data from DB 
 */
function _parseParametres(_rawdata) {

  const __param = {};
  _rawdata._param.forEach(p => {

    if (!__param.hasOwnProperty(p.domaine)) {
      Object.defineProperty(__param, p.domaine, {
        value: {},
        writable: true,
        enumerable: true
      });
    }
   // __param[p.domaine].push({[p.cle]: p.valeur});
    Object.defineProperty(__param[p.domaine], p.cle, {
      value: p.valeur,
      writable: true,
      enumerable: true
    });
  });

  return {parametres: __param};
}



/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinParametres() {
  const _param = await db.parametres.insert(parametres);
  return { _param };
}

/**
 * Get all catalogue data from DB
 */
async function _findParametres(prd_criteriae={}) {
  const _param = await db.parametres.find({});
  return { _param };
}



async function _persistParametres(payload) {

  let _param = await db.parametres.findOne({domaine: payload.domaine, cle: payload.cle});
  if (_param) {
    let __upd = {..._param, ...payload};
    _param = await db.parametres.update({domaine: payload.domaine, cle: payload.cle}, __upd);
  } else {
    _param = await db.parametres.insert(payload);
  }

  return _param != null;
}



module.exports = actions;