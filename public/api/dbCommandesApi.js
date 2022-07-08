// const log = require("electron-log");
const log = require('../utils/logger');
const connect = require("../db/mongodb");
const CommandeModel = require("../db/commandeModel");
const TicketrestauModel = require("../db/ticketrestauModel");
const CmdchronoModel = require("../db/cmdchronoModel");
const TicketModel = require('../db/ticketModel');
const NoteModel = require('../db/noteModel');
const DuplicataModel = require('../db/duplicataModel');
const { uuid } = require("uuidv4");
// const { lowerFirst } = require('lodash');

const actions = {
  dbCommandeGetAll: async (req, res) => {
    const { payload } = req;
    log.info("dbCommandeGetAll() in API", req);

    let proxies = {};

    if (Object.entries(payload).length > 0) {
      proxies = await _getCommandes(payload);
    } else {
      proxies = await _getAll();
    }

    // log.info(proxies);
    res.send(proxies);
  },
  dbCommandesGetCaisses: async (req, res) => {

    let proxies = await _getCommandes({
      $and: [
        { archived: {"$exists": false} },
        { status: { $ne: "deleted" } },
        { $or: [
          { centre_revenu: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]}
      ]
    });

    let caisses = [];
    if (proxies.commandeslist) {  
      Object.entries(proxies.commandeslist).forEach(([ticketId, commande]) => {
        if (caisses.filter(c => c.uniqid===commande.caisse.uniqid).length===0) {
          caisses.push(commande.caisse);
        }
      })
    }
    res.send(caisses);

  },

  dbCommandeGetToSync: async (req, res) => {
    const { payload } = req;
    const limit = payload.limit;
    const proxies = await _getCommandesToSync(limit);
    res.send(proxies);
  },
  dbCommandeGetCommande: async (req, res) => {
    const { payload } = req;
    log.info("dbCommandeGetCommande(" + payload.ticketId + ") in API");
    const proxies = await _findCommande({ ticketId: payload.ticketId });
    log.info(proxies);
    if (proxies && proxies.length === 1) {
      const _cmd = proxies[0];
      res.send({ _cmd });
    } else {
      res.error("Commande not found or commande is duplicated");
    }
  },
  dbCommandesGetTodayCa: async (req, res) => {
    const { payload } = req;
    log.info("dbCommandesGetTodayCa() in API");

    const stats = await CommandeModel.aggregate([{$match: {
      $and: [
        {"createdAt": { $gt: payload.from }},
        {"status": {$eq: "confirmed"} },
        // {"archived": {$exists: false}}
      ]
    }}, {$group: {
      _id: null,
      ca: {
        $sum: "$total"
      },
      numtickets: {
        $sum: 1
      }
    }}]);

    let response = {ca: 0, numtickets: 0};
    if (stats.length) {
      response = stats[0];
    }

    res.send(response);

  },
  dbCommandePersist: async (req, res) => {
    const { payload } = req;
    log.info("dbCommandePersist() in API");

    const confirm = await _persistCommande(payload.commande);

    res.send(confirm);
  },
  dbCommandeArchive: async (req, res) => {
    const { payload } = req;
    log.info(
      "dbCommandeArchive([" +
        payload.ids +
        "]," +
        payload.clotureId +
        ") in API"
    );

    const confirm = await _setArchived(payload.ids, payload.clotureId);

    res.send(confirm);
  },
  dbCommandeSetSynced: async (req, res) => {
    const { payload } = req;
    log.info(
      "dbCommandeSetSynced([" +
        payload.ids +
        "]," +
        payload.datetime +
        ") in API"
    );

    const confirm = await _setSynced(payload.ids, payload.datetime);

    res.send(confirm);
  },
  dbCommandeDelete: async (req, res) => {
    const { payload } = req;
    log.info("dbCommandeDelete() in API");

    const confirm = await _deleteCommande(payload.ticketId, payload.motif);

    res.send(confirm);
  },
  dbCommandePurge:async (req, res) => {
    const { payload } = req;
    log.info("dbCommandePurge() in API");

    const confirm = await _purgeCommande(payload);

    res.send(confirm);
  },

  dbTicketGet: async (req, res) => {
    log.info('dbTicketGet in API');
    const { payload } = req;

    const proxies = await _findTicket(payload);
    res.send(proxies);
  },

  dbTicketPersist: async (req, res) => {
    log.info('dbTicketPersist in API');
    const { payload } = req;

    const confirm = await _persistTicket(payload);

    res.send(confirm);
  },
  dbTicketDelete: async (req, res) => {
    log.info('dbTicketDelete in API');
    const { payload } = req;

    const confirm = await _deleteTicket(payload);

    res.send(confirm);
  },
  dbTicketGetToSync: async (req, res) => {
    const { payload } = req;
    const limit = payload.limit;
    const proxies = await _getTicketsToSync(limit);
    res.send(proxies);
  },
  dbTicketSetSynced: async (req, res) => {
    const { payload } = req;
    log.info(
      "dbTicketSetSynced([" +
        payload.ids +
        "]," +
        payload.datetime +
        ") in API"
    );

    const confirm = await _setSyncedTickets(payload.ids, payload.datetime);

    res.send(confirm);
  },

  dbNoteGet: async (req, res) => {
    log.info('dbNoteGet in API');
    const { payload } = req;

    const proxies = await _findNote(payload);
    res.send(proxies);
  },

  dbNotePersist: async (req, res) => {
    log.info('dbNotePersist in API');
    const { payload } = req;

    const confirm = await _persistNote(payload);

    res.send(confirm);
  },

  dbDuplicataGet: async (req, res) => {
    log.info('dbDuplicataGet in API');
    const { payload } = req;

    const proxies = await _findDuplicata(payload);
    res.send(proxies);
  },

  dbDuplicataPersist: async (req, res) => {
    log.info('dbDuplicataPersist in API');
    const { payload } = req;

    const confirm = await _persistDuplicata(payload);

    res.send(confirm);
  },
  dbDuplicataDelete: async (req, res) => {
    log.info('dbDuplicataDelete in API');
    const { payload } = req;

    const confirm = await _deleteDuplicata(payload);

    res.send(confirm);
  },

  dbTicketsRestauGetAll: async (req, res) => {
    log.info("dbTicketsRestauGetAll() in API");

    const proxies = await _getAllTicketsRestau();

    res.send(proxies);
  },
  dbTicketsRestauGetOne: async (req, res) => {
    const { payload } = req;
    log.info("dbTicketsRestauGetOne(" + payload.id + ") in API");

    const proxies = await _findTicketRestau({
      id: payload.id,
    });

    res.send(proxies);
  },
  dbTicketsRestauPersist: async (req, res) => {
    const { payload } = req;
    log.info("dbTicketsRestauPersist() in API");

    const confirm = await _persistTicketRestau(payload.payload);


    log.info('dbTicketsRestauPersist confirm', confirm);

    res.send(confirm);
  },


  dbGetItems: async (itemtype, ids) => {

    const _cmd = await _findCommande({ticketId: {$in: ids}});
    return _cmd;
  },

  dbCommandesSummary: async (mongoquery, stationid) => {

    const _cmd = await _findCommande(mongoquery);

    const _tkr = await _findTicketRestau({
      $or: [
        { localsync: { $exists: false } },
        { localsync: { $ne: stationid } },
      ],
    });

    return {
      commande: _cmd,
      ticketrestaurant: _tkr,
    };
  },

  syncConfirm: async (db, ids, from) => {

    let _n = 0;
    if (db==='ticketsrestau') {

      _n = await _addTicketsLocalSync(ids,from);

    } else {
      _n = await _addCommandesLocalSync(ids,from);
    }

    return _n;


  }
};

async function _getAll() {
  const __rawdata = await _findCommande();
  return _parseCommandes(__rawdata);
}

async function _getCommandesToSync(limit = null) {
  const mongo = await connect();
  if (!mongo) return false;

  const criteria = {
    $and: [
      { $or: [
        { sync: {$exists: false} },
        { sync: null }
      ]},
      { $or: [{ status: "confirmed" }, { status: "deleted" }] },
    ],
  };

  log.info('getcmd2sync crit', criteria);

  let _cmd;

  if (limit && limit > 0) {
    _cmd = await CommandeModel.find(criteria).sort({createdAt: -1}).lean().limit(limit).exec();
  } else {
    _cmd = await CommandeModel.find(criteria).sort({createdAt: -1}).lean().exec();
  }

  // Map document
  _cmd = _cmd.map((c) => ({ ...c, _id: undefined, __v: undefined }));

  // log.info("Commandes: ", JSON.stringify(_cmd));
  // await mongo.disconnect();

  const ids = _cmd.map((c) => c.ticketId);

  const _chr = await CmdchronoModel.find({ticketId: {$in: ids}}).lean().exec();

  return {
    commandes: _cmd,
    chronos: _chr && !Array.isArray(_chr) ? [_chr] : _chr,
  };
}


async function _getCommandes(criteriae = {}) {
  const mongo = await connect();
  if (!mongo) return false;
 
  let __criteriae = criteriae;
  if (criteriae.hasOwnProperty('where')) {
    __criteriae = { $where: criteriae.where };
  }
  log.info("CmdAPI._getCommandes() criteriae: "+JSON.stringify(__criteriae));
  // const _rawdata = (await CommandeModel.find(__criteriae)).values();
  const _rawdata = await CommandeModel.find( criteriae ).lean().exec();
 
//  log.info('_getCommandes : '+JSON.stringify(_rawdata));
 
  // await mongo.disconnect();
  return  _parseCommandes(_rawdata);
}

/**
 * Get commandes data from DB
 */
async function _findCommande(criteriae = {}) {
 // log.info(criteriae);
  const mongo = await connect();
  if (!mongo) return false;

  const _cmd = await CommandeModel.find(criteriae).lean().exec();
  // await mongo.disconnect();
  return _cmd;
}

async function _addCommandesLocalSync(ids, store_id) {
  const mongo = await connect();
  if (!mongo) return false;

  const _cmds = await CommandeModel.updateMany(
    {ticketId: {$in: ids}, localsync: { $ne: store_id }},
    {$push: {localsync: store_id}}
  );

  return _cmds.n;

}

async function _addTicketsLocalSync(ids, store_id) {



  const mongo = await connect();
  if (!mongo) return false;
  await TicketrestauModel.updateMany(
    {id: {$in: ids}, localsync: { $ne: store_id }},
    {$push: {localsync: store_id}}
  );

  return ids.length;
}

async function _persistCommande(payload) {
  const __now = new Date().getTime();

  const mongo = await connect();
  if (!mongo) return false;

  let _cmd = await CommandeModel.where({ ticketId: payload.ticketId })
    .findOne()
    .lean()
    .exec();

  if (_cmd) {
    log.info("cmd existe, donc on update");
    if (_cmd.status==="confirmed" && payload.status==="standby") {
      log.warn('⛔️ On ne met pas à jour une commande CONFIRMED avec un nouveau status STANDBY !');
    } else {
      _cmd = { ..._cmd, ...payload, updatedAt: __now, sync: null };
      delete _cmd._id;
      await CommandeModel.updateOne({ ticketId: payload.ticketId }, _cmd).exec();
    }
  } else {
    log.info("pas de cmd donc on insert");
    // Create command id
    const id = await _generateCommandId();

    const __createdAt = payload.createdAt ? payload.createdAt : __now;
    const __updatedAt = payload.updatedAt ? payload.updatedAt : __now;

    let __ins = { ...payload, id: id, createdAt: __createdAt, updatedAt: __updatedAt };
    _cmd = await CommandeModel.create(__ins);
    _cmd = __ins;
  }

  // await mongo.disconnect();
  return _cmd;
}

function _parseCommandes(_rawdata) {
  const __commandes = {};

  _rawdata.forEach((c) => {
    __commandes[c.ticketId] = c;
  });

  return { commandeslist: __commandes };
}

async function _deleteCommande(ticketId, motif) {
  const mongo = await connect();
  if (!mongo) return false;

  const _status = await CommandeModel.updateOne(
    { ticketId: ticketId },
    { status: "deleted", motif: motif }
  ).exec();

  let _cmd;
  if (_status.ok) {
    const _cmds = await _findCommande({ ticketId: ticketId });
    _cmd = _cmds[0];
  }

  // await mongo.disconnect();
  return _cmd;
}


async function _purgeCommande(ids) {
  const mongo = await connect();
  if (!mongo) return false;

  const { deleteCount } = await CommandeModel.deleteMany({ticketId: {$in: ids}});
  return (deleteCount === ids.length);
}

async function _setArchived(ids, clotureId) {
  log.info("Sync ids: ", ids);
  if (!ids || !ids.length) {
    return false;
  }

  const __now = new Date().getTime();
  log.info(ids);
  const _cmds = await _findCommande({ ticketId: { $in: ids } });
  _cmds.forEach(async (c) => {
    const doc = c;
    doc.archived = clotureId;
    doc.updatedAt = __now;
    doc.sync = null;

    await CommandeModel.updateOne({ ticketId: doc.ticketId }, doc).exec();
    log.info("Commande archived: ", doc.id);
  });

  return _cmds != null && _cmds.length;
}

async function _setSynced(ids, datetime) {
  log.info("Sync ids: ", ids);
  if (!ids || !ids.length) {
    return false;
  }

  const __datetime = new Date(datetime).getTime();

  const _cmd = await _findCommande({ id: { $in: ids } });

  _cmd.forEach(async (c) => {
    const doc = c;

    doc.sync = __datetime;
  //  doc.updatedAt = __datetime;

    delete doc._id;
    await CommandeModel.updateOne({ ticketId: doc.ticketId }, doc).exec();
  //  log.info("Commande synced: ", doc);
  });

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
async function _findTicketRestau(criteriae = {}) {
  log.info(criteriae);
  const mongo = await connect();
  if (!mongo) return false;

  const _tr = await TicketrestauModel.find(criteriae).lean().sort({createdAt: 1}).exec();

  return { _tr };
}

// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }



async function _doPersistTR(payload) {

  const __now = new Date().getTime();
  const mongo = await connect();
  if (!mongo) return false;

  let _tr = await TicketrestauModel.where({id: payload.id})
                             .findOne()
                             .lean()
                             .exec();

  if (_tr) {

    log.info("_tr existe, donc on update");
    _tr = {..._tr, ...payload, updatedAt: __now};
    _tr = await TicketrestauModel.updateOne({id: payload.id}, _tr).exec();
    
  } else {

    log.info("pas de _tr donc on insert");
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _tr = await TicketrestauModel.create(__ins);
    _tr = __ins;
  }

  return _tr;
}







/**
 * Insert or Update ticketsrestau data into DB
 */
async function _persistTicketRestau(payload) {
  // const __now = new Date().getTime();

  log.info('_persistTicketRestau()', payload);

  
  if (Array.isArray(payload)) {
 
    let response = await Promise.all(payload.map(async (tr) => {
      const __tr_a = await _doPersistTR(tr);
      return __tr_a;
    }));

    return response;
  
  } else {

    const __tr_o = await _doPersistTR(payload);
    return [__tr_o];
    
  }
}

async function _findTicket(payload) {

  const mongo = await connect();
  if (!mongo) return false;

  const {query = {}, end} = payload;

  let __tck
  if (end>-1) {
    __tck = await TicketModel.find(query).sort({$natural:-1}).limit(end).sort({$natural:-1}).lean().exec();
  } else {
  __tck = await TicketModel.find(query).lean().exec();
  }

  return __tck;

}

async function _persistTicket(payload) {
  
  const mongo = await connect();
  if (!mongo) return false;

  await TicketModel.create(payload);

  return true;
  
}
async function _deleteTicket(ids) {
  const mongo = await connect();
  if (!mongo) return false;

  const { deleteCount } = await TicketModel.deleteMany({'ENC-GTT-ORI-NUM': {$in: ids}});
  return (deleteCount === ids.length);
}

async function _getTicketsToSync(limit = null) {
  const mongo = await connect();
  if (!mongo) return false;

  const criteria = {
      $or: [
      { sync: {$exists: false} },
      { sync: null }
    ]
  };

  log.info('gettck2sync crit', criteria);

  let _tck;

  if (limit && limit > 0) {
    _tck = await TicketModel.find(criteria).sort({"ENC-TIK-HOR-GDH": -1}).lean().limit(limit).exec();
  } else {
    _tck = await TicketModel.find(criteria).sort({"ENC-TIK-HOR-GDH": -1}).lean().exec();
  }

  // Map document
  _tck = _tck.map((c) => ({ ...c, _id: undefined, __v: undefined }));

  return {
    tickets: _tck,
  };
}

async function _setSyncedTickets(ids, datetime) {
  log.info("Sync ids: ", ids);
  if (!ids || !ids.length) {
    return false;
  }

  const __datetime = new Date(datetime).getTime();

  const _tck = await TicketModel.updateMany(
    {'ENC-TIK-CDE': {$in: ids}},
    {'sync': __datetime}
  );

  return _tck.acknowledged;
}

async function _findNote(payload) {

  const mongo = await connect();
  if (!mongo) return false;

  const {query = {}, end} = payload;

  let __not
  if (end>-1) {
    __not = await NoteModel.find(query).sort({$natural:-1}).limit(end).sort({$natural:-1}).lean().exec();
  } else {
    __not = await NoteModel.find(query).lean().exec();
  }

  return __not;

}

async function _persistNote(payload) {
  
  const mongo = await connect();
  if (!mongo) return false;

  await NoteModel.create(payload);

  return true;
  
}


async function _findDuplicata(criteriae={}) {

  const mongo = await connect();
  if (!mongo) return false;

  let __tck = await DuplicataModel.find(criteriae).lean().exec();

  return __tck;

}

async function _persistDuplicata(payload) {
  
  const mongo = await connect();
  if (!mongo) return false;

  await DuplicataModel.create(payload);

  return true;
  
}

async function _deleteDuplicata(ids) {
  const mongo = await connect();
  if (!mongo) return false;

  const { deleteCount } = await DuplicataModel.deleteMany({'ENC-DUP-NID': {$in: ids}});
  return (deleteCount === ids.length);
}

async function _generateCommandId() {
  let id;

  do {
    id = uuid();
  } while (await CommandeModel.exists({ id: id }));

  return id;
}

/**
 * Parse ticketsrestau data (actually no treatment!)
 */
function _parseTicketsRestau(_rawdata) {
  return { ticketsrestaulist: _rawdata._tr };
}

module.exports = actions;