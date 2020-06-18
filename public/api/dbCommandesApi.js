const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbCommandeGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbCommandeGetAll() in API");
    
    (await db.commandes)._.mixin(lodashId);
    const proxies = await _getAll();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbCommandeGetCommande: async (req,res) => {
    const {payload} = req;
    log.info("dbCommandeGetCommande("+payload.ticketId+") in API");
    (await db.commandes)._.mixin(lodashId);
    const proxies = await _findCommande({ticketId: payload.ticketId});
    log.info(proxies);
    res.send(proxies);
  },
  dbCommandePersist: async (req,res) => {
      const {payload} = req;
      log.info("dbCommandePersist() in API");

      (await db.commandes)._.mixin(lodashId);
      const confirm = await _persistCommande(payload.commande);

      res.send(confirm);
  },
  dbCommandeArchive: async (req,res) => {
    const { payload } = req;
    log.info('dbCommandeArchive(['+payload.ids+'],'+payload.clotureId+') in API');

    (await db.commandes)._.mixin(lodashId);
    const confirm = await _setArchived(payload.ids, payload.clotureId);

    res.send(confirm);
  },
  dbCommandeDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbCommandeDelete() in API");

    (await db.commandes)._.mixin(lodashId);
    const confirm = await _deleteCommande(payload.ticketId, payload.motif);

    res.send(confirm);
  },


  dbTicketsRestauGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbTicketsRestauGetAll() in API");
    
    (await db.ticketsrestau)._.mixin(lodashId);
    const proxies = await _getAllTicketsRestau();
      
    res.send(proxies);
  },
  dbTicketsRestauGetOne: async (req,res) => {
    const {payload} = req;
    log.info("dbTicketsRestauGetOne("+payload.ticketrestau_id+") in API");

    (await db.ticketsrestau)._.mixin(lodashId);
    const proxies = await _findTicketRestau({ticketrestau_id: payload.ticketrestau_id});

    res.send(proxies);
  },
  dbTicketsRestauPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbTicketsRestauPersist() in API");

      (await db.ticketsrestau)._.mixin(lodashId);
      const confirm = await _persistTicketRestau(payload.payload);

      res.send(confirm);
  }


}



async function _getAll() {
  
  const __rawdata = await _findCommande();
  return _parseCommandes(__rawdata);
}


/**
 * Get commandes data from DB
 */
async function _findCommande(criteriae={}) {
  log.info(criteriae);
  let _cmd = [];
  if ("ticketId" in criteriae) {
    _cmd = await (await db.commandes).get('commandes')
                                     .find(criteriae)
                                     .value();
  } else {
    _cmd = await (await db.commandes).get('commandes')
                                     .value();
  }
  return { _cmd };
}

async function _persistCommande(payload) {

  const __now = new Date().getTime();

  let _cmd = await (await db.commandes).get('commandes')
                                       .find({ticketId: payload.ticketId})
                                       .value();
  log.info(_cmd);
  if (_cmd) {
    log.info('cmd existe, donc on update');
    let __upd = {..._cmd, ...payload, updatedAt: __now};
    _cmd = await (await db.commandes).get('commandes')
                                     .find({ticketId: payload.ticketId})
                                     .assign(__upd)
                                     .write();
  }
  else {
    log.info('pas de cmd donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _cmd = await (await db.commandes).get('commandes')
                                     .insert(__ins)
                                     .write();
  }

  return _cmd != null;
}

function _parseCommandes(_rawdata) {
  let __commandes = {};
  _rawdata._cmd.forEach(c => {
    __commandes[c.ticketId] = c;
  });

  return {commandeslist: __commandes};
}



async function _deleteCommande(ticketId, motif) {

  const _cmd = await (await db.commandes).get('commandes')
                                         .find({ticketId: ticketId})
                                         .assign({status:'deleted', motif: motif})
                                         .write();

  return _cmd.length>0;
}


async function _setArchived(ids, clotureId) {

  const __now = new Date().getTime();
  log.info(ids);
  let _cmd = await (await db.commandes).get('commandes')
                                       .filter((c) => ids.indexOf(c.ticketId)!=-1)
                                       .each((c) => {
                                         c.archived = clotureId;
                                         c.updatedAt = __now;
                                        })
                                       .write();
  // let _cmd = 1;
  return _cmd != null;
}



/**
 * Get ticketsrestau data from DB
 */
async function _getAllTicketsRestau() {
  
  const __rawdata = await _findTicketRestau();
  return _parseTicketsRestau(__rawdata);
}


/**
 * Get ticketsrestau data from DB
 */
async function _findTicketRestau(criteriae={}) {
  log.info(criteriae);
  let _tr = [];
  if ("ticketrestau_id" in criteriae) {
    _tr = await (await db.ticketsrestau).get('ticketsrestau')
                                        .find(criteriae)
                                        .value();
  } else {
    _tr = await (await db.ticketsrestau).get('ticketsrestau')
                                        .value();
  }
  return { _tr };
}



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


/**
 * Insert or Update ticketsrestau data into DB
 */
async function _persistTicketRestau(payload) {

  const __now = new Date().getTime();

  if (Array.isArray(payload)) {
    let count = 0;

    const start = async () => {
      await asyncForEach(payload, async (obj) => {
        let _tr = await (await db.ticketsrestau).get('ticketsrestau')
                                                .find({ticketrestau_id: payload.ticketrestau_id})
                                                .value();

        if (_tr) {
          log.info('_tr existe, donc on update');
          let __upd = {..._tr, ...obj, updatedAt:__now};
          _tr = await (await db.paramticketsrestauetres).get('ticketsrestau')
                                                        .find({ticketrestau_id: payload.ticketrestau_id})
                                                        .assign(__upd)
                                                        .write();
          if (_tr!=null) count++;
        } else {
          _tr = await _insertTicketRestau(obj);
          if (_tr!=null) count++;
        }
      });
      return count == payload.length;
    }
    start();

  }
  else {

    let _tr_o = await (await db.ticketsrestau).get('ticketsrestau')
                                            .find({ticketrestau_id: payload.ticketrestau_id})
                                            .value();
    if (_tr_o) {
      log.info('_tr_o existe, donc on update');
      let __upd = {..._tr_o, ...payload, updatedAt: __now};
      _tr_o = await (await db.ticketsrestau).get('ticketsrestau')
                                          .find({ticketrestau_id: payload.ticketrestau_id})
                                          .assign(__upd)
                                          .write();
    }
    else {
      log.info('pas de _tr donc on insert');
      _tr_o = _insertTicketRestau(payload);
    }

    return _tr_o != null;
  }
}


async function _insertTicketRestau(payload) {

  log.info('_insertTicketRestau()');
  const __now = new Date().getTime();
  const __ins = {...payload, createdAt: __now, updatedAt: __now};
  const _tr = await (await db.ticketsrestau).get('ticketsrestau')
                                            .insert(__ins)
                                            .write();
  log.info("new tr", _tr);                                            
  return _tr;
}


/**
 * Parse ticketsrestau data (actually no treatment!)
 */
function _parseTicketsRestau(_rawdata) {
  return {ticketsrestaulist: _rawdata._tr};
}


module.exports = actions;