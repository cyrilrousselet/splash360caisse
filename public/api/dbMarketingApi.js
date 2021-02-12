const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbAvoirGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbAvoirGetAll() in API");
    
    (await db.avoirs)._.mixin(lodashId);
    const proxies = await _getAllAvoir();
      
    res.send(proxies);
  },
  dbAvoirGetAvoir: async (req,res) => {
    const {payload} = req;
    log.info("dbAvoirGetAvoir("+payload.avoir_id+") in API");
    (await db.avoirs)._.mixin(lodashId);
    const proxies = await _findAvoir({avoir_id: payload.avoir_id});
    log.info(proxies);
    res.send(proxies);
  },
  dbAvoirPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbAvoirPersist() in API");

      (await db.avoirs)._.mixin(lodashId);
      const confirm = await _persistAvoir(payload.avoir);

      res.send(confirm);
  },
  dbAvoirDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbAvoirDelete() in API");

    (await db.avoirs)._.mixin(lodashId);
    const confirm = await _deleteAvoir(payload.avoir_id);

    res.send(confirm);
  },


  dbReglePanierGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbReglePanierGetAll() in API");
    
    (await db.reglespanier)._.mixin(lodashId);
    const proxies = await _getAllReglePanier();
      
    res.send(proxies);
  },
  dbReglePanierPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbReglePanierPersist() in API");

      (await db.reglespanier)._.mixin(lodashId);
      const confirm = await _persistReglePanier(payload.reglepanier);

      res.send(confirm);
  },
  dbReglePanierDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbReglePanierDelete() in API");

    (await db.reglespanier)._.mixin(lodashId);
    const confirm = await _deleteReglePanier(payload.reglepanier_id);

    res.send(confirm);
  },



  dbRegleCatalogueGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbRegleCatalogueGetAll() in API");
    
    (await db.reglescatalogue)._.mixin(lodashId);
    const proxies = await _getAllRegleCatalogue();
      
    res.send(proxies);
  },
  dbRegleCataloguePersist: async (req,res) => {
      const {payload} = req;
      log.info("dbRegleCataloguePersist() in API");

      (await db.reglescatalogue)._.mixin(lodashId);
      const confirm = await _persistRegleCatalogue(payload.reglecatalogue);

      res.send(confirm);
  },
  dbRegleCatalogueDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbRegleCatalogueDelete() in API");

    (await db.reglescatalogue)._.mixin(lodashId);
    const confirm = await _deleteRegleCatalogue(payload.reglecatalogue_id);

    res.send(confirm);
  },


  dbGetItems: async (itemtype, ids) => {
    let response = [];
    if (itemtype==="avoirs") {
      (await db.avoirs)._.mixin(avoirs);
      response = await (await db.avoirs).get('avoirs')
                                        .filter( c => ids.includes(c.avoir_id) )
                                        .value();
    }
    else if (itemtype==="reglespanier") {
      (await db.reglespanier)._.mixin(lodashId);
      response = await (await db.reglespanier).get('reglespanier')
                                              .filter( g => ids.includes(g.reglepanier_id) )
                                              .value();
    } 
    else if (itemtype==="reglescatalogue") {
      (await db.reglescatalogue)._.mixin(lodashId);
      response = await (await db.reglescatalogue).get('reglescatalogue')
                                                 .filter( t => ids.includes(t.reglecatalogue_id) )
                                                 .value();
    }
    return response;
  },

  dbMarketingSummary: async (query) => {

    (await db.avoirs)._.mixin(lodashId);
    (await db.reglespanier)._.mixin(lodashId);
    (await db.reglescatalogue)._.mixin(lodashId);

    const {stationid, exclusion} = query;

    const _avr = await (await db.avoirs).get('avoirs')
                                        .filter( a => {
                                          return exclusion 
                                            ? (a.localsync === undefined) || !a.localsync.includes(stationid)
                                            : (a.localsync !== undefined) &&  a.localsync.includes(stationid)
                                            ;
                                        })
                                        .value();

    const _rpn = await (await db.reglespanier).get('reglespanier')
                                              .filter( p => {
                                                return exclusion 
                                                  ? (p.localsync === undefined) || !p.localsync.includes(stationid)
                                                  : (p.localsync !== undefined) &&  p.localsync.includes(stationid)
                                                  ;
                                              })
                                              .value();

    const _rct = await (await db.reglescatalogue).get('reglescatalogue')
                                                 .filter( c => {
                                                   return exclusion 
                                                     ? (c.localsync === undefined) || !c.localsync.includes(stationid)
                                                     : (c.localsync !== undefined) && c.localsync.includes(stationid)
                                                     ;
                                                 })
                                                 .value();

    return {
      avoirs: _avr,
      reglespanier: _rpn,
      reglescatalogue: _rct
    };
  }

}



async function _getAllAvoir() {
  
  const __rawdata = await _findAvoir();
  return _parseAvoir(__rawdata);
}


/**
 * Get clotures data from DB
 */
async function _findAvoir(criteriae={}) {
  log.info(criteriae);
  let _avr = [];
  if ("avoir_id" in criteriae) {
    _avr = await (await db.avoirs).get('avoirs')
                                    .find(criteriae)
                                    .value();
  } else {
    _avr = await (await db.avoirs).get('avoirs')
                                    .value();
  }
  return { _avr };
}

