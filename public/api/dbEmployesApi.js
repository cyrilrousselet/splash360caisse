const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');


const actions = {
  dbPointagesGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbPointagesGetAll() in API");
    
    (await db.pointages)._.mixin(lodashId);
    const proxies = await _getAllPointages();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbPointagesGetPointage: async (req,res) => {
    const {payload} = req;
    log.info("dbPointagesGetPointage("+payload.pointage_id+") in API");
    (await db.pointages)._.mixin(lodashId);
    const proxies = await _findPointage({pointage_id: payload.pointage_id});
    log.info(proxies);
    res.send(proxies);
  },
  dbPointagesPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbPointagesPersist() in API");

      (await db.pointages)._.mixin(lodashId);
      const __pnt = await _persistPointage(payload.pointage);

      res.send(__pnt);
  },
  dbShiftsGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbShiftsGetAll() in API");
    
    (await db.shifts)._.mixin(lodashId);
    const proxies = await _getAllShifts();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbShiftPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbShiftPersist() in API");

      (await db.shifts)._.mixin(lodashId);
      const confirm = await _persistShift(payload.shift);

      res.send(confirm);
  },
  dbShiftDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbShiftDelete() in API");

    (await db.shifts)._.mixin(lodashId);
    const confirm = await _deleteShift(payload.shift_id);

    res.send(confirm);
  },
  dbTimeadjustsGetAll: async (req,res) => {
    const {payload} = req;
    log.info("dbTimeadjustsGetAll() in API");
    
    (await db.timeadjusts)._.mixin(lodashId);
    const proxies = await _getAllTimeadjusts();
      
  //  log.info(proxies);
    res.send(proxies);
  },
  dbTimeadjustPersist: async (req,res) => {
      const {payload} = req;
      log.info("dbTimeadjustPersist() in API");

      (await db.timeadjusts)._.mixin(lodashId);
      const confirm = await _persistTimeadjust(payload.timeadjust);

      res.send(confirm);
  },
  dbTimeadjustDelete: async (req,res) => {
    const {payload} = req;
    log.info("dbTimeadjustDelete() in API");

    (await db.timeadjusts)._.mixin(lodashId);
    const confirm = await _deleteTimeadjust(payload.adjust_id);

    res.send(confirm);
  },

  dbEmployesSummary: async () => {

    (await db.pointages)._.mixin(lodashId);
    (await db.timeadjusts)._.mixin(lodashId);
    (await db.shifts)._.mixin(lodashId);

    const _pnt = await (await db.pointages).get('pointages').value();
    const _pntSummary = _pnt.map(p => (
      {
        id: p.pointage_id,
        updatedAt: p.updatedAt
      }
    ));
    const _adj = await (await db.timeadjusts).get('timeadjusts').value();
    const _adjSummary = _adj.map(a => (
      {
        id: a.adjust_id,
        updatedAt: a.updatedAt
      }
    ));
    const _shf = await (await db.shifts).get('shifts').value();
    const _shfSummary = _shf.map(s => (
      {
        id: s.shift_id,
        updatedAt: s.updatedAt
      }
    ));
    return {
      pointages: _pntSummary,
      timeadjusts: _adjSummary,
      shifts: _shfSummary
    };
  }

}



async function _getAllPointages() {
  
  const __rawdata = await _findPointage();
  return _parsePointage(__rawdata);
}


/**
 * Get clotures data from DB
 */
async function _findPointage(criteriae={}) {
  log.info(criteriae);
  let _pnt = [];
  if ("pointage_id" in criteriae) {
    _pnt = await (await db.pointages).get('pointages')
                                    .find(criteriae)
                                    .value();
  } else {
    _pnt = await (await db.pointages).get('pointages')
                                    .value();
  }
  return { _pnt };
}

