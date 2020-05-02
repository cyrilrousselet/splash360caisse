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

module.exports = actions;