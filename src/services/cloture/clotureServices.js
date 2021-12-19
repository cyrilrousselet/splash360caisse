import {emit} from 'eiphop';

import {remote} from 'electron';
import { startOfToday, isAfter, isBefore, endOfToday } from 'date-fns';
// import { dateBounds } from '../../helpers/toolbox';
// import LodashId from 'lodash-id';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import format from 'date-fns/format';
import { createObjectCsvWriter } from 'csv-writer';
import archiver from 'archiver';
import zipencryptable from 'archiver-zip-encryptable';
import fs from 'fs';
import mkdirp from 'mkdirp';

const {app} = remote;

// const logger = new Logger();

archiver.registerFormat('zip-encryptable', zipencryptable);

const _checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}

export const clotureServices = {
  getCurrentPeriode,
  makeCloture,
  saveCloture,
  getClotureById,
  getLast,
  getCloturesList,
  setSyncedClotures,
  getCloturesToSync,
  getGTP,
  updateGTP,
  getGTTicket,
  persistGTTicket,
  getGTPeriodique,
  persistGTPeriodique,
  getTodayCa,
  getBoundedClotures,
  getLastGTPeriodique,
  getZCaisse,
  getLastZCaisse,
  persistZCaisse,
  exportComptable,
  createArchiveFiscale,
  persistArchiveFiscale,
  getArchiveFiscale,
  // checkYesterdayGTT,
};





function getTodayCa(heure_fin) {

  return emit('dbCommandesGetTodayCa', {from: heure_fin});
  }

//   return {ca, numtickets};
// }

