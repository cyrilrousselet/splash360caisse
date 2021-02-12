const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');

const actions = {
  dbUsersGetAll: async (req,res) => {
    const {payload} = req;

    (await db.users)._.mixin(lodashId);
    log.info("dbUsersGetAll() in API");

    const proxies = await _getAll();
    res.send(proxies);

  },
  dbHasUsers: async (req,res) => {
    const hasUsers = await _hasUsers();

    (await db.users)._.mixin(lodashId);
    log.info('dbHasUsers', hasUsers);
    
    res.send(hasUsers);
  },
  dbUsersLogin: async (req,res) => {
    const {payload} = req;

    (await db.users)._.mixin(lodashId);
    const __usr = await _findUser((u => (u.identifiant==payload.identifiant && u.status!='disabled')));
    
    res.send(__usr);
  },
  dbAddUser: async (req,res) => {
    const {payload} = req;

    (await db.users)._.mixin(lodashId);
    log.info('dbAddUser', payload.user);

    const __usr = await _insertUser(payload.user);

    res.send(__usr);
  },
  dbUpdateUser: async (req,res) => {
    const {payload} = req;
    log.info("dbUpdateUser() in API");

    (await db.users)._.mixin(lodashId);
    const __usr = await _persistUser(payload.user);

    res.send(__usr);
  },

  dbGetItems: async (itemtype, ids) => {

    (await db.users)._.mixin(lodashId);
    const response = await (await db.users).get('users')
                                           .filter( c => ids.includes(c.user_id) )
                                           .value();
    
    return response;
  },

  dbUsersSummary: async (stationid) => {

    (await db.users)._.mixin(lodashId);


    const _usr = await (await db.users).get('users')
                                       .filter( u => {
                                         return (u.localsync === undefined) || !u.localsync.includes(stationid);
                                       })
                                       .value();
    return {
      setUserSync: _usr
    };
  }
}


async function _hasUsers() {
  const __users = await (await db.users).get('users').size().value();
  log.info('_hasUsers()', __users);
  return __users>0;
}


async function _getAll() {
  
  const __rawdata = await _findUsers();
  
  return {users: __rawdata};
}


async function _findUsers() {
  const users = await (await db.users).get('users').value();
  return users;
}


/**
 * Renvoie l'utilisateur dans l'identifiant est passé dans les critères
 */
async function _findUser(filterFn) {
  const user = await (await db.users).get('users')
                                     .find(filterFn)
                                     .value();
  return user;
}


async function _persistUser(payload) {

  let { user_id } = payload;
  let _user = await (await db.users).get('users')
                                    .find({user_id: user_id})
                                    .value();

  if (_user) {
    const __now = new Date().getTime();
    let __upd = {..._user, ...payload, updatedAt:__now};
    _user = await (await db.users).get('users')
                                  .find({user_id: user_id})
                                  .assign(__upd)
                                  .write();
  } else {
    _user = _insertUser(payload);
    //  user_id = 'usr'+uniqid();
    // _user = await (await db.users).get('users')
    //                               .push({...payload, user_id: user_id})
    //                               .write();
  }

  //return {confirm:(_user != null), user_id:user_id};
  return _user;
}


async function _insertUser(payload) {

  log.info('_insertUser()')

  const user_id = payload.user_id || 'usr'+uniqid();
  const __now = new Date().getTime();
  let __upd = {...payload, user_id: user_id, createdAt: __now, updatedAt: __now};

  const _user = await (await db.users).get('users')
                                .insert(__upd)
                                .write();

  log.info("new user", _user);

  return _user;
}

function uniqid() {
  return new Date().getTime().toString();
}


module.exports = actions;