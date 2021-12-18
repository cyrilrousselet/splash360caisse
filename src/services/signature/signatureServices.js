import { emit } from "eiphop";
// import logger from '../../helpers/Logger';
import { format } from 'date-fns';
import fs from 'fs';
import crypto from 'crypto';
import {remote} from 'electron';
import mkdirp from 'mkdirp';
import base64url from 'base64url';
import { uuid } from "uuidv4";
import canonicalizeString from "@pelevesque/canonicalize-string";

const { app } = remote;

export const signatureServices = {
  checkAndCreateKeys,
  createTicketSignature, 
  createDuplicataSignature,
  createGrandtotalSignature,
  createJETSignature,
  createZdecaisseSignature,
  createExportComptableSignature,
  createArchiveFiscaleSignature,
  getAllSignatures,
  getLastSignature,
  getAllNumerotation,
  getNumerotation,
  setTicketNumero, 
  persistSignature,
  persistNumerotation,
  verify,
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

function createTicketSignature(commande, privateKey, lastSignature = null) {

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


function createDuplicataSignature(commande, privateKey, lastSignature = null) {

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
  
  let __datetime = format(new Date(), 'yyyyMMddHHmmss');
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


function createGrandtotalSignature(source, GTPCA, privateKey, lastSignature = null) {

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


function createZdecaisseSignature(zdecaisse, privateKey, lastSignature = null) {
  let hashfeed = [];

  // id de Z de caisse
  hashfeed.push(zdecaisse.zid);

  // type de Z de caisse
  hashfeed.push(zdecaisse.type);

  // chiffre d'affaire
  hashfeed.push(zdecaisse.ca);

  // liste des caisses du Z
  const __caissesId = Object.values(zdecaisse.ventilation.caisse).map(c => c.id);
  hashfeed.push(__caissesId.join('|'));
  
  // depenses
  hashfeed.push(zdecaisse.depenses);
  
  // nombre d'avoirs émis
  hashfeed.push(zdecaisse.emission);
  
  // fdcaisse
  hashfeed.push(zdecaisse.fdcaisse);
  
  // mtcaisse
  hashfeed.push(zdecaisse.mtcaisse);
  
  // nombre de commandes
  hashfeed.push(zdecaisse.numtickets);
  
  // paramfdcaisse
  hashfeed.push(zdecaisse.paramfdcaisse);
  
  // remboursements
  hashfeed.push(zdecaisse.remboursements);
  
  // valeur moyenne d'une commande
  hashfeed.push(zdecaisse.ticket_moyen);
  
  // ventes
  hashfeed.push(zdecaisse.ventes);

  // ventilation moyens:
  let __vent_moyens = Object.values(zdecaisse.ventilation.moyen).map(m => (m.moyen+':'+m.valeur));
  hashfeed.push(__vent_moyens.join('|'));

  // ventilation tvattc:
  let __vent_tvattc = Object.values(zdecaisse.ventilation.tva).map(t => {
    let __tx = t.taux * 100;
    if (__tx<1000) __tx = '0'+__tx;
    return __tx+':'+t.ttc;
  });
  hashfeed.push(__vent_tvattc.join('|'));

  // ventilation tvaht:
  let __vent_tvaht = Object.values(zdecaisse.ventilation.tva).map(t => {
    let __tx = t.taux * 100;
    if (__tx<1000) __tx = '0'+__tx;
    return __tx+':'+t.ht;
  });
  hashfeed.push(__vent_tvaht.join('|'));

  // ventilation tvataxe:
  let __vent_tvataxe = Object.values(zdecaisse.ventilation.tva).map(t => {
    let __tx = t.taux * 100;
    if (__tx<1000) __tx = '0'+__tx;
    return __tx+':'+t.taxe;
  });
  hashfeed.push(__vent_tvataxe.join('|'));
  
  
  // ventilation moyens:
  let __vent_vendeurs = Object.values(zdecaisse.ventilation.vendeur).map(v => (v.id+':'+(v.ventes - v.remboursements)));
  hashfeed.push(__vent_vendeurs.join('|'));
  
  // ventilation caisses:
  let __vent_caisses = Object.values(zdecaisse.ventilation.caisse).map(c => (c.id+':'+c.ca));
  hashfeed.push(__vent_caisses.join('|'));
  
  // prelevement
  hashfeed.push(zdecaisse.prelevement);


  // periode
  hashfeed.push(zdecaisse.periode);

  // horodatage
  const __datetime = format(new Date(zdecaisse.createdAt), 'yyyyMMddHHmmss');
  hashfeed.push(__datetime);

  // report de signature
  const __report = (lastSignature===null) ? 'N' : 'O';
  hashfeed.push(__report);

  // signature précédente
  const __last = (lastSignature===null) ? ' ' : lastSignature;
  hashfeed.push(__last);

  const hashsource = hashfeed.join(',');

  return _createSignature(hashsource, privateKey);
}


function createJETSignature(source, privateKey, lastSignature = null) {

  let hashfeed = [];

  // Identifiant de l'évènement (TAG-JET-NID)
  hashfeed.push(source['JET-NID']);

  // Code de l'évènement (TAG-JET-COD)
  hashfeed.push(source['JET-EVT-NUM']);
  
  // Information complémentaire contextuelle à l'évènement (TAG-JET-LIB)
  hashfeed.push(canonicalizeString(source['JET-INF']));
  
  // Date et Heure de l’opération (TAG-JET-HOR-GDH)
  hashfeed.push(source['JET-GDH']);
  
  // Code opérateur (TAG-JET-OPS-NID)
  hashfeed.push(source['JET-OPE-NID']);
  
  // Code caisse (TAG-JET-CAI-NID)
  hashfeed.push(source.caisse.id);
  
  // Indication du report de la signature précédente (TAG-JET-OEN)
  const __report = (lastSignature===null) ? 'N' : 'O';
  hashfeed.push(__report);
  
  // Signature électronique précédente (TAG-JET-SIG)
  const __last = (lastSignature===null) ? ' ' : lastSignature;
  hashfeed.push(__last);

  const hashsource = hashfeed.join(',');

  console.log('JET hashfeed',hashfeed);

  return _createSignature(hashsource, privateKey);

}


function createExportComptableSignature(recap, privateKey) {
  return _createSignature(JSON.stringify(recap), privateKey);
}

function createArchiveFiscaleSignature(data, privateKey) {
  // console.log('createArchiveFiscaleSignature()',data);
  return _createSignature(data, privateKey);
}


function _createSignature(hashsource, privateKey) {

  const hash = crypto.createHash('SHA256');
  hash.update(hashsource);
  hash.end();
  const hashstring = Buffer.from(hashsource).toString('base64');

  const hmac = crypto.createHmac('SHA256', privateKey);
  hmac.update(hashsource);

  const sign = crypto.createSign('SHA256');
  sign.update(hashsource);
  sign.end();

  const signature = sign.sign(privateKey);

  const signstring = Buffer.from(signature).toString('base64');

  return {
    source: hashsource,
    hmac: hmac.digest('hex'),
    hash: base64url.fromBase64(hashstring),
    signature: base64url.fromBase64(signstring)
  };
}

function verify(hashsource, signature, publicKey) {

  const data = Buffer.from(hashsource);
  const sign = base64url.toBase64(signature);

  const isVerified = crypto.verify('SHA256', data, publicKey, Buffer.from(sign));

  return isVerified;

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
         'zdecaisse',
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
         'grandstotaux_jour', 
         'grandstotaux_mois', 
         'grandstotaux_annee', 
         'zdecaisse', 
         'archivesfiscales',
         'pistedaudit',
         'jet']).includes(type)) {
    throw new Error('Type de signature inconnu');
  }
  return emit('dbSignaturesGetLast', type);
}