function getCurrentPeriode(commandes, gtt, catalogue, params) {

 logger.info('clotureServices.getCurrentPeriode() '+Object.values(commandes).length+', '+JSON.stringify(params));

  let __dep = 0
     ,__remb = 0
     ,__numStandby = 0
     ,__fdcaisse_courant = Number(params.fdcaisse)
     ,__emission = 0
     ,__troppercu = 0
     ,__start = startOfToday()
     ,__end = endOfToday() //startOfDay(new Date('2000-01-01'))
     ;


  const vendeur = params.vendeur || null;
  // const caisse = params.caisse || null;
  

  // filtrage de la liste des commandes
  if (commandes) {
    // let numvalid = 0;
    const __filtered_cmd = Object.values(commandes).filter(cmd => {

      let __valid = true;

      // on ne considère pas les commandes des autres centres de revenus
      if (cmd.hasOwnProperty('centre_revenu') && cmd.centre_revenu!=='restaurant') {__valid = false; console.warn('cmd filtrée centre_revenu',cmd.centre_revenu)}

      // on ne considère pas les commandes en attente annulées :
      if (cmd.status==='deleted') {__valid = false; console.warn('cmd filtrée status',cmd.status)};

      // on ne conidère pas les commandes sans ventilation de TVA :
      if (!cmd.ventilation) {__valid = false; console.warn('cmd.filtrée ventilation absente')};

      // on ne récupère que les cmd non archivées (cas du Z)
      if (cmd.archived!==undefined && cmd.archived!==null) {__valid = false; console.warn("cmd filtrée déjà archivée")}
      // if (__valid) numvalid++;


      if (__valid && cmd.status!=='confirmed') __numStandby++;

      // si un vendeur est précisé
      if (vendeur) {
        if (!cmd.operator_encaissement || (cmd.operator_encaissement && vendeur.id !== cmd.operator_encaissement.id)) {__valid = false; console.warn('cmd filtrée operateur', cmd.operator_encaissement, vendeur.id)}
      } 

      // si une caisse est précisée
      // if (caisse) {
      //   if (!cmd.caisse_encaissement || (caisse.id !== cmd.caisse_encaissement.id)) {__valid = false; console.warn('cmd filtrée, caisse',cmd.caisse_encaissement, caisse.id)}
      // } 
        

      // status
      if (cmd.status!=='confirmed') {__valid = false; console.warn('cmd filtrée : non confirmed')};

    //  logger.info('cmd valid='+__valid,cmd);
      return __valid;
    });

    // console.log('après deleted', numvalid, '/', Object.values(commandes).length);
    // logger.info('après deleted', numvalid, '/', Object.values(commandes).length);

    console.log('filtererd_cmd', __filtered_cmd.length);
    // logger.info('filtererd_cmd', __filtered_cmd.length);



    let ventilation = {
      moyen: {},
      tva: {},
      vendeur: {},
      caisse: {},
    };
    let ca = 0;
    let caht = 0;
    let numtickets = 0;
    let ticket_moyen = 0;
    let staffmeals = 0;




    // récup des différentes valeurs :
    __filtered_cmd.forEach(cmd => {

      let cmdtotal = 0;


      // analyse des données du Grand Total Ticket correspondant à la commande
      const __gtt = gtt[cmd.ticket];
      if (__gtt) {
        const gt_tvattc = __gtt['ENC-GTT-MTN-TVA-TTC'].split('|');
        gt_tvattc.forEach(t => {
          let cpl = t.split(':');

          if (!ventilation.tva.hasOwnProperty(cpl[0])) {
            ventilation.tva[cpl[0]] = {
              taux: parseInt(cpl[0]) / 100,
              ttc: 0,
              ht: 0,
              taxe: 0
            };
          }

          Object.assign(ventilation.tva[cpl[0]], {
            ttc: ventilation.tva[cpl[0]].ttc + parseInt(cpl[1])
          });

          // compilation du CA TTC
          ca += parseInt(cpl[1]);
          cmdtotal += parseInt(cpl[1]);
        });

        const gt_tvaht = __gtt['ENC-GTT-MTN-TVA-HT'].split('|');
        gt_tvaht.forEach(t => {
          let cpl = t.split(':');

          Object.assign(ventilation.tva[cpl[0]], {
            ht: ventilation.tva[cpl[0]].ht + parseInt(cpl[1])
          });

          // compilation du CA Hors Taxe
          caht += parseInt(cpl[1]);
        });

        const gt_tvataxe = __gtt['ENC-GTT-MTN-TVA-TAUX'].split('|');
        gt_tvataxe.forEach(t => {
          let cpl = t.split(':');

          Object.assign(ventilation.tva[cpl[0]], {
            taxe: ventilation.tva[cpl[0]].taxe + parseInt(cpl[1])
          });
        }); 
      }

      // // compilation des ventilations TVA
      // Object.entries(cmd.ventilation).forEach( ([k, v]) => {
      //   if (!ventilation.tva.hasOwnProperty(k)) {
      //     ventilation.tva[k] = {
      //       taux: v.taux,
      //       code: v.code,
      //       ttc: 0,
      //       ht: 0,
      //       tva: 0
      //     };
      //   }

      //   Object.assign(ventilation.tva[k], {
      //     ttc: ventilation.tva[k].ttc + v.ttc,
      //     ht: ventilation.tva[k].ht + v.ht,
      //     tva: ventilation.tva[k].tva +v.tva
      //   });

      //   // compilation du CA (ht et ttc)
      //   caht += v.ht;
      //   ca += v.ttc;
      //   cmdtotal += v.ttc;
      // });



      // compilation des moyens de paiement
      cmd.reglements.forEach( rgt => {

        let __moyen = cmd.caisse_encaissement.type==="caisse" ? rgt.moyen : rgt.moyen+"_"+cmd.caisse_encaissement.type;

        if (!ventilation.moyen.hasOwnProperty(__moyen)) {
          ventilation.moyen[__moyen] = {
            moyen: __moyen,
            valeur: 0
          };
        }
        // const __vmo = ventilation.moyen[__moyen].valeur;
        Object.assign(ventilation.moyen[__moyen], {
          valeur: Math.round(( ventilation.moyen[__moyen].valeur + rgt.valeur ) * 100) / 100
        });
        // console.log('reglements', `${__moyen} : ${__vmo} + ${rgt.valeur} = ${ventilation.moyen[__moyen].valeur}`);
        // logger.info('reglements', `${rgt.moyen} : ${__vmo} + ${rgt.valeur} = ${ventilation.moyen[rgt.moyen].valeur}`);
        
      });

      // compilation des rendus
      cmd.rendus.forEach(rnd => {

        // traitement des rendus monnaie
        if (rnd.moyen==='especes') {

          if (!ventilation.moyen.hasOwnProperty('especes')) {
            ventilation.moyen[rnd.moyen] = {
              moyen: rnd.moyen,
              valeur: 0
            };
          }
          // const __vmo = ventilation.moyen[rnd.moyen].valeur;
          Object.assign(ventilation.moyen[rnd.moyen], {
            valeur: Math.round(( ventilation.moyen[rnd.moyen].valeur - rnd.valeur) * 100 ) / 100
          });
          // console.log('rendus', `${rnd.moyen} : ${__vmo} - ${rnd.valeur} = ${ventilation.moyen[rnd.moyen].valeur}`);
          // logger.info('rendus', `${rnd.moyen} : ${__vmo} - ${rnd.valeur} = ${ventilation.moyen[rnd.moyen].valeur}`);


          // si le rendu monnaie est supérieur au montant des réglements en espèces, 
          // on déduit le rendu monnaie du fond de caisse
          // et on met à 0 les réglements en espèces
          if (ventilation.moyen.especes.valeur<0) {
            Object.assign(ventilation.moyen[rnd.moyen], {
              valeur: 0
            });
            // fond de caisse à zéro
          }

        }
        else if (rnd.moyen==='avoir') {
          __emission += Number(rnd.valeur);
        }

      });

      if (cmd.hasOwnProperty('troppercu')) {
        cmd.troppercu.forEach(tp => {
          __troppercu += Math.round(Number(tp.valeur) * 100) / 100;
        })
      }
      
      
      // compilation des vendeurs
      if (!ventilation.vendeur.hasOwnProperty(cmd.operator_encaissement.id)) {
        ventilation.vendeur[cmd.operator_encaissement.id] = {
          id: cmd.operator_encaissement.id,
          nom: cmd.operator_encaissement.nom,
          ventes: 0,
          remboursements: 0
        };
      }

      Object.assign(ventilation.vendeur[cmd.operator_encaissement.id], {
        ventes: ventilation.vendeur[cmd.operator_encaissement.id].ventes + cmdtotal,
        remboursements: 0
      });


      // compilation des caisses
      if (!ventilation.caisse.hasOwnProperty(cmd.caisse_encaissement.id)) {
        ventilation.caisse[cmd.caisse_encaissement.id] = {
          id: cmd.caisse_encaissement.id,
          nom: cmd.caisse_encaissement.nom,
          ca: 0
        };
      }

      Object.assign(ventilation.caisse[cmd.caisse_encaissement.id], {
        ca: ventilation.caisse[cmd.caisse_encaissement.id].ca + cmdtotal
      });


      // repas employés
      staffmeals += 0;
            
            

      // update de la date la plus ancienne
      if ( isBefore(new Date(cmd.createdAt), __start) ) __start = new Date(cmd.createdAt);
      if ( isAfter(new Date(cmd.createdAt), __end) ) __end = new Date(cmd.createdAt);

    });

    // numtickets
    numtickets += __filtered_cmd.length;
              
    // ticket_moyen
    ticket_moyen = numtickets===0 ? 0  : (ca/100) / numtickets;

    // logger.info('periode ticket_moyen: '+ticket_moyen.toFixed(2), ca, numtickets);
    // console.log('periode ticket_moyen: '+ticket_moyen.toFixed(2), ca, numtickets);



   // logger.info('per.fdcaisse', __fdcaisse_courant);

    return {
      periode: {
        debut: format(__start,'yyyy-MM-dd HH:mm:ss.SSS'), //startOfToday(),
        fin: format(__end,'yyyy-MM-dd HH:mm:ss.SSS'),   //endOfToday(),
        editeur: params.user,
        caisse: params.caisse,
        vendeur: params.vendeur,
        depenses: __dep,
        ventes: ca/100,
        remboursements: __remb,
        ca: ca/100,
        caht: caht/100,
        fdcaisse: __fdcaisse_courant,
        paramfdcaisse: params.fdcaisse,
        mtcaisse: params.fdcaisse + (ca/100),
        numtickets: numtickets,
        ticket_moyen: Math.round(ticket_moyen * 100) / 100,
        ventilation: ventilation,
        emission: __emission,
        troppercu: __troppercu,
        staffmeals: staffmeals
      },
      cmdtoarchive: __filtered_cmd.map(c=>c.ticketId),
      standby: __numStandby
    };

  } else {
    return {error: 'pas de commande'};
  }
}

