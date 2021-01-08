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
      const _cmd = proxies[0]._doc;
      res.send({ _cmd });
    } else {
      res.error("Commande not found or commande is duplicated");
    }
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
    log.info("dbTicketsRestauGetOne(" + payload.ticketrestau_id + ") in API");

    (await db.ticketsrestau)._.mixin(lodashId);
    const proxies = await _findTicketRestau({
      ticketrestau_id: payload.ticketrestau_id,
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

  dbCommandesSummary: async () => {
    (await db.ticketsrestau)._.mixin(lodashId);

    const _cmd = await _findCommande();
    const _cmdSummary = _cmd.map((c) => ({
      id: c._doc.ticketId,
      updatedAt: c._doc.updatedAt,
    }));

    const _tkr = await (await db.ticketsrestau).get("ticketsrestau").value();
    const _tkrSummary = _tkr.map((t) => ({
      id: t.id,
      updatedAt: t.updatedAt,
    }));

    return {
      commandes: _cmdSummary,
      ticketsrestau: _tkrSummary,
    };
  },
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
    _cmd = await CommandeModel.find(criteria).limit(limit).exec();
  } else {
    _cmd = await CommandeModel.find(criteria).exec();
  }

  // Map document
  _cmd = _cmd.map((c) => ({ ...c._doc, _id: undefined, __v: undefined }));

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
  const _rawdata = await CommandeModel.find( criteriae ).exec();
 
//  log.info('_getCommandes', _rawdata);
 
  // await mongo.disconnect();
  return  _parseCommandes(_rawdata);
}

/**
 * Get commandes data from DB
 */
async function _findCommande(criteriae = {}) {
  log.info(criteriae);
  const mongo = await connect();
  const _cmd = await CommandeModel.find(criteriae).exec();
  // await mongo.disconnect();
  return _cmd;
}

async function _persistCommande(payload) {
  const __now = new Date().getTime();

  const mongo = await connect();
  let _cmd = await CommandeModel.where({ ticketId: payload.ticketId })
    .findOne()
    
    .exec();

  if (_cmd) {
    log.info("cmd existe, donc on update");
    _cmd = { ..._cmd._doc, ...payload, updatedAt: __now };
    delete _cmd._id;
    await CommandeModel.update({ ticketId: payload.ticketId }, _cmd).exec();
  } else {
    log.info("pas de cmd donc on insert");
    // Create command id
    const id = await _generateCommandId();
    let __ins = { ...payload, id: id, createdAt: __now, updatedAt: __now };
    _cmd = await CommandeModel.create(__ins);
    _cmd = _cmd._doc;
  }

  // await mongo.disconnect();
  return _cmd;
}

function _parseCommandes(_rawdata) {
  const __commandes = {};

  _rawdata.forEach((c) => {
    const __cmd = c._doc;
    __commandes[__cmd.ticketId] = __cmd;
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
    _cmd = _cmds[0]._doc;
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
    const doc = c._doc;
    doc.archived = clotureId;
    doc.updatedAt = __now;

    await CommandeModel.update({ ticketId: doc.ticketId }, doc).exec();
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
    const doc = c._doc;

    doc.sync = __datetime;
    doc.updatedAt = __datetime;

    delete doc._id;
    await CommandeModel.update({ ticketId: doc.ticketId }, doc).exec();
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
  if ("ticketrestau_id" in criteriae) {
    _tr = await (await db.ticketsrestau)
      .get("ticketsrestau")
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
        let _tr = await (await db.ticketsrestau)
          .get("ticketsrestau")
          .find({ ticketrestau_id: payload.ticketrestau_id })
          .value();

        if (_tr) {
          log.info("_tr existe, donc on update");
          let __upd = { ..._tr, ...obj, updatedAt: __now };
          _tr = await (await db.paramticketsrestauetres)
            .get("ticketsrestau")
            .find({ ticketrestau_id: payload.ticketrestau_id })
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
    let _tr_o = await (await db.ticketsrestau)
      .get("ticketsrestau")
      .find({ ticketrestau_id: payload.ticketrestau_id })
      .value();
    if (_tr_o) {
      log.info("_tr_o existe, donc on update");
      let __upd = { ..._tr_o, ...payload, updatedAt: __now };
      _tr_o = await (await db.ticketsrestau)
        .get("ticketsrestau")
        .find({ ticketrestau_id: payload.ticketrestau_id })
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
  const _tr = await (await db.ticketsrestau)
    .get("ticketsrestau")
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
