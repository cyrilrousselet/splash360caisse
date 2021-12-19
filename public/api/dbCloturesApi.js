// const db = require("../db.js");
// const lodashId = require("lodash-id");
// const log = require("electron-log");
const log = require('../utils/logger');
const connect = require("../db/mongodb");
const ClotureModel = require("../db/clotureModel");
const GTPerpetuelModel = require("../db/GTPerpetuelModel");
const GTTicketModel = require("../db/GTTicketModel");
const GTPeriodiqueModel = require("../db/GTPeriodiqueModel");
const ZCaisseModel = require("../db/zdecaisseModel");
const ArchiveModel = require("../db/ArchiveModel");

const { uuid } = require("uuidv4");

const actions = {
  dbClotureGetAll: async (req, res) => {

    const { payload } = req;
    log.info("dbClotureGetAll() in API", req);

    let proxies = {};

    if (Object.entries(payload).length > 0) {
      const _rawdata = await _findCloture(payload);
      proxies = _parseCloture(_rawdata);
    } else {
      proxies = await _getAll();
    }
    //  log.info(proxies);
    res.send(proxies);
  },
  dbClotureGetBoundedClotures: async (req, res) => {
    const { payload } = req;
    const proxies = await _findBoundedClotures(payload.start, payload.end);
    res.send(proxies);
  },
  dbClotureGetLast: async (req, res) => {
    const proxies = await _getLast();
    res.send(proxies);
  },
  dbClotureGetCloture: async (req, res) => {
    const { payload } = req;
    log.info("dbClotureGetCloture(" + payload.clotureId + ") in API");
    let proxies = await _findCloture({ ticketId: payload.clotureId });
   // proxies = proxies.map((c) => c._doc);

    log.info(proxies);
    res.send(proxies);
  },
  dbCloturePersist: async (req, res) => {
    const { payload } = req;
    log.info("dbCloturePersist() in API");

    const confirm = await _persistCloture(payload.cloture);

    res.send(confirm);
  },

  dbClotureGetToSync: async (req, res) => {
    const { payload } = req;
    const limit = payload.limit;
    const proxies = await _getCloturesToSync(limit);
    res.send(proxies);
  },

  dbClotureGetArchive: async (req, res) => {
    const {payload} = req;
    const proxies = await _findArchive(payload);
    res.send(proxies);
  },

  dbCloturePersistArchive: async (req, res) => {
    const {payload} = req;
    const confirm = await _persistArchive(payload);
    res.send(confirm);
  },

  dbClotureGetGrandTotalTicket: async (req, res) => {
    const { payload } = req;
    const proxies = await _getGrandTotalTicket(payload);
    res.send(proxies);
  },


  dbCloturePersistGrandTotalTicket: async (req, res) => {
    const { payload } = req;
    const confirm = await _persistGrandTotalTicket(payload);
    res.send(confirm);
  },
  dbClotureGetGrandTotalPeriodique: async (req, res) => {
    const { payload } = req;
    const proxies = await _getGrandTotalPeriodique(payload);
    res.send(proxies);
  },

  dbClotureGetLastGrandTotalPeriodique: async (req, res) => {
    const { payload } = req;
    const proxies = await _getLastGrandTotalPeriodique(payload.gttype);
    res.send(proxies);
  },

  dbCloturePersistGrandTotalPeriodique: async (req, res) => {
    const { payload } = req;
    const confirm = await _persistGrandTotalPeriodique(payload);
    res.send(confirm);
  },


  dbClotureGetLastZCaisse: async (req, res) => {
    const { payload } = req;
    const proxies = await _getLastZCaisse(payload);
    res.send(proxies);
  },

  dbClotureGetZCaisse: async (req, res) => {
    const { payload } = req;
    const proxies = await _getZCaisse(payload);
    res.send(proxies);
  },

  dbCloturePersistZCaisse: async (req, res) => {
    const { payload } = req;
    const confirm = await _persistZCaisse(payload);
    res.send(confirm);
  },

  dbClotureGetGTP: async (req, res) => {
    const proxies = await _getGrandTotalPerpetuel();
    res.send(proxies);
  },

  dbCloturePersistGTP: async (req, res) => {
    const { payload } = req;
    const confirm = await _persistGrandTotalPerpetuel(payload.gtpca, payload.gtpva);
    
    if (confirm) {
      res.send(payload);
    }
    else {
      res.error('error');
    }
  },

  dbGetItems: async (itemtype, ids) => {

    const _clo = await _findCloture({clotureId: {$in: ids}});
    return _clo;
  },


  dbCloturesSummary: async (query) => {

    const _clo = await _findCloture(query);

    return {
      cloture: _clo,
    };
  },

  syncConfirm: async (db, ids, from) => {
    const _n = await _addCloturesLocalSync(ids,from);
    return _n;
  },

  dbClotureSetSynced: async (req, res) => {
    const { payload } = req;
    log.info(
      "dbClotureSetSynced([" +
        payload.ids +
        "]," +
        payload.datetime +
        ") in API"
    );

    const confirm = await _setSynced(payload.ids, payload.datetime);

    res.send(confirm);
  },
};

