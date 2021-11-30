import { emit } from "eiphop";
// import logger from '../../helpers/Logger';
import { format } from 'date-fns';
import fs from 'fs';
import crypto from 'crypto';
import {remote} from 'electron';
import mkdirp from 'mkdirp';
import base64url from 'base64url';
import { uuid } from "uuidv4";

const { app } = remote;

export const signatureServices = {
  checkAndCreateKeys,
  getTicketSignature, 
  getDuplicataSignature,
  getGrandtotalSignature,
  getAllSignatures,
  getLastSignature,
  getAllNumerotation,
  getNumerotation,
  setTicketNumero, 
  persistSignature,
  persistNumerotation,
};


const _checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}


function checkAndCreateKeys() {
  _checkDirectorySync(`${app.getPath('userData')}/cert`);

  let privateKey = "";
  let publicKey = "";
  let trousseauId = null;

  try {
    privateKey = fs.readFileSync(`${app.getPath('userData')}/cert/prv.pem`);
    publicKey = fs.readFileSync(`${app.getPath('userData')}/cert/pub.pem`);
    trousseauId = fs.readFileSync(`${app.getPath('userData')}/cert/trousseau.data`);
  } catch(e) {

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    trousseauId = uuid();

    fs.writeFile(`${app.getPath('userData')}/cert/prv.pem`, privateKey, function(err) {
        if (err) throw err
    });
  
    fs.writeFile(`${app.getPath('userData')}/cert/pub.pem`, publicKey, function(err) {
        if (err) throw err
    });
  
    fs.writeFile(`${app.getPath('userData')}/cert/trousseau.data`, trousseauId, function(err) {
        if (err) throw err
    });
    
  }

  return { privateKey, publicKey, trousseauId:trousseauId.toString() };
}

function getTicketSignature(commande, privateKey, lastSignature = null) {

  if (commande.status !== 'confirmed') return null;
  if (!commande.ticket) return null;

  let hashfeed = [];
  
  let __tva = Object.values(commande.ventilation).map(tva => {
    let __tx = tva.taux * 10000;
    if (__tx<1000) __tx = '0'+__tx;
    return __tx + ':' + tva.ttc;
  });
  hashfeed.push(__tva.join('|'));
  
  let __ttc = Math.round(commande.total * 100);
  hashfeed.push(__ttc);
  
  let __datetime = format(new Date(commande.createdAt), 'yyyyMMddHHmmss');
  hashfeed.push(__datetime);

  let __numero = commande.ticket;
  hashfeed.push(__numero);

  let __operation = "VENTE";
  hashfeed.push(__operation);
  
  const __report = (lastSignature===null) ? 'N' : 'O';
  hashfeed.push(__report);

  const __last = (lastSignature===null) ? ' ' : lastSignature;
  hashfeed.push(__last);

  const hashsource = hashfeed.join(',');

  console.log('ticket hashfeed',hashfeed);

  return _createSignature(hashsource, privateKey);

}


function getDuplicataSignature(commande, privateKey, lastSignature = null) {

  if (commande.status !== 'confirmed') return null;
  if (!commande.duplicata) return null;

  let hashfeed = [];
  
  let __tva = Object.values(commande.ventilation).map(tva => {
    let __tx = tva.taux * 10000;
    if (__tx<1000) __tx = '0'+__tx;
    return __tx + ':' + tva.ttc;
  });
  hashfeed.push(__tva.join('|'));
  
  let __ttc = Math.round(commande.total * 100);
  hashfeed.push(__ttc);
  
  let __datetime = format(new Date(commande.createdAt), 'yyyyMMddHHmmss');
  hashfeed.push(__datetime);

  let __numero = commande.duplicata;
  hashfeed.push(__numero);

  let __operation = "VENTE";
  hashfeed.push(__operation);
  
  const __report = (lastSignature===null) ? 'N' : 'O';
  hashfeed.push(__report);

  const __last = (lastSignature===null) ? ' ' : lastSignature;
  hashfeed.push(__last);

  const hashsource = hashfeed.join(',');

  console.log('duplicata hashfeed',hashfeed);

  return _createSignature(hashsource, privateKey);

}


function getGrandtotalSignature(source, GTPCA, privateKey, lastSignature = null) {

  let hashfeed = [];
  if (source.type==="ticket") {

    // compilation de la ventilation de TVA de la commande
    let __tva = Object.values(source.commande.ventilation).map(tva => {
      let __tx = tva.taux * 10000;
      if (__tx<1000) __tx = '0'+__tx;
      return __tx + ':' + tva.ttc;
    });
    hashfeed.push(__tva.join('|'));
    
    // montant total de la commande
    let __ttc = Math.round(source.commande.total * 100);
    hashfeed.push(__ttc);
  }
  else {
    // Ventilation de TVA de la période
    hashfeed.push(source.tva);

    // CA de la période
    hashfeed.push(source.ttc);
  }
  
  // Grand Total Perpétuel Cumul Algébrique
  hashfeed.push(GTPCA);

  
  if (source.type==="ticket") {

    // horodatage
    let __datetime = format(new Date(source.commande.createdAt), 'yyyyMMddHHmmss');
    hashfeed.push(__datetime);

    // numerotation du ticket
    let __numero = source.commande.ticket;
    hashfeed.push(__numero);

  } else {

    // horodatage
    let __datetime = format(new Date(), 'yyyyMMddHHmmss');
    hashfeed.push(__datetime);

    // identification de la période
    hashfeed.push(source.periode);

  }
  
  const __report = (lastSignature===null) ? 'N' : 'O';
  hashfeed.push(__report);

  const __last = (lastSignature===null) ? ' ' : lastSignature;
  hashfeed.push(__last);

  const hashsource = hashfeed.join(',');

  console.log('grand total hashfeed',hashfeed);

  return _createSignature(hashsource, privateKey);

}


function _createSignature(hashsource, privateKey) {

  const hash = crypto.createHash('SHA256');
  hash.update(hashsource);
  hash.end();
  const hashstring = Buffer.from(hashsource).toString('base64');

  const sign = crypto.createSign('SHA256');
  sign.update(hashsource);
  sign.end();

  const signature = sign.sign(privateKey);

  const signstring = Buffer.from(signature).toString('base64');

  return {
    source: hashsource,
    hash: base64url.fromBase64(hashstring),
    signature: base64url.fromBase64(signstring)
  };
}


function setTicketNumero(numero) {
  return emit('dbNumerotationSet', {cle: 'ticket', valeur:numero});
}

function persistSignature(type, signature) {
  return emit('dbSignaturesPersist', {type: type, signature: signature});
}
function persistNumerotation(type, numerotation) {
  return emit('dbNumerotationSet', {cle: type, value: numerotation});
}

function getAllSignatures() {
  return emit('dbSignaturesGetAll', {});
}
function getAllNumerotation() {
  return emit('dbNumerotationGetAll', {});
}
function getNumerotation(type) {
  if (!(['ticket',
         'duplicata',
         'grandtotal',
         'cloture',
         'archivefiscale',
         'pistedaudit',
         'jet']).includes(type)) {
    throw new Error('Type de numerotation inconnu');
  }
  return emit('dbNumerotationGet', type);
}

function getLastSignature(type) {
  if (!(['tickets', 
         'duplicatas', 
         'grandstotaux', 
         'archivesfiscales']).includes(type)) {
    throw new Error('Type de signature inconnu');
  }
  return emit('dbSignaturesGetLast', type);
}