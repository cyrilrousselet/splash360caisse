import {emit} from 'eiphop';

import { startOfDay, startOfToday, isAfter, isBefore, endOfToday } from 'date-fns';
// import { dateBounds } from '../../helpers/toolbox';
import LodashId from 'lodash-id';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
// const logger = new Logger();

export const clotureServices = {
  getCurrentPeriode,
  makeCloture,
  saveCloture,
  getClotureById,
  getLast,
  getCloturesList,
  setSyncedClotures,
  getCloturesToSync,
  getTodayCa,
  getBoundedClotures
};



function getTodayCa(heure_fin) {

  return emit('dbCommandesGetTodayCa', {from: heure_fin});
  }

//   return {ca, numtickets};
// }

function getCurrentPeriode(commandes, catalogue, params) {

 logger.info('clotureServices.getCurrentPeriode()', commandes, params);

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
  const caisse = params.caisse || null;
  

  // filtrage de la liste des commandes
  if (commandes) {
    let numvalid = 0;
    const __filtered_cmd = Object.values(commandes).filter(cmd => {

      let __valid = true;

      // on ne considère pas les commandes des autres centres de revenus
      if (cmd.hasOwnProperty('centre_revenu') && cmd.centre_revenu!=='restaurant') __valid = false;

      // on ne considère pas les commandes en attente annulées :
      if (cmd.status==='deleted') __valid = false;

      // on ne récupère que les cmd non archivées (cas du Z)
      if (cmd.archived!==undefined && cmd.archived!==null) __valid = false;
      if (__valid) numvalid++;


      if (__valid && cmd.status!=='confirmed') __numStandby++;

      // si un vendeur est précisé
      if (vendeur) {
        if (!cmd.operator_encaissement || (cmd.operator_encaissement && vendeur.id !== cmd.operator_encaissement.id)) __valid = false;
      } 

      // si une caisse est précisée
      if (caisse) {
        if (!cmd.caisse_encaissement || (caisse.id !== cmd.caisse_encaissement.id)) __valid = false;
      } 
        

      // status
      if (cmd.status!=='confirmed') __valid = false;

    //  logger.info('cmd valid='+__valid,cmd);
      return __valid;
    });

    console.log('après deleted', numvalid, '/', Object.values(commandes).length);
    // logger.info('après deleted', numvalid, '/', Object.values(commandes).length);

    console.log('filtererd_cmd', __filtered_cmd.length);
    // logger.info('filtererd_cmd', __filtered_cmd.length);



    let ventilation = {
      moyen: {},
      tva: {},
      vendeur: {}
    };
    let ca = 0;
    let caht = 0;
    let numtickets = 0;
    let ticket_moyen = 0;







    // récup des différentes valeurs :
    __filtered_cmd.forEach(cmd => {

      let cmdtotal = 0;
      // compilation des ventilations TVA
      Object.entries(cmd.ventilation).forEach( ([k, v]) => {
        if (!ventilation.tva.hasOwnProperty(k)) {
          ventilation.tva[k] = {
            taux: v.taux,
            code: v.code,
            ttc: 0,
            ht: 0,
            tva: 0
          };
        }

        Object.assign(ventilation.tva[k], {
          ttc: ventilation.tva[k].ttc + v.ttc,
          ht: ventilation.tva[k].ht + v.ht,
          tva: ventilation.tva[k].tva +v.tva
        });

        // compilation du CA (ht et ttc)
        caht += v.ht;
        ca += v.ttc;
        cmdtotal += v.ttc;
      });



      // compilation des moyens de paiement
      cmd.reglements.forEach( rgt => {

        if (!ventilation.moyen.hasOwnProperty(rgt.moyen)) {
          ventilation.moyen[rgt.moyen] = {
            moyen: rgt.moyen,
            valeur: 0
          };
        }
        const __vmo = ventilation.moyen[rgt.moyen].valeur;
        Object.assign(ventilation.moyen[rgt.moyen], {
          valeur: Math.round(( ventilation.moyen[rgt.moyen].valeur + rgt.valeur ) * 100) / 100
        });
        console.log('reglements', `${rgt.moyen} : ${__vmo} + ${rgt.valeur} = ${ventilation.moyen[rgt.moyen].valeur}`);
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
          const __vmo = ventilation.moyen[rnd.moyen].valeur;
          Object.assign(ventilation.moyen[rnd.moyen], {
            valeur: Math.round(( ventilation.moyen[rnd.moyen].valeur - rnd.valeur) * 100 ) / 100
          });
          console.log('rendus', `${rnd.moyen} : ${__vmo} - ${rnd.valeur} = ${ventilation.moyen[rnd.moyen].valeur}`);
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
            
            

      // update de la date la plus ancienne
      if ( isBefore(new Date(cmd.createdAt), __start) ) __start = new Date(cmd.createdAt);
      if ( isAfter(new Date(cmd.createdAt), __end) ) __end = new Date(cmd.createdAt);

    });

    // numtickets
    numtickets += __filtered_cmd.length;
              
    // ticket_moyen
    ticket_moyen = numtickets===0 ? 0  : (ca/100) / numtickets;

    // logger.info('periode ticket_moyen: '+ticket_moyen.toFixed(2), ca, numtickets);
    console.log('periode ticket_moyen: '+ticket_moyen.toFixed(2), ca, numtickets);



   // logger.info('per.fdcaisse', __fdcaisse_courant);

    return {
      periode: {
        debut: __start, //startOfToday(),
        fin: __end,   //endOfToday(),
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
        ticket_moyen: ticket_moyen,
        ventilation: ventilation,
        emission: __emission,
        troppercu: __troppercu
      },
      cmdtoarchive: __filtered_cmd.map(c=>c.ticketId),
      standby: __numStandby
    };

  } else {
    return {error: 'pas de commande'};
  }
}

function makeCloture(commandes, catalogue, params) {

  // récup des données
  const { periode, cmdtoarchive } = getCurrentPeriode(commandes, catalogue, params);
console.log('makeCloture', periode, cmdtoarchive);

  return {
    clotureId: _newClotureId(),
    periode: periode,
    cmdtoarchive: [],
    archived: new Date(),
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




const _newClotureId = () => {
  return 'clo'+LodashId.createId();
}