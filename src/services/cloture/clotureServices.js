import {emit} from 'eiphop';

import { startOfDay, startOfToday, endOfYesterday, isAfter, isBefore, parseJSON, differenceInMinutes, sub } from 'date-fns';

import Logger from '../../helpers/Logger';
const logger = new Logger();

export const clotureServices = {
  getCurrentPeriode,
  makeCloture,
  saveCloture,
  getClotureById,
  getCloturesList,
  setSyncedClotures,
  getCloturesToSync,
  getTodayCa
};


function getTodayCa(heure_fin, commandeslist) {

  // fin de la période précédente
  const now = new Date();
  const hfin_ar = heure_fin.split(':');
  const hfin = parseInt(hfin_ar[0]);
  const mfin = parseInt(hfin_ar[1]);
  let lastperiode_end = endOfYesterday();

  // si l'heure actuelle est > à l'heure de fin, la fin de la période précédente était ce matin
  if (differenceInMinutes(now, now.setHours(hfin,mfin))>0) {
    lastperiode_end = now.setHours(hfin,mfin);
  } else {
    lastperiode_end = sub(now, {hours: 24}).setHours(hfin,mfin);
  }

  let ca = 0;
  let numtickets = 0;

  if (commandeslist) {

    Object.values(commandeslist).forEach(cmd => {
      if (cmd.status === "confirmed") {
        // const __start = new Date(cmd.start);
        // if (__start>lastperiode_end) {
        if (cmd.createdAt>lastperiode_end) {
          ca += cmd.total;
          numtickets++;
        }
      }
    });

  }


  return {ca, numtickets};
}


