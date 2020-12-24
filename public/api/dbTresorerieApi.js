const log = require('electron-log');
const connect = require("../db/mongodb");
const TresorModel = require("../db/tresorModel");
const { uuid } = require('uuidv4');


const actions = {
  dbTresorerieGet: async (req,res) => {
    const { payload } = req;

    const _rawdata = await _findTresors(payload);
    const proxies = _parseTresors(_rawdata);
    
    res.send(proxies);
  },

  dbTresoreriePersist: async (req, res) => {
    const { payload } = req;
    log.info("dbTresoreriePersist() in API");

    const confirm = await _persistTresor(payload.tresor);

    res.send(confirm._doc);
  },

  dbTresorerieGetLastMouvement: async (req, res) => {
    const { payload } = req;
     const last = await _getLastMouvement(payload.caisseId)
     res.send({lastmouvement: last});
  },

  dbTresorerieSetSynced: async (req, res) => {
    const { payload } = req;
    log.info(
      "dbTresorerieSetSynced([" +
        payload.ids +
        "]," +
        payload.datetime +
        ") in API"
    );

    const confirm = await _setSynced(payload.ids, payload.datetime);

    res.send(confirm);
  },

  dbTresorerieLastClotureAndAfter: async (req, res) => {
    const { payload } = req;
    let proxies = {
      cloture: null,
      ouverture: false
    }
    const _lastc = await _findLastCloture(payload.caisseId);

    log.info('dbTresorerieLastClotureAndAfter C=', _lastc);

    // s'il y a une cloture, on cherche s'il y a une ouverture APRÈS
    if (_lastc.length>0) {
      log.info('--- il y a une cloture ---');
      proxies.cloture = _lastc[0]._doc;
      const _clotureCreatedAt = _lastc[0]._doc.createdAt;

      const _after = await _findTresors({
        $and: [
          { destination: payload.caisseId },
          { type: 'ouverture' },
          { createdAt: { $gt: _clotureCreatedAt } }
        ]
      });
      proxies.ouverture = _after.length>0;
      res.send(proxies);
    } 
    // s'il n'y a pas de cloture, on cherche s'il y a une ouverture
    else {
      log.info('--- il n’y a pas de cloture ---');
      const _lasto = await _findLastOuverture(payload.caisseId);


      log.info('dbTresorerieLastClotureAndAfter O=', _lasto);

      proxies.ouverture =_lasto.length>0;
      res.send(proxies);
    }


  },

  dbTresorerieLastOuvertureAndAfter: async (req, res) => {
    const { payload } = req;
    const _last = await _findLastOuverture(payload.caisseId);
    log.info("_last", _last);
    let _after = [];
    if (_last.length>0) {
      
      const _ouvertureCreatedAt = _last[0]._doc.createdAt;
      _after = await _findTresors({
        $or: [
          {$and: [
            {destination: payload.caisseId},
            {type: 'entree'},
            {createdAt: { $gt: _ouvertureCreatedAt } }
          ]},
          {$and: [
            {origine: payload.caisseId},
            {type: 'sortie'},
            {createdAt: { $gt: _ouvertureCreatedAt } }
          ]},
          {$and: [
            {origine: payload.caisseId},
            {type: 'cloture'},
            {createdAt: { $gt: _ouvertureCreatedAt } }
          ]}
        ]
      });

      const {tresorslist} = _parseTresors(_after);
      res.send({tresorslist: {[_last[0]._doc.tresorId]:_last[0]._doc, ...tresorslist}});

    } else {

      const _after = await _findTresors({
        $or: [
          {$and: [
            {destination: payload.caisseId},
            {type: 'entree'},
            {createdAt: { $gt: payload.createdAt } }
          ]},
          {$and: [
            {origine: payload.caisseId},
            {type: 'sortie'},
            {createdAt: { $gt: payload.createdAt } }
          ]},
          {$and: [
            {origine: payload.caisseId},
            {type: 'cloture'},
            {createdAt: { $gt: payload.createdAt } }
          ]}
        ]
      });

      const proxies = _parseTresors(_after);
      res.send(proxies);
    }
  },

}

/**
 * Get tresors data from DB
 */
async function _findTresors(criteriae = {}) {
  log.info(criteriae);
  const mongo = await connect();
  const _tresor = await TresorModel.find(criteriae).sort({createdAt: 1}).exec();
 // await mongo.disconnect();
  return _tresor;
}


async function _getLastMouvement(caisseId) {
  const mongo = await connect();
  const _lastMvt = await TresorModel.find({
    $or: [
      {destination: caisseId},
      {origine: caisseId}
    ]
  }).sort({createdAt: -1}).limit(1);

  return (_lastMvt.length>0) ? _lastMvt[0]._doc : null;
}

async function _findLastOuverture(caisseId) {
  const mongo = await connect();
  const _lastOuverture = await TresorModel.find({
    type: "ouverture",
    destination: caisseId 
  }).sort({createdAt: -1}).limit(1);
  // await mongo.disconnect();
  return _lastOuverture;
}

async function _findLastCloture(caisseId) {
  const mongo = await connect();
  const _lastCloture = await TresorModel.find({
    type: "cloture",
    origine: caisseId
  }).sort({createdAt: -1}).limit(1);
  // await mongo.disconnect();
  return _lastCloture;
}

function _parseTresors(_rawdata) {
  let __tresors = {};
  _rawdata.forEach((c) => {
    const __trs = c._doc;
    __tresors[__trs.tresorId] = __trs;
  });

  console.log("Trésorerie: ", __tresors);
  return { tresorslist: __tresors };
}


async function _persistTresor(payload) {
  const __now = new Date().getTime();

  const mongo = await connect();
  let _trs = await TresorModel.where({ tresorId: payload.tresorId })
    .findOne()
    .exec();

  if (_trs) {
    log.info("tresor existe, donc on update");
    _trs = { ..._trs._doc, ...payload, updatedAt: __now };
    delete _trs._id;
    await TresorModel.update({ tresorId: payload.tresorId }, _trs).exec();
  } else {
    log.info("pas de trs donc on insert");
    // Create command id
    const id = await _generateTresorId();
    let __ins = { ...payload, id: id, createdAt: __now, updatedAt: __now };
    _trs = await TresorModel.create(__ins);
  }

  // await mongo.disconnect();
  return _trs;
}



async function _setSynced(ids, datetime) {
  log.info("Sync ids: ", ids);
  if (!ids || !ids.length) {
    return false;
  }

  const __datetime = new Date(datetime).getTime();
  log.info("datetime", __datetime);

  const _tresors = await _findTresors({ id: { $in: ids } });

  _tresors.forEach(async (c) => {
    const doc = c._doc;

    doc.sync = __datetime;
    doc.updatedAt = __datetime;

    await c.save();
    log.info("Tresor synced: ", doc);
  });

  log.info("_tresors", _tresors.length);
  return _tresors != null && _tresors.length;
}




async function _generateTresorId() {
  let id;

  do {
    id = uuid();
  } while (await TresorModel.exists({ id: id }));

  return id;
}

module.exports = actions;