function makeCloture(commandes, gtt, catalogue, params) {

  // récup des données
  const { periode, cmdtoarchive } = getCurrentPeriode(commandes, gtt, catalogue, params);
console.log('makeCloture', periode, cmdtoarchive);

  return {
    clotureId: params.clotureId,
    periode: periode,
    cmdtoarchive: [],
    archived: new Date(),
    reportca: params.reportca,
    comptage: params.comptage,
    ecarts: params.ecarts,
    prelevement: params.prelevement,
    archivedcommandesid: cmdtoarchive,
    cloupd: 'auto'
  }
}

function saveCloture(cloture) {
  return emit('dbCloturePersist', {cloture:cloture});
}
function setSyncedClotures(cloturesid, datetime) {
  return emit('dbClotureSetSynced', {ids:cloturesid, datetime:datetime});
}
function getCloturesToSync(limit=null) {
  return emit('dbClotureGetToSync', {limit:limit});
}


function getLast() {
  return emit('dbClotureGetLast',{});
} 
function getClotureById(id) {
  return emit('dbClotureGetCloture', {clotureId: id});
}
function getCloturesList(params) {
  return emit('dbClotureGetAll', params);
}
function getBoundedClotures(params) {
  return emit('dbClotureGetBoundedClotures', params);
}

