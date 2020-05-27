import {emit} from 'eiphop';

import { startOfToday, endOfToday, isAfter, isBefore, parseJSON } from 'date-fns';

export const clotureServices = {
  getCurrentPeriode,
  makeCloture,
  saveCloture,
  getClotureById,
  getCloturesList
};


function getCurrentPeriode(commandes, catalogue, params) {

  console.log('clotureServices.getCurrentPeriode()', params);

  let __dep = 0
     ,__vnt = 0
     ,__remb = 0
     ,__ca = 0
     ,__tickets = 0
     ,__ticket_moy = 0
     ,__mtcaisse = 0
     ,__ventil = {vendeur:[], tva:[], moyen:[]}
     ,__numStandby = 0
     ,__fdcaisse_courant = Number(params.fdcaisse)
     ,__emission = 0
     ;


  const vendeurs = params.vendeurs.length>0 ? params.vendeurs.map(vnd=>vnd.id) : [];
  const caisses = params.caisses.length>0 ? params.caisses.map(csh=>csh.id) : [];
  

  // filtrage de la liste des commandes
  if (commandes) {
    const __filtered_cmd = Object.values(commandes).filter(cmd => {

      let __valid = true;


      // on ne considère pas les commandes en attente annulées :
      if (cmd.status==='deleted') __valid = false;

      // si on ne récupère que les cmd non archivées (cas du Z)
      if (params.extract=='z' && cmd.archived!=null) __valid = false;

      // si une liste de vendeurs est fournie
      if (vendeurs.length>0 && vendeurs.indexOf(cmd.operator_encaissement.id)==-1) __valid = false;

      // si une liste de caisse est fournie
      if (caisses.length>0 && caisses.indexOf(cmd.caisse_encaissement.id)==-1) __valid = false;

      // periode
      let updatedAt = parseJSON(cmd.updatedAt);
      let createdAt = parseJSON(cmd.createdAt);
      if (params.extract=='x') {
//        if (isAfter(updatedAt, params.fin) || isBefore(updatedAt, params.debut)) __valid = false;
        if (isAfter(createdAt, params.fin) || isBefore(createdAt, params.debut)) __valid = false;
      } 
      else if (params.extract=='z') {
      // --- /!\ on récupère aussi les commandes non clôturées des périodes précédentes (pour n'en laisser aucune)
      // (donc on invalide uniquement les commandes ultérieures)
     //   if (isAfter(updatedAt, params.fin)) __valid = false;
        if (isAfter(createdAt, params.fin)) __valid = false;
      }

      if (__valid && cmd.status!='confirmed') __numStandby++;

      // status
      if (cmd.status!='confirmed') __valid = false;

    //  console.log('cmd valid='+__valid,cmd);
      return __valid;
    });

    // récup des différentes valeurs :
    __filtered_cmd.forEach(cmd => {
      __vnt += cmd.total;
      __remb += (cmd.remboursements) ? cmd.remboursements : 0;
      __tickets++;

  
      // ventilation par vendeurs
      let __vId = __ventil.vendeur.findIndex(vnd => vnd.id===cmd.operator_encaissement.id);
      
      // si le vendeur n'est pas enregistré ds la liste
      if (__vId==-1) {
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
        if (__mId==-1) {
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
          if (__mId==-1) {
            // on ajoute un objet pour le moyen de paiement dans le tableau
            // et on récupère son index (length - 1)
            __mId = __ventil.moyen.push({
                              moyen: 'espèces',
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

      // ventilation par tva
      cmd.items.forEach(itm => {


        let __tId = __ventil.tva.findIndex(t => t.id===itm.tva.id);

        // si la tva n'est pas enregistrée ds la liste
        if (__tId==-1) {
          // on ajoute un objet pour le moyen de paiement dans le tableau
          // et on récupère son index (length - 1)
          __tId = __ventil.tva.push({
                        id: itm.tva.id,
                        taux: Number(itm.tva.valeur),
                        ht: 0,
                        montant: 0,
                        ttc: 0
                      }) - 1;
        }
        // on récupère l'objet pour le mettre à jour avec les valeurs de la commande
        const __tva = __ventil.tva[__tId];
        const { ht, montant, ttc } = __ventil.tva[__tId];

        let __ht = itm.prix / (1+Number(itm.tva.valeur));

        __ventil.tva[__tId] = {
            ...__tva, 
            ht:(ht + __ht),
            montant:(montant + (__ht * Number(itm.tva.valeur))),
            ttc:(ttc + itm.prix)
          };
      });
    });

    __ca = __vnt - (__remb + __dep);

    __mtcaisse = params.fdcaisse + __ca;

    console.log('per.fdcaisse', __fdcaisse_courant);

    return {
      periode: {
        debut: startOfToday(),
        fin: endOfToday(),
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
        ticket_moyen: __tickets==0 ? 0 : Math.round(__ca/__tickets),
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
    cmdtoarchive: cmdtoarchive,
    archived: new Date(),
    comptage: params.comptage,
    prelevement: params.prelevement,
    archivedcommandesid: archivedcommandesid
  }
}

function saveCloture(cloture) {
  return emit('dbCloturePersist', {cloture:cloture});
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