const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbParametresGetAll: async (req,res) => {
    const {payload} = req;

    log.info("dbParametresGetAll() in API");

    (await db.parametres)._.mixin(lodashId);
    (await db.imprimantes)._.mixin(lodashId);
    (await db.tickets)._.mixin(lodashId);
    const proxies = await _getAll();
    res.send(proxies);

  },

  dbParametresCompleteDB: async (req,res) => {
    const {data} = req.payload;

    log.info("dbParametresCompleteDB() in API", data);

    (await db.parametres)._.mixin(lodashId);

    const confirm = await _replaceAll(data);

    res.send(confirm);
  },

  dbParametresUpdate: async (req,res) => {
      const {payload} = req;
      log.info("dbParametresPersist() in API");

      (await db.parametres)._.mixin(lodashId);
      (await db.imprimantes)._.mixin(lodashId);
      (await db.tickets)._.mixin(lodashId);
      const confirm = await _persistParametres(payload.payload);

      res.send({confirm: confirm, ...payload});
  },
  dbParametresUpdateImprimante: async (req,res) => {
    const {payload} = req;
    log.info("dbParametresUpdateImprimante() in API");

    (await db.parametres)._.mixin(lodashId);
    (await db.imprimantes)._.mixin(lodashId);
    (await db.tickets)._.mixin(lodashId);
    const confirm = await _persistImprimante(payload.imprimante);

    res.send({confirm: confirm, ...payload});
  },
  dbParametresGetallImprimantes: async (req,res) => {

    log.info("dbParametresGetallImprimantes() in API");

    (await db.parametres)._.mixin(lodashId);
    (await db.imprimantes)._.mixin(lodashId);
    (await db.tickets)._.mixin(lodashId);
    const proxies = await _getAllImprimantes();
    res.send(proxies);
  },
  dbParametresGetallTickets: async (req,res) => {

    log.info("dbParametresGetallTickets() in API");

    (await db.parametres)._.mixin(lodashId);
    (await db.imprimantes)._.mixin(lodashId);
    (await db.tickets)._.mixin(lodashId);
    const proxies = await _getAllTickets();
    res.send(proxies);
  },
  dbParametresUpdateTicket: async (req,res) => {
    const {payload} = req;
    log.info("dbParametresUpdateTicket() in API");

    (await db.parametres)._.mixin(lodashId);
    (await db.imprimantes)._.mixin(lodashId);
    (await db.tickets)._.mixin(lodashId);
    const confirm = await _persistTicket(payload.ticket);

    res.send({confirm: confirm, ...payload});
  }
}

async function _getAll() {
  
  const __rawp = await _findParametres();
  const __rawi = await _findImprimantes();
  const __rawt = await _findTickets();
  
  return _parseParametres({...__rawp, ...__rawi, ...__rawt});
}


async function _replaceAll(data) {

  log.info('_replaceAll', data);
  let count = 0;

  const start = async () => {
    await asyncForEach(data, async (obj) => {
      
//        _param = await _insertParametre(obj);
        _param = await _persistParametres(obj);
        if (_param!=null) count++;
      
    });
    return count == data.length;
  }
  start();

}


async function _getAllImprimantes() {
  const __rawi = await _findImprimantes();
  const __impr = _parseImprimantes(__rawi._impr);
  return {imprimantes: __impr};
}

async function _getAllTickets() {
  const __rawt = await _findTickets();
  const __tck = _parseTickets(__rawt._tck);
  return {tickets: __tck};
}


function _parseImprimantes(_rawimp) {
  const __impr = {};
  _rawimp.forEach(p => {
    // __impr[p.printer_id] = {printer_id: p.printer_id, nom: p.nom, connexion: p.connexion, param: p.param, encoding: p.encoding, pardefaut: p.pardefaut};
    __impr[p.printer_id] = p;
  });
  return __impr;
}

function _parseTickets(_rawtck) {
  const __tck = {};
  _rawtck.forEach(t => {
    // __tck[t.ticket_id] = {ticket_id: t.ticket_id, nom: t.nom, template: t.template, imprimantes: t.imprimantes, weight: t.weight, kds: t.kds};
    __tck[t.ticket_id] = t;
  });
  return __tck;
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
    Object.defineProperty(__param[p.domaine], p.cle, {
      value: p.valeur,
      writable: true,
      enumerable: true
    });
  });
  const __impr = _parseImprimantes(_rawdata._impr);
  const __tck = _parseTickets(_rawdata._tck);

  return {parametres: __param, imprimantes: __impr, tickets: __tck};
}



