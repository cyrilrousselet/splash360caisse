import { emit } from "eiphop";
// import logger from '../../helpers/Logger';
import { format } from 'date-fns';
import fs from 'fs';
import crypto from 'crypto';
import {remote} from 'electron';
import mkdirp from 'mkdirp';
import base64url from 'base64url';

const { app } = remote;

export const signatureServices = {
  checkAndCreateKeys,
  getTicketSignature, 
  getDuplicataSignature,
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

  try {
    privateKey = fs.readFileSync(`${app.getPath('userData')}/cert/prv.pem`);
    publicKey = fs.readFileSync(`${app.getPath('userData')}/cert/pub.pem`);
  } catch(e) {

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    fs.writeFile(`${app.getPath('userData')}/cert/prv.pem`, privateKey, function(err) {
        if (err) throw err
    });
  
    fs.writeFile(`${app.getPath('userData')}/cert/pub.pem`, publicKey, function(err) {
        if (err) throw err
    });
  }

  return { cleprivee:privateKey, clepublique:publicKey };
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

  const hashstring = hashfeed.join(',');

  console.log('ticket hashfeed',hashfeed);

  const sign = crypto.createSign('SHA256');
  sign.update(hashstring);
  sign.end();

  const signature = sign.sign(privateKey);

  const signstring = Buffer.from(signature).toString('base64');

  return base64url.fromBase64(signstring);

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

  const hashstring = hashfeed.join(',');

  console.log('duplicata hashfeed',hashfeed);

  const sign = crypto.createSign('SHA256');
  sign.update(hashstring);
  sign.end();

  const signature = sign.sign(privateKey);

  const signstring = Buffer.from(signature).toString('base64');

  return base64url.fromBase64(signstring);

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