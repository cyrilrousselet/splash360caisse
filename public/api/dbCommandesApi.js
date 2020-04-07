const db = require('../db.js');
const log = require('electron-log');
const hydration = require('../dev/dbhydration_chickenstreet.js');
const {commandes} = hydration;


const actions = {
  dbCommandeGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbCommandeGetAll() in API");
    
    const proxies = await _getAll();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbCommandeGetCommande: async (req,res) => {
    const {payload} = req;
    log.info("dbCommandeGetCommande("+payload.ticketId+") in API");
    const proxies = await _findCommande({ticketId: payload.ticketId});
    log.info(proxies);
    res.send(proxies);
  },
  dbCommandePersist: async (req,res) => {
      const {payload} = req;
      log.info("dbCommandePersist() in API");

      const confirm = await _persistCommande(payload.commande);

      res.send(confirm);
  },
  dbCommandeArchive: async (req,res) => {
    const { payload } = req;
    log.info('dbCommandeArchive(['+payload.ids+'],'+payload.clotureId+') in API');

    const confirm = await _setArchived(payload.ids, payload.clotureId);

    res.send(confirm);
  }

}



async function _getAll() {
  
  let __rawdata;
  let __cmdnum = await db.commandes.count();
  if (__cmdnum==0) {
    log.info('dbCommandeApi._getAll() : init DB');
    __rawdata = await _fillinCommande();
  } else {
    __rawdata = await _findCommande();
  }
  return _parseCommandes(__rawdata);
}


/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinCommande() {
  const _cmd = await db.commandes.insert(commandes);
  return { _cmd };
}

/**
 * Get commandes data from DB
 */
async function _findCommande(criteriae={}) {
  log.info(criteriae);
  let _cmd = [];
  if ("ticketId" in criteriae) {
    _cmd = await db.commandes.findOne(criteriae);
  } else {
    _cmd = await db.commandes.find(criteriae);
  }
  return { _cmd };
}

async function _persistCommande(payload) {

  let _cmd = await db.commandes.findOne({ticketId: payload.ticketId});
  log.info(_cmd);
  if (_cmd) {
    log.info('cmd existe, donc on update');
    let __upd = {..._cmd, ...payload};
    _cmd = await db.commandes.update({ticketId: payload.ticketId}, __upd);
  }
  else {
    log.info('pas de cmd donc on insert');
    _cmd = await db.commandes.insert(payload);
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
  log.info(ids);
  let _cmd = await db.commandes.update({ ticketId: {$in: ids}}, { $set: {archived: clotureId} }, {multi: true});
  // let _cmd = 1;
  return _cmd != null;
}

module.exports = actions;