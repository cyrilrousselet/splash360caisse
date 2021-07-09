const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');
// const log = require('../utils/Logger');


const actions = {
  dbTableGetAllSalles: async (req, res) => {
    // const {payload} = req;
    log.info('dbTableGetAllSalles() in API');

    (await db.tables)._.mixin(lodashId);
    const proxies = await _getAllSalles();
    res.send(proxies);
  },
  dbTableGetSalle: async (req, res) => {
    const {payload} = req;
    log.info('dbTableGetSalle() in API');

    (await db.tables)._.mixin(lodashId);
    const proxies = await _findSalle({salleId: payload.salleId});
    res.send(proxies);
  },
  dbTablePersistSalle: async (req,res) => {
      const {payload} = req;
      log.info("dbTablePersistSalle() in API");

      (await db.tables)._.mixin(lodashId);
      const confirm = await _persistSalle(payload.salle);

      res.send(confirm);
  },
  dbTableDeleteSalle: async (req,res) => {
    const {payload} = req;
    log.info("dbTableDeleteSalle() in API");

    (await db.tables)._.mixin(lodashId);
    const confirm = await _deleteSalle(payload.salleId);

    res.send(confirm);
  },
  dbTableGetTable: async (req, res) => {
    const {payload} = req;
    log.info('dbTableGetTable() in API');

    (await db.tables)._.mixin(lodashId);
    const proxies = await _findTable({tableId: payload.tableId});
    res.send(proxies);
  },
  dbTablePersistTable: async (req,res) => {
      const {payload} = req;
      log.info("dbTablePersistTable() in API");

      (await db.tables)._.mixin(lodashId);
      const confirm = await _persistTable({salleId: payload.table.salleId, table: payload.table});

      res.send(confirm);
  },
  dbTableDeleteTable: async (req,res) => {
    const {payload} = req;
    log.info("dbTableDeleteTable() in API");

    (await db.tables)._.mixin(lodashId);
    const confirm = await _deleteTable(payload.tableId);

    res.send(confirm);
  },

  dbTableSummary: async (stationid) => {

    (await db.tables)._.mixin(lodashId);

    const _sal = await (await db.tables).get('salles')
                                        .filter( c => {
                                          return (c.localsync === undefined) || !c.localsync.includes(stationid);
                                        })
                                        .value();

    return {
      salle: _sal
    };
  }
};


async function _getAllSalles() {
  
  const __rawdata = await _findSalle();
 // const __parsed = await _parseSalle(__rawdata);

  const __saltab = await _getSalleTables(__rawdata._sal);

  let __salles = {};
  __saltab.forEach(s => {
    __salles[s.salleId] = s;
  });

  return {salleslist: __salles};

}


/**
 * Get salles data from DB
 */
async function _findSalle(criteriae={}) {
  log.info(criteriae);
  let _sal = [];
  if ("salleId" in criteriae) {
    _sal = await (await db.tables).get('salles')
                                   .find(criteriae)
                                   .value();
  } else {
    _sal = await (await db.tables).get('salles')
                                  .value();
  }
  return { _sal };
}


async function _getSalleTables(salles) {
  return Promise.all(salles.map(async s => {
    const __tables = await _findTable({salleId: s.salleId});
    return {...s, tables: __tables._tab};
  }));
}


// async function _parseSalle(_rawdata) {

//   _getSalleTables(_rawdata._sal).then(_saltab => {

//     let __salles = {};
//     _saltab.forEach(s => {
//       __salles[s.salleId] = s;
//     });
  
//     return {salleslist: __salles};
//   });

//   // const _saltab = await _rawdata._sal.map(async s => {
//   //   const __tables = await _findTable({salleId: s.salleId});
//   //   log.info('tables', __tables._tab);
//   //   return {...s, tables: __tables._tab};
//   // });

//   // log.info('_saltab', _saltab);

//   // let __salles = {};
//   // _saltab.forEach(s => {
//   //   __salles[s.salleId] = s;
//   // });

//   // return {salleslist: __salles};
// }



async function _persistSalle(payload) {

  const __now = new Date().getTime();
  let _sal = await (await db.tables).get('salles')
                                    .find({salleId: payload.salleId})
                                    .value();
  log.info(_sal);
  if (_sal) {
    log.info('salle existe, donc on update');
    let __upd = {..._sal, ...payload, updatedAt: __now};
    _sal = await (await db.tables).get('salles')
                                  .find({salleId: payload.salleId})
                                  .assign(__upd)
                                  .write();
  }
  else {
    log.info('pas de salle donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _sal = await (await db.tables).get('salles')
                                  .insert(__ins)
                                  .write();
  }

  return _sal;
}


async function _deleteSalle(salleId) {

  const _sal = await (await db.tables).get('salles')
                                      .remove({ salleId: salleId })
                                      .write();
  return _sal.length>0;

}



/**
 * Get tables data from DB
 */
async function _findTable(criteriae={}) {
  log.info(criteriae);
  let _tab = [];
  if ("tableId" in criteriae || "salleId" in criteriae) {
    _tab = await (await db.tables).get('tables')
                                   .filter(criteriae)
                                   .value();
  } else {
    _tab = await (await db.tables).get('tables')
                                  .value();
  }
  return { _tab };
}



async function _persistTable(payload) {

  const {table} = payload;

  const __now = new Date().getTime();
  let _tab = await (await db.tables).get('tables')
                                    .find({tableId: table.tableId})
                                    .value();
  log.info(_tab);
  if (_tab) {
    log.info('table existe, donc on update');
    let __upd = {..._tab, ...table, updatedAt: __now};
    _tab = await (await db.tables).get('tables')
                                  .find({tableId: table.tableId})
                                  .assign(__upd)
                                  .write();

  }
  else {
    log.info('pas de table donc on insert');
    let __ins = {...table, createdAt: __now, updatedAt: __now};
    _tab = await (await db.tables).get('tables')
                                  .insert(__ins)
                                  .write();
  }


    // update de la liste des tables de la salle
    let tables = await (await db.tables).get('salles')
                                          .find({salleId: _tab.salleId})
                                          .get('tables')
                                          .value();

    if (tables) {
      tables.push(table.tableId);
    } else {
      tables = [table.tableId];
    }

    let __upds = {updatedAt: __now, tables: tables};
  
    await (await db.tables).get('salles')
                                  .find({salleId: _tab.salleId})
                                  .assign(__upds)
                                  .write();

  return _tab;
}


async function _deleteTable(tableId) {

  const __now = new Date().getTime();

  // on récupère la table qu'on veut supprimer pour récupérer l'id de la salle correspondante
  let _tab = await (await db.tables).get('tables')
                                    .find({tableId: tableId})
                                    .value();

  // update de la liste des tables de la salle
  // update de la liste des tables de la salle
  let tables = await (await db.tables).get('salles')
  .find({salleId: _tab.salleId})
  .get('tables')
  .value();

  if (tables) {
    tables = tables.filter(t=>t.tableId!==tableId)
  } else {
    tables = [];
  }

  let __upds = {updatedAt: __now, tables: tables};

  await (await db.tables).get('salles')
                                      .find({salleId: _tab.salleId})
                                      .assign(__upds)
                                      .write();



  // suppr. de la table
  const _dtab = await (await db.tables).get('tables')
                                      .remove({ tableId: tableId })
                                      .write();


  return _dtab.length>0;

}



module.exports = actions;