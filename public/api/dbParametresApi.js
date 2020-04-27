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
  },
  dbParametresUpdateImprimante: async (req,res) => {
    const {payload} = req;
    log.info("dbParametresUpdateImprimante() in API");

    const confirm = await _persistImprimante(payload.imprimante);

    res.send({confirm: confirm, ...payload});
  },
  dbParametresGetallImprimantes: async (req,res) => {

    log.info("dbParametresGetallImprimantes() in API");

    const proxies = await _getAllImprimantes();
    res.send(proxies);
  },
  dbParametresGetallTickets: async (req,res) => {

    log.info("dbParametresGetallTickets() in API");

    const proxies = await _getAllTickets();
    res.send(proxies);
  },
  dbParametresUpdateTicket: async (req,res) => {
    const {payload} = req;
    log.info("dbParametresUpdateTicket() in API");

    const confirm = await _persistTicket(payload.ticket);

    res.send({confirm: confirm, ...payload});
  },
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


async function _getAllImprimantes() {

  let __imprn = await db.imprimantes.count();
  let __raw;
  log.info('count impr = '+__imprn);
  if (__imprn==0) {
    __raw = await _fillinImprimantes();
  } else {
    __raw = await _findImprimantes();
  }
  
  const __impr = {};
  __raw._impr.forEach(p => {
    __impr[p.printer_id] = {printer_id: p.printer_id, nom: p.nom, connexion: p.connexion, param: p.param, encoding: p.encoding, pardefaut: p.pardefaut};
  });
  return {imprimantes: __impr};
}

async function _getAllTickets() {

  let __tckn = await db.tickets.count();
  let __raw;
  log.info('count tck = '+__tckn);
  if (__tckn==0) {
    __raw = await _fillinTickets();
  } else {
    __raw = await _findTickets();
  }

  const __tck = {};
  __raw._tck.forEach(t => {
    __tck[t.ticket_id] = {ticket_id: t.ticket_id, nom: t.nom, template: t.template, imprimantes: t.imprimantes};
  });

  return {tickets: __tck};
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
    __impr[p.printer_id] = {printer_id: p.printer_id, nom: p.nom, connexion: p.connexion, param: p.param, encoding: p.encoding, pardefaut: p.pardefaut};
  });
  const __tck = {};
  _rawdata._tck.forEach(t => {
    __tck[t.ticket_id] = {ticket_id: t.ticket_id, nom: t.nom, template: t.template, imprimantes: t.imprimantes};
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


async function _persistImprimante(payload) {


  log.info("*** _persistImprimante()");
  log.info(payload);
  log.info('***');

  let { printer_id } = payload;
  let _printer = await db.imprimantes.findOne({printer_id: printer_id});
  if (_printer) {
    let __upd = {..._printer, ...payload};
    log.info('__upd',__upd);
    _printer = await db.imprimantes.update({printer_id: printer_id}, __upd);
  } else {
    printer_id = 'imp'+uniqid();
     _printer = await db.imprimantes.insert({...payload, printer_id: printer_id});
  }

  return {confirm:(_printer != null), printer_id:printer_id};
}

async function _persistTicket(payload) {

  let { ticket_id } = payload;
  let _ticket = await db.tickets.findOne({ticket_id: ticket_id});
  if (_ticket) {
    let __upd = {..._ticket, ...payload};
    _ticket = await db.tickets.update({ticket_id: ticket_id}, __upd);
  } else {
    ticket_id = 'tck'+uniqid();
    _ticket = await db.tickets.insert({...payload, ticket_id: ticket_id});
  }

  return {confirm:(_ticket != null), ticket_id:ticket_id};
}

function uniqid() {
  return new Date().getTime().toString();
}

module.exports = actions;