async function _persistAvoir(payload) {

  const __now = new Date().getTime();
  let _avr = await (await db.avoirs).get('avoirs')
                                    .find({avoir_id: payload.avoir_id})
                                    .value();
  log.info(_avr);
  if (_avr) {
    log.info('avr existe, donc on update');
    let __upd = {..._avr, ...payload, updatedAt: __now};
    _avr = await (await db.avoirs).get('avoirs')
                                  .find({avoir_id: payload.avoir_id})
                                  .assign(__upd)
                                  .write();
  }
  else {
    log.info('pas de avr donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _avr = await (await db.avoirs).get('avoirs')
                                  .insert(__ins)
                                  .write();
  }

  return _avr;
}

function _parseAvoir(_rawdata) {
  // let __pointages = {};
  // _rawdata._pnt.forEach(p => {
  //   __pointages[p.pointage_id] = p;
  // });

  // return {pointageslist: __pointages};
  return {avoirslist: _rawdata._avr};
}

async function _deleteAvoir(avoir_id) {

  const _avr = await (await db.avoirs).get('avoirs')
                                      .remove({ avoir_id: avoir_id })
                                      .write();
  return _avr.length>0;

}



async function _getAllReglePanier() {
  
  const __rawdata = await _findReglePanier();
  return _parseReglePanier(__rawdata);
}


/**
 * Get shifts data from DB
 */
async function _findReglePanier(criteriae={}) {
  log.info(criteriae);
  let _rgp = [];
  if ("reglepanier_id" in criteriae) {
    _rgp = await (await db.reglespanier).get('reglespanier')
                                        .find(criteriae)
                                        .value();
  } else {
    _rgp = await (await db.reglespanier).get('reglespanier')
                                        .value();
  }
  return { _rgp };
}

async function _deleteReglePanier(reglepanier_id) {

  const _rgp = await (await db.reglespanier).get('reglespanier')
                                            .remove({ reglepanier_id: reglepanier_id })
                                            .write();
  return _rgp.length>0;

}

async function _persistReglePanier(payload) {

  const __now = new Date().getTime();
  let _rgp = await (await db.reglespanier).get('reglespanier')
                                          .find({reglepanier_id: payload.reglepanier_id})
                                          .value();
  log.info(_rgp);
  if (_rgp) {
    log.info('rgp existe, donc on update');
    let __upd = {..._rgp, ...payload, updatedAt: __now};
    _rgp = await (await db.reglespanier).get('reglespanier')
                                       .find({reglepanier_id: payload.reglepanier_id})
                                       .assign(__upd)
                                       .write();
  }
  else {
    log.info('pas de rgp donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _rgp = await (await db.reglespanier).get('reglespanier')
                                        .insert(__ins)
                                        .write();
  }

  return _rgp != null;
}

function _parseReglePanier(_rawdata) {
  // let __shifts = {};
  // _rawdata._shf.forEach(p => {
  //   __shifts[p.shift_id] = p;
  // });

  // return {shiftslist: __shifts};
  return {reglespanierlist: _rawdata._rgp};
}



async function _getAllRegleCatalogue() {
  
  const __rawdata = await _findRegleCatalogue();
  return _parseRegleCatalogue(__rawdata);
}


/**
 * Get Timeadjust data from DB
 */
async function _findRegleCatalogue(criteriae={}) {
  log.info(criteriae);
  let _rgc = [];
  if ("reglecatalogue_id" in criteriae) {
    _rgc = await (await db.reglescatalogue).get('reglescatalogue')
                                           .find(criteriae)
                                           .value();
  } else {
    _rgc = await (await db.reglescatalogue).get('reglescatalogue')
                                           .value();
  }
  return { _rgc };
}

async function _persistRegleCatalogue(payload) {

  const __now = new Date().getTime();
  let _rgc = await (await db.reglescatalogue).get('reglescatalogue')
                                             .find({reglecatalogue_id: payload.reglecatalogue_id})
                                             .value();
  log.info(_rgc);
  if (_rgc) {
    log.info('_rgc existe, donc on update');
    let __upd = {..._rgc, ...payload, updatedAt: __now};
    _rgc = await (await db.reglescatalogue).get('reglescatalogue')
                                           .find({reglecatalogue_id: payload.reglecatalogue_id})
                                           .assign(__upd)
                                           .write();
  }
  else {
    log.info('pas de _rgc donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _rgc = await (await db.reglescatalogue).get('reglescatalogue')
                                           .insert(__ins)
                                           .write();
  }

  return _rgc != null;
}

function _parseRegleCatalogue(_rawdata) {
  // let __timeadjusts = {};
  // _rawdata._tma.forEach(p => {
  //   timeadjusts[p.timadjust_id] = p;
  // });

  // return {timadjustslist: __timeadjusts};
  return {reglescataloguelist: _rawdata._rgc};
}


async function _deleteRegleCatalogue(reglecatalogue_id) {

  const _rgc = await (await db.reglescatalogue).get('reglescatalogue')
                                               .remove({ reglecatalogue_id: reglecatalogue_id })
                                               .write();
  return _rgc.length>0;

}

module.exports = actions;