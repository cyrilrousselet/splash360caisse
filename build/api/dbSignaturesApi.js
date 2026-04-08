// const db = require('../db');
const log = require('../utils/logger');
const { last, lowerCase } = require('lodash');
const connect = require("../db/mongodb");
const SignatureModel = require("../db/signatureModel");
const NumerotationModel = require("../db/numerotationModel");
const MemoireModel = require("../db/memoireModel");
const TrousseauModel = require("../db/trousseauModel");
// const { uuid } = require("uuidv4");


const actions = {
  dbSignaturesGetAll: async (req,res) => {
    log.info("dbSignaturesGetAll in API");
    const proxies = await _getAllSignatures();
    res.send(proxies);
  },
  dbSignaturesGetLast: async (req,res) => {
    const { payload } = req;
    log.info('dbSignaturesGetLast in API ('+payload+')');
    const proxies = await _findSignatures({cle: payload}, true);
    res.send(proxies);
  },
  dbSignaturesPersist: async (req,res) => {
    const { payload } = req;
    log.info("dbSignaturesPersist in API ("+JSON.stringify(payload)+")");
    const proxies = await _persistSignature(payload.type, payload.signature);
    res.send(proxies);
  },
  dbNumerotationGetAll: async (req,res) => {
    log.info("dbNumerotationGetAll in API");
    const proxies = await _findNumerotation();
    log.info('dbNumerotationGetAll() '+JSON.stringify(proxies));
    res.send(proxies);
  },
  dbNumerotationGet: async (req,res) => {
    const { payload } = req;
    log.info('dbNumerotationGet in API ('+payload+')');
    const proxies = await _findNumerotation({cle: payload});
    res.send(proxies);
  },
  dbNumerotationSet: async (req,res) => {
    const { payload } = req;
    log.info('dbNumerotationSet in API ('+JSON.stringify(payload)+')');
    const proxies = await _persistNumerotation({cle: payload.cle, valeur: payload.value});
    res.send(proxies);
  },
  dbTrousseauGet: async (req, res) => {
    const proxies = await _getTrousseau();
    res.send(proxies);
  },
  dbTrousseauSet: async (req, res) => {
    const { payload } = req;
    log.info('dbTrousseauSet in API');
    const proxies = await _persistTrousseau(payload);
    res.send(proxies);
  },
  dbMemoireGet: async (req, res) => {
    const proxies = await _getMemoire();
    res.send(proxies);
  },
  dbMemoireSet: async (req, res) => {
    const { payload } = req;
    log.info('dbMemoireSet in API');
    const proxies = await _persistMemoire(payload);
    res.send(proxies);
  }
}




async function _getAllSignatures() {
  const __rawdata = await _findSignatures();
  return __rawdata;
}


async function _findSignatures(criteriae={}, lastitem=false) {
  log.info('dbSignaturesApi._findSignatures() c='+JSON.stringify(criteriae));
  const mongo = await connect();
  if (!mongo) return false;
  /* 
    tickets:[],
    duplicatas:[],
    grandstotaux_jour:[],
    grandstotaux_mois:[],
    grandstotaux_annee:[],
    archivesfiscales:[],
    pisteaudit:[],
    jet:[],
  */
  
  const _sgn = await SignatureModel.find(criteriae).lean().exec();
  
  // log.info('_sgn :'+JSON.stringify(_sgn));

  if (lastitem) {
    if (!_sgn[0]) return null;
    return last(_sgn[0].liste);
  }

  return { _sgn };
}

// async function _getAllNumerotation() {
//   const __rawdata = await _findNumerotation();
//   return __rawdata;
// }

async function _findNumerotation(criteriae={}) {

  const mongo = await connect();
  if (!mongo) return false;

  let __num = await NumerotationModel.find(criteriae).lean().exec();

  log.info('_findNumerotation('+JSON.stringify(criteriae)+') -> '+JSON.stringify(__num)+' crit.L'+Object.keys(criteriae).length);

  if (__num.length<1 && Object.keys(criteriae).length<1) {

    __num = [
      {cle:"ticket", valeur:1},
      {cle:"note", valeur:1},
      {cle:"duplicata", valeur:1},
      {cle:"grandtotal", valeur:1},
      {cle:"cloture", valeur:1},
      {cle:"zdecaisse", valeur:1},
      {cle:"archivefiscale", valeur:1},
      {cle:"pistedaudit", valeur:1},
      {cle:"jet", valeur:1}
    ];
    let __count = 0;
    await asyncForEach(__num, async (obj) => {
      await _persistNumerotation(obj);
      __count++;
      log.info('loop persist ('+__count+' / '+__num.length+') = '+JSON.stringify(obj));
      if (__count>=__num.length) {
        return true;
      }
    });
  }

  return __num;
}

async function _persistNumerotation(params=null) {
  log.info("dbSignatures._persistNumerotation() "+JSON.stringify(params));

  const mongo = await connect();
  if (!mongo) return false; 
  
  let _num = null;
  if (params) {
    _num = await NumerotationModel.updateOne({cle: params.cle},{valeur: params.valeur}).exec();
    log.info('PERSIST NUMEROTATION RETURNS '+JSON.stringify(_num));
    if (_num.n < 1) {
      _num = await NumerotationModel.create({cle: params.cle, valeur: params.valeur})
    }
  }
  return true;
}

async function _persistSignature(type, signature) {
  log.info("dbSignatures._persistSignature("+type+") "+signature);
  const mongo = await connect();
  if (!mongo) return false;

  // let _sgn = await (await db.signatures).get('signatures')
  //                               .find({cle: type})
  //                               .get('liste')
  //                               .push(signature)
  //                               .write();
  
  // return _sgn;
  let _sgn = null;
  if (type) {
    _sgn = await SignatureModel.updateOne({cle: type},{$push: {liste: signature}}).exec();
    if (_sgn.n < 1) {
      _sgn = await SignatureModel.create({cle: type, liste: [signature]})
    }
  }
  return true;
}

async function _getTrousseau() {
  const mongo = await connect();
  if (!mongo) return false;

  let __trs = await TrousseauModel.find({}).lean().sort({createdAt: -1}).limit(1).exec();

  return __trs;

}

async function _persistTrousseau(trousseau) {
  const mongo = await connect();
  if (!mongo) return false;

  const _trs = await TrousseauModel.create({
    trousseauId: trousseau.trousseauId, 
    privateKey: trousseau.privateKey, 
    publicKey: trousseau.publicKey, 
    createdAt: new Date().getTime()
  });
  return _trs;
}

async function _getMemoire() {
  const mongo = await connect();
  if (!mongo) return false;

  let __mm = await MemoireModel.find({}).lean().sort({createdAt: -1}).limit(1).exec();

  return __mm;

}

async function _persistMemoire(memoire) {
  const mongo = await connect();
  if (!mongo) return false;

  const __mm = await MemoireModel.create(memoire);
  return __mm;
}



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = actions;