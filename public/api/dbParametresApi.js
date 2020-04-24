const db = require('../db.js');
const log = require('electron-log');
const hydration = require('../dev/dbhydration_chickenstreet.js');
const {parametres, imprimantes, tickets} = hydration;


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
  
  let __rawp, __rawi, __rawt;

  let __params = await db.parametres.count();
  log.info('count params = '+__params);
  if (__params==0) {
    __rawp = await _fillinParametres();
  } else {
    __rawp = await _findParametres();
  }

  let __impr = await db.imprimantes.count();
  log.info('count impr = '+__impr);
  if (__impr==0) {
    __rawi = await _fillinImprimantes();
  } else {
    __rawi = await _findImprimantes();
  }

  let __tck = await db.tickets.count();
  log.info('count tck = '+__tck);
  if (__tck==0) {
    __rawt = await _fillinTickets();
  } else {
    __rawt = await _findTickets();
  }
  
  return _parseParametres({...__rawp, ...__rawi, ...__rawt});
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

  const __impr = {};
  _rawdata._impr.forEach(p => {
    __impr[p.printer_id] = {id: p.printer_id, nom: p.nom, connexion: p.connexion, param: p.param, encoding: p.encoding, default: p.default};
  });
  const __tck = {};
  _rawdata._tck.forEach(t => {
    __tck[t.ticket_id] = {id: t.ticket_id, nom: t.nom, template: t.template, imprimantes: t.imprimantes};
  });

  return {parametres: __param, imprimantes: __impr, tickets: __tck};
}


/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinImprimantes() {
  const _impr = await db.imprimantes.insert(imprimantes);
  return { _impr };
}
/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinTickets() {
  const _tck = await db.tickets.insert(tickets);
  return { _tck };
}
/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinParametres() {
  log.info('_fillinParametres()');
  const _param = await db.parametres.insert(parametres);
  return { _param };
}

/**
 * Get all catalogue data from DB
 */
async function _findParametres(prd_criteriae={}) {
  const _param = await db.parametres.find({});
  log.info('_findParametres()');
  log.info(_param);
  return { _param };
}
async function _findImprimantes(prd_criteriae={}) {
  const _impr = await db.imprimantes.find({});
  return { _impr };
}
async function _findTickets(prd_criteriae={}) {
  const _tck = await db.tickets.find({});
  return { _tck };
}



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


async function _persistParametres(payload) {

  if (Array.isArray(payload)) {
    let count = 0;

    const start = async () => {
      await asyncForEach(payload, async (obj) => {
        let _param = await db.parametres.findOne({domaine: obj.domaine, cle: obj.cle});
        if (_param) {
          let __upd = {..._param, ...obj};
          log.info('persistParametres() update', __upd);
          if (_param = await db.parametres.update({domaine: obj.domaine, cle: obj.cle}, __upd)) count++;
        } else {
          log.info('persistParametres() insert', obj);
          if (_param = await db.parametres.insert(obj)) count++;
        }
      });
      return count == payload.length;
    }
    start();

  }
  else {
    let _paramo = await db.parametres.findOne({domaine: payload.domaine, cle: payload.cle});
    if (_paramo) {
      let __upd = {..._paramo, ...payload};
      log.info('persistParametres() update', __upd);
      _paramo = await db.parametres.update({domaine: payload.domaine, cle: payload.cle}, __upd);
    } else {
      log.info('persistParametres() insert', payload);
      _paramo = await db.parametres.insert(payload);
    }
    return _paramo != null;
  }
}



module.exports = actions;