async function _getLast() {
  const mongo = await connect();
  if (!mongo) return false;
  const __rawdata = await ClotureModel.find().lean().sort({createdAt: -1}).limit(1);
  // await mongo.disconnect();
  return _parseCloture(__rawdata);
  //return _cloture; 
}

async function _getAll() {
  const __rawdata = await _findCloture();
  log.info('getall', __rawdata);
  return _parseCloture(__rawdata);
}

async function _addCloturesLocalSync(ids, store_id) {
  const mongo = await connect();
  if (!mongo) return false;

  const _cmds = await ClotureModel.updateMany(
    {clotureId: {$in: ids}, localsync: { $ne: store_id }},
    {$push: {localsync: store_id}}
  );

  return _cmds.n;

}

async function _findBoundedClotures(start, end) {
  const mongo = await connect();
  if (!mongo) return false;

// const query = [
//   {'$addFields': {
//       'periodedebut': {
//         '$dateFromString': {
//           'dateString': {
//             '$substr': ['$periode.debut', 0, {'$add': [{'$strLenCP': '$periode.debut'}, -1]}]
//           }
//         }
//       }
//     }
//   }, 
//   {'$addFields': {
//       'periodefin': {
//         '$dateFromString': {
//           'dateString': {
//             '$substr': ['$periode.fin', 0, {'$add': [{'$strLenCP': '$periode.fin'}, -1]}]
//           }
//         }
//       }
//     }
//   },
//   {'$match': {
//       '$and': [
//         {'periodedebut': {'$gte': new Date(start)}}, 
//         {'periodefin': {'$lte': new Date(end) }}
//       ]
//     }
//   }
// ];

  //  log.info(query);
    // const __rawdata = await ClotureModel.aggregate(query).exec();
    const __rawdata = await ClotureModel.find({
      $and: [
        {createdAt: { $gte: start } }, 
        {createdAt: { $lte: end } }
      ]
    }).lean().exec();
    // await mongo.disconnect();
    return _parseCloture(__rawdata);
}



/**
 * Get clotures data from DB
 */
async function _findCloture(criteriae = {}) {
  log.info(criteriae);
  const mongo = await connect();
  if (!mongo) return false;
  const _cloture = await ClotureModel.find(criteriae).lean().sort({createdAt: 1}).exec();
  // await mongo.disconnect();
  return _cloture;
}


async function _persistCloture(payload) {
  const __now = new Date().getTime();

  const mongo = await connect();
  if (!mongo) return false;
  let _clo = await ClotureModel.where({ clotureId: payload.clotureId })
    .findOne()
    .lean()
    .exec();

  if (_clo) {
    log.info("cloture existe, donc on update");
    _clo = { ..._clo, ...payload, updatedAt: __now };
    delete _clo._id;
    await ClotureModel.updateOne({ clotureId: payload.clotureId }, _clo).exec();
  } else {
    log.info("pas de cmd donc on insert");
    // Create command id
    const id = await _generateClotureId();
    let __ins = { ...payload, id: id, createdAt: __now, updatedAt: __now };
    _clo = await ClotureModel.create(__ins);
    _clo = __ins;
  }

  // await mongo.disconnect();
  return _clo;
}

function _parseCloture(_rawdata) {

  let __clotures = {};
  _rawdata.forEach((c) => {
    const __clo = c;
    __clotures[__clo.clotureId] = c;
  });

  console.log("Clotures: ", __clotures);
  return { clotureslist: __clotures };
}

async function _getCloturesToSync(limit = null) {
  const mongo = await connect();
  if (!mongo) return false;
  const criteria = {
    $or: [{ sync: {$exists: false} }, { $where: "this.updatedAt > this.sync" }],
  };

  let clotures =
    limit !== null && limit > 0
      ? await ClotureModel.find(criteria).lean().limit(limit).exec()
      : await ClotureModel.find(criteria).lean().exec();

  // Map document
  clotures = clotures.map((c) => ({
    ...c,
    _id: undefined,
    __v: undefined,
  }));

  // await mongo.disconnect();
  return { clotures };
}

