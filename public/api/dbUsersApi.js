const db = require('../db.js');
// const lodashId = require('lodash-id');
// const log = require('electron-log');
const log = require('../utils/logger');
const connect = require("../db/mongodb");
const UserModel = require("../db/userModel");

const actions = {
  dbUsersGetAll: async (req,res) => {
  
    log.info("dbUsersGetAll() in API");

    const proxies = await _getAll();
    res.send(proxies);

  },
  dbHasUsers: async (req,res) => {
    const hasUsers = await _hasUsers();

    log.info('dbHasUsers', hasUsers);
    
    res.send(hasUsers);
  },
  dbUsersLogin: async (req,res) => {
    const {payload} = req;

    const __usr = await _findUser({$and:[{identifiant:payload.identifiant},{status:'active'}]});
    
    res.send(__usr[0]);
  },
  dbUsersLoginSU: async (req,res) => {
    const {payload} = req;

    // (await db.users)._.mixin(lodashId);
    // const __usr = await _findUser((u => (u.identifiant===payload.identifiant && u.status==='superuser')));
    let __usr = null;
    if (payload.identifiant==='290381') {
      __usr =  {
        "user_id": "superusr0",
        "nom": "Superuser",
        "identifiant": "290381 ",
        "status": "superuser"
      };
    }

    res.send(__usr);
  },
  dbAddUser: async (req,res) => {
    const {payload} = req;

    log.info('dbAddUser', payload.user);

    const __usr = await _insertUser(payload.user);

    res.send(__usr);
  },
  dbUpdateUser: async (req,res) => {
    const {payload} = req;
    log.info("dbUpdateUser() in API");

    const __usr = await _persistUser(payload.user);

    res.send(__usr);
  },

  dbGetItems: async (itemtype, ids) => {

    const _clt = await _findUser({user_id: {$in: ids}});
    return _clt;
  },

  dbUsersSummary: async (query) => {

    const _usr = await _findUser(query)

    return {
      user: _usr
    };
  },

  syncConfirm: async (db, ids, from) => {
    const _n = await _addLocalSync(ids,from);
    return _n;
  },
}


async function _hasUsers() {
  const __users = await _findUser({'status':{$ne:"superuser"}});
  log.info('_hasUsers()', __users);
  return __users.length>0;
}

async function _addLocalSync(ids, store_id) {

  const mongo = await connect();
  if (!mongo) return false;

  const _usrs = await UserModel.updateMany(
    {user_id: {$in: ids}, localsync: { $ne: store_id }},
    {$push: {localsync: store_id}}
  );

  return _usrs.n;

}

async function _getAll() {
  
  const __rawdata = await _findUser();
  
  return {users: __rawdata};
}




/**
 * Renvoie l'utilisateur dans l'identifiant est passé dans les critères
 */
async function _findUser(criteriae={}) {
  const mongo = await connect();
  if (!mongo) return false;

  const _usr = await UserModel.find(criteriae).lean().sort({nom: 1}).exec();

  return _usr;
}


async function _persistUser(payload) {

  let { user_id } = payload;

  const mongo = await connect();
  if (!mongo) return false;

  let _user = await UserModel.where({user_id: user_id})
                             .findOne()
                             .lean()
                             .exec();

  if (_user) {
    const __now = new Date().getTime();
    let __upd = {..._user, ...payload, updatedAt:__now};
    _user = await UserModel.updateOne({user_id: user_id}, __upd).exec();

  } else {
    _user = _insertUser(payload);
  }

  return _user;
}


async function _insertUser(payload) {

  log.info('_insertUser()')

  const user_id = payload.user_id || 'usr'+uniqid();
  const __now = new Date().getTime();
  let __ins = {...payload, user_id: user_id, createdAt: __now, updatedAt: __now};

  let _user = await UserModel.create(__ins);
  _user = __ins;

  log.info("new user", _user);

  return _user;
}

function uniqid() {
  return new Date().getTime().toString();
}


module.exports = actions;