function getGTP() {
  return emit('dbClotureGetGTP',{});
}

function updateGTP(valeur, gtpca, gtpva) {
  return emit('dbCloturePersistGTP', {
    gtpca: Number(gtpva)+Number(valeur), 
    gtpva: Number(gtpva)+Math.abs(Number(valeur))
  });
}

function getGTTicket(params, fromEnd = -1) {
  return emit('dbClotureGetGrandTotalTicket', {query:params, end:fromEnd});
}
function persistGTTicket(gtt) {
  return emit('dbCloturePersistGrandTotalTicket', gtt );
}
function getGTPeriodique(params, fromEnd = -1) {
  return emit('dbClotureGetGrandTotalPeriodique', {query:params, end:fromEnd});
}
function persistGTPeriodique(gtp) {
  return emit('dbCloturePersistGrandTotalPeriodique', gtp );
}

function getLastGTPeriodique(param) {
  return emit('dbClotureGetLastGrandTotalPeriodique', {gttype: param});
}
function getZCaisse(params, fromEnd = -1) {
  return emit('dbClotureGetZCaisse', {query:params, end:fromEnd});
}
function persistZCaisse(zdecaisse) {
  return emit('dbCloturePersistZCaisse', zdecaisse );
}

function getLastZCaisse(requete) {
  return emit('dbClotureGetLastZCaisse', requete);
}

function exportComptable(target, recap) {

  console.log('exportRecapVentilation', recap);
  
  const csvWriter = createObjectCsvWriter({
    path: target,
    header: recap.header
  });

  return csvWriter.writeRecords(recap.data);

}

function createArchiveFiscale(path, data, secret) {

  _checkDirectorySync(`${app.getPath('userData')}/archives_fiscales`)

  return new Promise((resolve, reject) => {

    const completepath = `${app.getPath('userData')}/archives_fiscales/${path}`;

    let output = fs.createWriteStream( completepath );
    // let archive = archiver('zip', {
    //   zlib: { level:9 }
    // });
    let archive = archiver('zip-encryptable', {
      zlib: { level:9 },
      forceLocalTime: true,
      password: secret
    });
    archive.pipe(output);

    console.log('createArchiveFiscale()',data);


    let datanum = 0;

    archive.on('entry', function() {
      datanum++;
      console.log('on entry', datanum, data.length)
      if (datanum===data.length) {
        console.log('archive finalize');
        archive.finalize();
      }
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve(completepath);
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });



    data.forEach(d => {
      if ( (['json', 'txt', 'csv']).includes(d.type) ) {
        archive.append(Buffer.from(d.data), {name: d.file});
      }
      else if ( 'file'===d.type ) {
        archive.file(d.data, {name: d.file});
      }
      else if ( 'dir'===d.type) {
        archive.directory(d.dir, d.dest);
      }
    });
  })

  // archive.finalize();


}

function persistArchiveFiscale(archive) {
  return emit('dbCloturePersistArchive', archive);
}
function getArchiveFiscale(params) {
  return emit('dbClotureGetArchive', params);
}