function getCurrentPeriode(commandes, catalogue, params) {

 logger.log('clotureServices.getCurrentPeriode()', params);

  let __dep = 0
     ,__vnt = 0
     ,__remb = 0
     ,__ca = 0
     ,__tickets = 0
     ,__mtcaisse = 0
     ,__ventil = {vendeur:[], tva:[], moyen:[]}
     ,__numStandby = 0
     ,__fdcaisse_courant = Number(params.fdcaisse)
     ,__emission = 0
     ,__start = startOfToday()
     ,__end = startOfDay(new Date('2000-01-01'))
     ;


  const vendeurs = params.vendeurs.length>0 ? params.vendeurs.map(vnd=>vnd.id) : [];
  const caisses = params.caisses.length>0 ? params.caisses.map(csh=>csh.id) : [];
  

  // filtrage de la liste des commandes
  if (commandes) {
    let numvalid = 0;
    const __filtered_cmd = Object.values(commandes).filter(cmd => {

      let __valid = true;

      // on ne considère pas les commandes des autres centres de revenus
      if (cmd.hasOwnProperty('centre_revenu') && cmd.centre_revenu!=='restaurant') __valid = false;

      // on ne considère pas les commandes en attente annulées :
      if (cmd.status==='deleted') __valid = false;

      // si on ne récupère que les cmd non archivées (cas du Z)
      if (params.extract==='z' && cmd.archived!==undefined) __valid = false;
      if (__valid) numvalid++;

      // si une liste de vendeurs est fournie
      if (vendeurs.length>0) {
        if (!cmd.operator_encaissement || (cmd.operator_encaissement && vendeurs.indexOf(cmd.operator_encaissement.id)===-1)) __valid = false;
      } 

      // si une liste de caisse est fournie
      if (caisses.length>0) {
        if (!cmd.caisse_encaissement || (caisses.indexOf(cmd.caisse_encaissement.id)===-1)) __valid = false;
      } 
        

      // periode
      let createdAt = parseJSON(cmd.createdAt);
 //     if (params.extract==='x') {
 //       if (isAfter(createdAt, params.fin) || isBefore(createdAt, params.debut)) __valid = false;
 //     } 
 //     else if (params.extract==='z') {
      // --- /!\ on récupère aussi les commandes non clôturées des périodes précédentes (pour n'en laisser aucune)
      // (donc on invalide uniquement les commandes ultérieures)
        if (isAfter(createdAt, params.fin)) __valid = false;
 //     }

      if (__valid && cmd.status!=='confirmed') __numStandby++;

      // status
      if (cmd.status!=='confirmed') __valid = false;

    //  console.log('cmd valid='+__valid,cmd);
      return __valid;
    });

    logger.log('après deleted', numvalid, '/', Object.values(commandes).length);

    logger.log('filtererd_cmd', __filtered_cmd.length);

    // récup des différentes valeurs :
    __filtered_cmd.forEach(cmd => {
      __vnt += cmd.total;
      __remb += (cmd.remboursements) ? cmd.remboursements : 0;
      __tickets++;

      // update de la date la plus ancienne
      if ( isBefore(new Date(cmd.createdAt), __start) ) __start = new Date(cmd.createdAt);
      if ( isAfter(new Date(cmd.createdAt), __end) ) __end = new Date(cmd.createdAt);

  
      // ventilation par vendeurs
      let __vId = __ventil.vendeur.findIndex(vnd => vnd.id===cmd.operator_encaissement.id);
      
      // si le vendeur n'est pas enregistré ds la liste
      if (__vId===-1) {
        // on ajoute un objet pour le vendeur dans le tableau
        // et on récupère son index (length - 1)
        __vId = __ventil.vendeur.push({
                          id: cmd.operator_encaissement ? cmd.operator_encaissement.id : cmd.operator.id,
                          nom: cmd.operator_encaissement ? cmd.operator_encaissement.nom : cmd.operator.nom,
                          ventes: 0, remboursements: 0
                        }) - 1;
      }
      // on récupère l'objet pour le mettre à jour avec les valeurs de la commande
      const __vendeur = __ventil.vendeur[__vId];
      const { ventes, remboursements } = __ventil.vendeur[__vId];
      
      __ventil.vendeur[__vId] = {
          ...__vendeur, 
          ventes:(ventes+cmd.total), 
          remboursements:(remboursements+(cmd.remboursements?cmd.remboursements:0))
        };



      // ventilation par moyens de paiement
      cmd.reglements.forEach(rgl => {

        let __mId = __ventil.moyen.findIndex(moy => moy.moyen===rgl.moyen);

        // si le moyen de paiement n'est pas enregistré ds la liste
        if (__mId===-1) {
          // on ajoute un objet pour le moyen de paiement dans le tableau
          // et on récupère son index (length - 1)
          __mId = __ventil.moyen.push({
                            moyen: rgl.moyen,
                            valeur: 0
                          }) - 1;
        }
        // on récupère l'objet pour le mettre à jour avec les valeurs de la commande
        const __moyen = __ventil.moyen[__mId];
        const { valeur } = __ventil.moyen[__mId];

        __ventil.moyen[__mId] = {
            ...__moyen, 
            valeur:(valeur+rgl.valeur)
          };
      });


      // rendus: 
      // - monnaie (déduit de la ventilation 'espèces' si possible, sinon déduit du fond de caisse)
      // - avoirs
      cmd.rendus.forEach(rnd => {

        if (rnd.moyen==='especes') {
          
          let __mId = __ventil.moyen.findIndex(moy => moy.moyen==='especes');

          // si le moyen de paiement "espèces" n'est pas enregistré ds la liste
          if (__mId===-1) {
            // on ajoute un objet pour le moyen de paiement dans le tableau
            // et on récupère son index (length - 1)
            __mId = __ventil.moyen.push({
                              moyen: 'especes',
                              valeur: 0
                            }) - 1;
          }
          // on récupère l'objet pour le mettre à jour avec les valeurs de la commande
          const __moyen = __ventil.moyen[__mId];
          const { valeur } = __ventil.moyen[__mId];

          let __valeur_c = valeur-rnd.valeur;
          if (__valeur_c<0) {
            __ventil.moyen[__mId] = { 
              ...__moyen, 
              valeur:0
            };
            __fdcaisse_courant += Number(__valeur_c);
          } else {
            __ventil.moyen[__mId] = { 
              ...__moyen, 
              valeur:(__valeur_c)
            };
          }
        } else if (rnd.moyen==='avoir') {
          __emission += Number(rnd.valeur);
        }
      });






      // VENTILATION PAR TVA
      const cmdTva = {};
      let __modificateur = null;
      let total = 0;
      let articletotal = 0;
      cmd.items.forEach(itm => {


        const artTva = {};
        articletotal = itm.quantite * itm.prix;

        itm.ingredients.forEach(ing => {
          let artIngTva = ing.tva;
          // ajout et calcul de la tva pour l'ingrédient
          if (!artTva.hasOwnProperty(artIngTva.code)) {
            Object.defineProperty(artTva, artIngTva.code, {
              value: {taux:`${(Number.parseFloat(artIngTva.valeur)*100)} %`, montant: 0, ht: 0, ttc: 0},
              writable: true,
              enumerable: true
            });
          }


          if (ing.supplement===null || ing.supplement===undefined) logger.error('aucun supplement pour ing dans item id', itm.itemid);

          // let iht = (Number(ing.prix)*ing.qte) / (1 + Number(ing.tva.valeur));
          let iht = Number(itm.quantite * ing.supplement) / (1 + Number(artIngTva.valeur));

          artTva[artIngTva.code] = Object.assign(artTva[artIngTva.code], {
            montant: artTva[artIngTva.code].montant + (iht * Number(artIngTva.valeur)),
            ht: artTva[artIngTva.code].ht + iht,
            ttc: artTva[artIngTva.code].ttc + Number(itm.quantite * ing.supplement)
          });
        });


        __modificateur = cmd.modificateurs.find(m => m.item===itm.itemid && (m.ingredient===null || m.ingredient===undefined));
        let amodtx = 1;
        if (__modificateur) {
         // total += Number(__modificateur.valeur);

          const ispc = String(__modificateur.valeur).substr(-1,1)==='%';
          const val = Math.abs(Number(String(__modificateur.valeur).slice(0,-1)));

          // conversion du modificateur en coefficient
          amodtx = (ispc) ? (100 - val) / 100 : 1 - (val/articletotal);

          if (ispc) {
            articletotal *= (100 - val) / 100;
          } else {
            articletotal -= val;
          }
      
        }

        // modificateur au niveau de la tva pour les ingrédients de l'article
        if (__modificateur) {
          Object.keys(artTva).forEach(k => {
            artTva[k].ht *= amodtx;
            artTva[k].ttc *= amodtx;
          });
        } 


        // ajout et calcul de la tva pour l'article
        if (!cmdTva.hasOwnProperty(itm.tva.code)) {
          Object.defineProperty(cmdTva, itm.tva.code, {
            value: {taux:`${(Number.parseFloat(itm.tva.valeur)*100)} %`, montant: 0, ht: 0, ttc: 0},
            writable: true,
            enumerable: true
          });
        }

        // let ht = (Number(article.pu)*article.quantite) / (1 + Number(article.tva.valeur));
        let ht = (Number(itm.pu)*itm.quantite)*amodtx / (1 + Number(itm.tva.valeur));

        cmdTva[itm.tva.code] = Object.assign(cmdTva[itm.tva.code], {
          montant: cmdTva[itm.tva.code].montant + (ht * Number(itm.tva.valeur)),
          ht: cmdTva[itm.tva.code].ht + ht,
          ttc: cmdTva[itm.tva.code].ttc + ((Number(itm.pu)*itm.quantite)*amodtx)
        });

        // ajout des tva des ingrédients de l'article
        Object.entries(artTva).forEach(([k,v]) => {
                    
          // si le taux n'est pas listé dans les TVA
          // on l'ajoute et on lui assigne les valeurs enregistrées pour les ingrédients
          if (!cmdTva.hasOwnProperty(k)) {
            Object.defineProperty(cmdTva, k, {
              value: {taux:v.taux, montant: v.montant, ht: v.ht, ttc: v.ttc},
              writable: true,
              enumerable: true
            });

          } 
          // si le taux est déjà listé,
          // on additionne avec les valeurs enregistrées pour les ingrédients
          else {
            cmdTva[k] = Object.assign(cmdTva[k], {
              montant: cmdTva[k].montant + v.montant,
              ht: cmdTva[k].ht + v.ht,
              ttc: cmdTva[k].ttc + v.ttc
            });
          }
        });

        total += articletotal;

      });

       // modificateurs pour la commande
       __modificateur = cmd.modificateurs.find(c => (c.item===null || c.item===undefined) && (c.ingredient===null || c.ingredient===undefined));
       if (__modificateur) {
      //   total += Number(__modificateur.valeur);

         const ispc = String(cmd.modificateurs[0].valeur).substr(-1,1)==='%';
         const val = Math.abs(Number(String(cmd.modificateurs[0].valeur).slice(0,-1)));

         // conversion du modificateur en coefficient
         const modtx = (ispc) ? (100 - val) / 100 : 1 - (val/total);

         if (ispc) {
           total *= (100 - val) / 100;
         } else {
           total -= val;
         }


         // application de la réduction aux taux de tva
         Object.entries(cmdTva).forEach(([key, value])=> {
           cmdTva[key].ht *= modtx; 
           cmdTva[key].ttc *= modtx; 
         });

       } 

      let __tId = -1;
      Object.entries(cmdTva).forEach(([key,value]) => {
        __tId = __ventil.tva.findIndex(t => t.id===key);

        // si la tva n'est pas enregistrée ds la liste
        if (__tId===-1) {
          // on ajoute un objet pour le moyen de paiement dans le tableau
          // et on récupère son index (length - 1)
          __tId = __ventil.tva.push({
                        id: key,
                        taux: value.taux,
                        montant: 0,
                        ht: 0,
                        ttc: 0
                      }) - 1;
        }
        // on récupère l'objet pour le mettre à jour avec les valeurs de la commande
        const __tva = __ventil.tva[__tId];
        const { ht, montant, ttc } = __tva;

        __ventil.tva[__tId] = {
            ...__tva, 
            ht:(ht + value.ht),
            montant:(montant + value.montant),
            ttc:(ttc + value.ttc)
          };
      })
    });

    __ca = __vnt - (__remb + __dep);

    __mtcaisse = params.fdcaisse + __ca;

   // console.log('per.fdcaisse', __fdcaisse_courant);

    return {
      periode: {
        debut: __start, //startOfToday(),
        fin: __end,   //endOfToday(),
        editeur: params.user,
        caisses: params.caisses,
        vendeurs: params.vendeurs,
        depenses: __dep,
        ventes: __vnt,
        remboursements: __remb,
        ca: __ca,
        fdcaisse: __fdcaisse_courant,
        paramfdcaisse: params.fdcaisse,
        mtcaisse: __mtcaisse,
        numtickets: __tickets,
        ticket_moyen: __tickets===0 ? 0 : Math.round(__ca/__tickets),
        ventilation: __ventil,
        emission: __emission
      },
      cmdtoarchive: __filtered_cmd,
      standby: __numStandby
    };

  } else {
    return {error: 'pas de commande'};
  }
}

function makeCloture(commandes, catalogue, params) {

  // récup des données
  const { periode, cmdtoarchive } = getCurrentPeriode(commandes, catalogue, params);

  const archivedcommandesid = cmdtoarchive.map(cmd=>cmd.ticketId);

  return {
    clotureId: _newClotureId(),
    periode: periode,
    cmdtoarchive: [],
    archived: new Date(),
    comptage: params.comptage,
    prelevement: params.prelevement,
    archivedcommandesid: archivedcommandesid
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



const _newClotureId = () => {
  let __d = new Date();
  return 'clo'+__d.getTime().toString();
}
function getClotureById(id) {
  return emit('dbClotureGetCloture', {clotureId: id});
}
function getCloturesList(params) {
  return emit('dbClotureGetAll', params);
}