const db = require('../db.js');
const log = require('electron-log');
const hydration = require('../dev/dbhydration_chickenstreet.js');
const {users} = hydration;


const actions = {
  dbUsersGetAll: async (req,res) => {
    const {payload} = req;

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

    const user = await _findUser({$and:[{identifiant: payload.identifiant}, {$not:{status: 'disabled'}}]});

    res.send(user);
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

    const confirm = await _persistUser(payload.user);

    res.send({confirm: confirm, ...payload});
  }
}


async function _hasUsers() {
  
  let __rawdata;
  let __users = await db.users.count();
  log.info('count users = '+__users);
  if (__users==0) {
    __rawdata = await _fillinUsers();
  } else {
    __users = await db.users.count();
  }
  
  return __users>0;
}



/** 
 * 
 * @param {object} data from DB 
 */
function _parseUsers(_rawdata) {

  const __users = [];
  _rawdata._users.forEach(u => {
    __users.push({user_id: u.user_id, nom: u.nom, status: u.status, identifiant: u.identifiant, points: u.points, droits: u.droits});
  });

  return {users: __users};
}




async function _getAll() {
  
  let __rawdata;
  let __users = await db.users.count();
  log.info('count users = '+__users);
  if (__users==0) {
    __rawdata = await _fillinUsers();
  } else {
    __rawdata = await _findUsers();
  }
  
  return _parseUsers(__rawdata);
}



/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinUsers() {
  const _users = await db.users.insert(users);
  return { _users };
}

async function _findUsers(prd_criteriae={}) {
  const _users = await db.users.find(prd_criteriae);
  return { _users };
}


/**
 * Renvoie l'utilisateur dans l'identifiant est passé dans les critères
 */
async function _findUser(prd_criteriae={}) {
  const u = await db.users.findOne(prd_criteriae);
  let user = null;
  if (u) {
    user = {id: u.user_id, nom: u.nom, status: u.status, identifiant: u.identifiant, points: u.points, droits: u.droits};
  }
  return user;
}


async function _persistUser(payload) {

  let { user_id } = payload;
  let _user = await db.users.findOne({user_id: user_id});
  if (_user) {
    let __upd = {..._user, ...payload};
    _user = await db.users.update({user_id: user_id}, __upd);
  } else {
     user_id = 'usr'+uniqid();
    _user = await db.users.insert({...payload, user_id: user_id});
  }

  return {confirm:(_user != null), user_id:user_id};
}

async function _insertUser(payload) {

  log.info('_insertUser()')

  _user = await db.users.insert(payload);

  log.info(_user);

  return _user;
}

function uniqid() {
  return new Date().getTime().toString();
}


module.exports = actions;