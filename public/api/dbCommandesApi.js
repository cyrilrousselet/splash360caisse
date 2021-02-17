const db = require("../db.js");
const lodashId = require("lodash-id");
const log = require("electron-log");
const connect = require("../db/mongodb");
const CommandeModel = require("../db/commandeModel");
const { uuid } = require("uuidv4");

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

  dbTicketsRestauGetAll: async (req, res) => {
    log.info("dbTicketsRestauGetAll() in API");

    (await db.ticketsrestau)._.mixin(lodashId);
    const proxies = await _getAllTicketsRestau();

    res.send(proxies);
  },
  dbTicketsRestauGetOne: async (req, res) => {
    const { payload } = req;
    log.info("dbTicketsRestauGetOne(" + payload.id + ") in API");

    (await db.ticketsrestau)._.mixin(lodashId);
    const proxies = await _findTicketRestau({
      id: payload.id,
    });

    res.send(proxies);
  },
  dbTicketsRestauPersist: async (req, res) => {
    const { payload } = req;
    log.info("dbTicketsRestauPersist() in API");

    (await db.ticketsrestau)._.mixin(lodashId);
    const confirm = await _persistTicketRestau(payload.payload);

    res.send(confirm);
  },


  dbGetItems: async (itemtype, ids) => {

    const _cmd = await _findCommande({ticketId: {$in: ids}});
    return _cmd;
  },

  dbCommandesSummary: async (mongoquery, stationid) => {
    (await db.ticketsrestau)._.mixin(lodashId);

    const _cmd = await _findCommande(mongoquery);

    const _tkr = await (await db.ticketsrestau).get("ticketsrestau")
                                               .filter( t => {
                                                 return (t.localsync === undefined) || !t.localsync.includes(stationid);
                                               })
                                               .value();

    return {
      commande: _cmd,
      ticketrestaurant: _tkr,
    };
  },

  syncConfirm: async (db, ids, from) => {

    let _n = 0;
    if (db=='ticketsrestau') {

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
  const criteria = {
    $and: [
      { $or: [{ sync: {$exists: false} }, { $where: "this.updatedAt > this.sync" }] },
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

  const _chr = await (await db.cmdchrono)
    .get("cmdchrono")
    .find((c) => ids.includes(c.ticketId))
    .value();

  return {
    commandes: _cmd,
    chronos: _chr && !Array.isArray(_chr) ? [_chr] : _chr,
  };
}

async function _getCommandes(criteriae = {}) {
  log.info("CmdAPI._getCommandes()", criteriae);

  const mongo = await connect();
 
  let __criteriae = criteriae;
  if (criteriae.hasOwnProperty('where')) {
    __criteriae = { $where: criteriae.where };
  }
  log.info('criteriae', __criteriae);
  // const _rawdata = (await CommandeModel.find(__criteriae)).values();
  const _rawdata = await CommandeModel.find( criteriae ).lean().exec();
 
//  log.info('_getCommandes', _rawdata);
 
  // await mongo.disconnect();
  return  _parseCommandes(_rawdata);
}

/**
 * Get commandes data from DB
 */
async function _findCommande(criteriae = {}) {
 // log.info(criteriae);
  const mongo = await connect();
  const _cmd = await CommandeModel.find(criteriae).lean().exec();
  // await mongo.disconnect();
  return _cmd;
}

async function _addCommandesLocalSync(ids, store_id) {
  const mongo = await connect();

  const _cmds = await CommandeModel.updateMany(
    {ticketId: {$in: ids}, localsync: { $ne: store_id }},
    {$push: {localsync: store_id}}
  );

  return _cmds.n;

}

async function _addTicketsLocalSync(ids, store_id) {

  let _tr = await (await db.paramticketsrestauetres)
            .get("ticketsrestau")
            .filter(t => ( ids.includes(t.id) && !t.localsync.includes(store_id)) )
            .assign({localsync: [...localsync, store_id]})
            .write();

  return ids.length;
}

async function _persistCommande(payload) {
  const __now = new Date().getTime();

  const mongo = await connect();
  let _cmd = await CommandeModel.where({ ticketId: payload.ticketId })
    .findOne()
    .lean()
    .exec();

  if (_cmd) {
    log.info("cmd existe, donc on update");
    _cmd = { ..._cmd, ...payload, updatedAt: __now };
    delete _cmd._id;
    await CommandeModel.updateOne({ ticketId: payload.ticketId }, _cmd).exec();
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
    doc.updatedAt = __datetime;

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
  let _tr = [];
  if ("id" in criteriae) {
    _tr = await (await db.ticketsrestau).get("ticketsrestau")
                                        .find(criteriae)
                                        .value();
  } else {
    _tr = await (await db.ticketsrestau).get("ticketsrestau").value();
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
        let _tr = await (await db.ticketsrestau).get("ticketsrestau")
                                                .find({ id: payload.id })
                                                .value();

        if (_tr) {
          log.info("_tr existe, donc on update");
          let __upd = { ..._tr, ...obj, updatedAt: __now };
          _tr = await (await db.paramticketsrestauetres).get("ticketsrestau")
                                                        .find({ id: payload.id })
                                                        .assign(__upd)
                                                        .write();
          if (_tr != null) count++;

        } else {

          _tr = await _insertTicketRestau(obj);
          if (_tr != null) count++;

        }
      });
      return count == payload.length;
    };
    start();
  
  } else {

    let _tr_o = await (await db.ticketsrestau).get("ticketsrestau")
                                              .find({ id: payload.id })
                                              .value();

    if (_tr_o) {
      log.info("_tr_o existe, donc on update");
      let __upd = { ..._tr_o, ...payload, updatedAt: __now };
  
      _tr_o = await (await db.ticketsrestau).get("ticketsrestau")
                                            .find({ id: payload.id })
                                            .assign(__upd)
                                            .write();
    } else {

      log.info("pas de _tr donc on insert");
      _tr_o = _insertTicketRestau(payload);
    }

    return _tr_o != null;
  }
}

async function _insertTicketRestau(payload) {
  log.info("_insertTicketRestau()");
  const __now = new Date().getTime();
  const __ins = { ...payload, createdAt: __now, updatedAt: __now };
  const _tr = await (await db.ticketsrestau).get("ticketsrestau")
                                            .insert(__ins)
                                            .write();
  // log.info("new tr", _tr);
  return _tr;
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