async function _persistPointage(payload) {

  const __now = new Date().getTime();
  let _pnt = await (await db.pointages).get('pointages')
                                      .find({pointage_id: payload.pointage_id})
                                      .value();
  log.info(_pnt);
  if (_pnt) {
    log.info('pnt existe, donc on update');
    let __upd = {..._pnt, ...payload, updatedAt: __now};
    _pnt = await (await db.pointages).get('pointages')
                                    .find({pointage_id: payload.pointage_id})
                                    .assign(__upd)
                                    .write();
  }
  else {
    log.info('pas de pnt donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _pnt = await (await db.pointages).get('pointages')
                                    .insert(__ins)
                                    .write();
  }

  return _pnt;
}

function _parsePointage(_rawdata) {
  // let __pointages = {};
  // _rawdata._pnt.forEach(p => {
  //   __pointages[p.pointage_id] = p;
  // });

  // return {pointageslist: __pointages};
  return {pointageslist: _rawdata._pnt};
}



async function _getAllShifts() {
  
  const __rawdata = await _findShift();
  return _parseShifts(__rawdata);
}


/**
 * Get shifts data from DB
 */
async function _findShift(criteriae={}) {
  log.info(criteriae);
  let _shf = [];
  if ("shift_id" in criteriae) {
    _shf = await (await db.shifts).get('shifts')
                                  .find(criteriae)
                                  .value();
  } else {
    _shf = await (await db.shifts).get('shifts')
                                  .value();
  }
  return { _shf };
}

async function _deleteShift(shift_id) {

  const _shf = await (await db.shifts).get('shifts')
                                      .remove({ shift_id: shift_id })
                                      .write();
  return _shf.length>0;

}

async function _persistShift(payload) {

  const __now = new Date().getTime();
  let _shf = await (await db.shifts).get('shifts')
                                      .find({shift_id: payload.shift_id})
                                      .value();
  log.info(_shf);
  if (_shf) {
    log.info('shf existe, donc on update');
    let __upd = {..._shf, ...payload, updatedAt: __now};
    _shf = await (await db.shifts).get('shifts')
                                  .find({shift_id: payload.shift_id})
                                  .assign(__upd)
                                  .write();
  }
  else {
    log.info('pas de shf donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _shf = await (await db.shifts).get('shifts')
                                  .insert(__ins)
                                  .write();
  }

  return _shf != null;
}

function _parseShifts(_rawdata) {
  // let __shifts = {};
  // _rawdata._shf.forEach(p => {
  //   __shifts[p.shift_id] = p;
  // });

  // return {shiftslist: __shifts};
  return {shiftslist: _rawdata._shf};
}



async function _getAllTimeadjusts() {
  
  const __rawdata = await _findTimeadjust();
  return _parseTimeadjust(__rawdata);
}


/**
 * Get Timeadjust data from DB
 */
async function _findTimeadjust(criteriae={}) {
  log.info(criteriae);
  let _tma = [];
  if ("timadjust_id" in criteriae) {
    _tma = await (await db.timeadjusts).get('timeadjusts')
                                       .find(criteriae)
                                       .value();
  } else {
    _tma = await (await db.timeadjusts).get('timeadjusts')
                                       .value();
  }
  return { _tma };
}

async function _persistTimeadjust(payload) {

  const __now = new Date().getTime();
  let _tma = await (await db.timeadjusts).get('timeadjusts')
                                         .find({timadjust_id: payload.timadjust_id})
                                         .value();
  log.info(_tma);
  if (_tma) {
    log.info('tma existe, donc on update');
    let __upd = {..._tma, ...payload, updatedAt: __now};
    _tma = await (await db.timeadjusts).get('timeadjusts')
                                       .find({timadjust_id: payload.timadjust_id})
                                       .assign(__upd)
                                       .write();
  }
  else {
    log.info('pas de tma donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _tma = await (await db.timeadjusts).get('timeadjusts')
                                  .insert(__ins)
                                  .write();
  }

  return _tma != null;
}

function _parseTimeadjust(_rawdata) {
  // let __timeadjusts = {};
  // _rawdata._tma.forEach(p => {
  //   timeadjusts[p.timadjust_id] = p;
  // });

  // return {timadjustslist: __timeadjusts};
  return {timeadjustslist: _rawdata._tma};
}


async function _deleteTimeadjust(adjust_id) {

  const _tma = await (await db.timeadjusts).get('timeadjusts')
                                      .remove({ adjust_id: adjust_id })
                                      .write();
  return _tma.length>0;

}

module.exports = actions;