/**
 * Get all catalogue data from DB
 */
async function _findParametres(prd_criteriae={}) {
  const _param = await (await db.parametres).get('parametres').value();
  return { _param };
}
async function _findImprimantes(prd_criteriae={}) {
  const _impr = await (await db.imprimantes).get('imprimantes').value();
  return { _impr };
}
async function _findTickets(prd_criteriae={}) {
  const _tck = await (await db.tickets).get('tickets').value();
  return { _tck };
}



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


async function _persistParametres(payload) {

  const __now = new Date().getTime();

  if (Array.isArray(payload)) {
    let count = 0;

    const start = async () => {
      await asyncForEach(payload, async (obj) => {
        let _param = await (await db.parametres).get('parametres')
                                                .find({domaine: obj.domaine, cle: obj.cle})
                                                .value();
        if (_param) {
          let __upd = {..._param, ...obj, updatedAt:__now};
          log.info('persistParametres() update', __upd);
          _param = await (await db.parametres).get('parametres')
                                              .find({domaine: obj.domaine, cle: obj.cle})
                                              .assign(__upd)
                                              .write();
          if (_param!=null) count++;
        } else {
          _param = await _insertParametre(obj);
          if (_param!=null) count++;
        }
      });
      return count == payload.length;
    }
    start();

  }
  else {
    let _param_o = await (await db.parametres).get('parametres')
                                              .find({domaine: payload.domaine, cle: payload.cle})
                                              .value();
    if (_param_o) {
      let __upd = {..._param_o, ...payload, updatedAt:__now};
      log.info('persistParametres() update', __upd);
      _param_o = await (await db.parametres).get('parametres')
                                            .find({domaine: payload.domaine, cle: payload.cle})
                                            .assign(__upd)
                                            .write();
    } else {
      log.info('persistParametres() insert', payload);
      _param_o = await _insertParametre(payload);
    }
    return _param_o != null;
  }
}

async function _insertParametre(payload) {

  log.info('_insertParametre()');
  const __now = new Date().getTime();
  const __p = {...payload, createdAt:__now, updatedAt:__now};
  const _param = await (await db.parametres).get('parametres')
                                            .insert(__p)
                                            .write();
  log.info("new param", _param);                                            
  return _param;
}


async function _persistImprimante(payload) {

  log.info("_persistImprimante()");

  const __now = new Date().getTime();

  let { printer_id } = payload;
  let _printer = await (await db.imprimantes).get('imprimantes')
                                             .find({printer_id: printer_id})
                                             .value();
  if (_printer) {
    let __upd = {..._printer, ...payload, updatedAt:__now};
    log.info('__upd',__upd);
    _printer = await (await db.imprimantes).get('imprimantes')
                                           .find({printer_id: printer_id})
                                           .assign(__upd)
                                           .write();
  } else {
    printer_id = 'imp'+uniqid();
    const __p = {...payload, printer_id: printer_id, createdAt:__now, updatedAt:__now};
    _printer = await (await db.imprimantes).get('imprimantes')
                                           .insert(__p)
                                           .write();
  }

  return {confirm:(_printer != null), printer_id:printer_id};
}

async function _persistTicket(payload) {

  log.info("_persistTicket()");
  const __now = new Date().getTime();

  let { ticket_id } = payload;
  let _ticket = await (await db.tickets).get('tickets')
                                        .find({ticket_id: ticket_id})
                                        .value();
  if (_ticket) {
    let __upd = {..._ticket, ...payload, updatedAt:__now};
    _ticket = await (await db.tickets).get('tickets')
                                      .find({ticket_id: ticket_id})
                                      .assign(__upd)
                                      .write();
  } else {
    ticket_id = 'tck'+uniqid();
    const __p = {...payload, ticket_id: ticket_id, createdAt:__now, updatedAt:__now};
    _ticket = await (await db.tickets).get('tickets')
                                      .insert(__p)
                                      .write();
  }

  return {confirm:(_ticket != null), ticket_id:ticket_id};
}

function uniqid() {
  return new Date().getTime().toString();
}

module.exports = actions;