async function _setSynced(ids, datetime) {
  log.info("Sync ids: ", ids);
  if (!ids || !ids.length) {
    return false;
  }

  const __datetime = new Date(datetime).getTime();
  log.info("datetime", __datetime);

  const _clotures = await _findCloture({ id: { $in: ids } });

  _clotures.forEach(async (c) => {
    const doc = c;

    doc.sync = __datetime;
  //  doc.updatedAt = __datetime;

    // on en profite pour vider la propriété cmdtoarchive de chaque cloture synchronisée
    doc.cmdtoarchive = [];

    // delete doc._id;
    await ClotureModel.updateOne({ id: doc.id }, doc).exec();
    // await c.save();
    // log.info("Commande synced: ", doc);
  });

  log.info("_clo", _clotures.length);
  return _clotures != null && _clotures.length;
}

async function _getGrandTotalTicket(payload) {

  const mongo = await connect();
  if (!mongo) return false;
  
  const { query={}, end } = payload;

  let __gtt;
  if (end>-1) {
    __gtt = await GTTicketModel.find(query).sort({$natural:-1}).limit(end).sort({$natural:1}).lean().exec();
  } else {
    __gtt = await GTTicketModel.find(query).lean().exec();
  }

  return __gtt;

}

async function _persistGrandTotalTicket(payload) {

  const mongo = await connect();
  if (!mongo) return false;

  await GTTicketModel.create(payload);

  return true;
  
}

async function _getGrandTotalPeriodique(payload) {

  const mongo = await connect();
  if (!mongo) return false;

  const {query={}, end} = payload;
  
  let __gtp;
  if (end>0) {
    __gtp = await GTPeriodiqueModel.find(query).sort({$natural:-1}).limit(end).sort({$natural:1}).lean().exec();
  } else {
    __gtp = await GTPeriodiqueModel.find(query).lean().exec();
  } 
  return __gtp;
}


async function _persistGrandTotalPeriodique(payload) {

  const mongo = await connect();
  if (!mongo) return false;

  await GTPeriodiqueModel.create(payload);

  return true;
  
}

async function _getGrandTotalPerpetuel() {

  const mongo = await connect();
  if (!mongo) return false;

  let __gtp = await GTPerpetuelModel.find({id:1}).lean().exec();

  if (__gtp.length<1) {

    
    __gtp = [{
      id:1,
      calculAlgebrique:0, 
      valeurAbsolue:0
    }];
    log.info('pas de GTP, donc persistance des valeurs par défaut.');
    _persistGrandTotalPerpetuel(__gtp[0].calculAlgebrique, __gtp[0].valeurAbsolue, true);
  }
  
  log.info('GTP: '+JSON.stringify(__gtp));

  return {gtpca:__gtp[0].calculAlgebrique, gtpva:__gtp[0].valeurAbsolue};

}


async function _persistGrandTotalPerpetuel(gtpca, gtpva, insert=false) {
  
  const mongo = await connect();
  if (!mongo) return false;

  let __gtp = null;
  if (insert) {
    __gtp = await GTPerpetuelModel.create({
      id: 1,
      calculAlgebrique: gtpca, 
      valeurAbsolue: gtpva,
      updatedAt: (new Date()).getTime()
    });
  } else {
    __gtp = await GTPerpetuelModel.updateOne({id: 1}, {
      calculAlgebrique: gtpca, 
      valeurAbsolue: gtpva,
      updatedAt: (new Date()).getTime()
    }).exec();
  }

  return __gtp ? true : false;
  
}

async function _getLastGrandTotalPeriodique(periodetype) {

  const mongo = await connect();
  if (!mongo) return false;

  const __gtp = await GTPeriodiqueModel.find({gttype: periodetype}).lean().sort({'ENC-GTP-HOR-GDH':-1}).limit(1);

  return __gtp;

}

async function _getLastZCaisse(query={}) {

  const mongo = await connect();
  if (!mongo) return false;
  
  const __zc = await ZCaisseModel.find(query).lean().sort({createdAt:-1}).limit(1);

  return __zc;
}

async function _getZCaisse(payload) {

  const mongo = await connect();
  if (!mongo) return false;

  const {query={}, end} = payload;

  let __zc;
  if (end>-1) {
    __zc = await ZCaisseModel.find(query).sort({$natural:-1}).limit(end).sort({$natural:1}).lean().exec();
  } else {
    __zc = await ZCaisseModel.find(query).lean().exec();
  }

  return __zc;

}

async function _persistZCaisse(payload) {
  
  const mongo = await connect();
  if (!mongo) return false;

  await ZCaisseModel.create(payload);

  return true;
  
}

async function _generateClotureId() {
  let id;

  do {
    id = uuid();
  } while (await ClotureModel.exists({ id: id }));

  return id;
}

async function _findArchive(criteriae={}) {

  const mongo = await connect();
  if (!mongo) return false;

  let __arc = await ArchiveModel.find(criteriae).lean().exec();

  return __arc;

}

async function _persistArchive(payload) {
  
  const mongo = await connect();
  if (!mongo) return false;

  await ArchiveModel.create(payload);

  return true;
  
}


module.exports = actions;
