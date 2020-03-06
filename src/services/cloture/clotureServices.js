import {emit} from 'eiphop';

import { startOfToday, endOfToday, isAfter, isBefore, parseJSON } from 'date-fns';

export const clotureServices = {
  getCurrentPeriode
};


function getCurrentPeriode(commandes, catalogue, params) {

  let __dep = 0
     ,__vnt = 0
     ,__remb = 0
     ,__ca = 0
     ,__tickets = 0
     ,__ticket_moy = 0
     ,__mtcaisse = 0
     ,__ventil = {vendeur:[], tva:[], moyen:[]}
     ;

  const vendeurs = params.vendeurs.map(vnd=>vnd.id);
  const caisses = params.caisses.map(c=>c.id);

  // filtrage de la liste des commandes
  if (commandes) {
    const __filtered_cmd = Object.values(commandes).filter(cmd => {

      let __valid = true;

      // status
      if (cmd.status!='confirmed') __valid = false;

      // si une liste de vendeurs est fournie
      if (vendeurs.length>0 && vendeurs.indexOf(cmd.operator.id)==-1) __valid = false;

      // si une liste de caisse est fournie
      if (caisses.length>0 && caisses.indexOf(cmd.caisse)==-1) __valid = false;

      // periode
      let updatedAt = parseJSON(cmd.updatedAt);
      if (isAfter(updatedAt, params.fin) || isBefore(updatedAt, params.debut)) __valid = false;

      return __valid;
    });

    // récup des différentes valeurs :
    __filtered_cmd.forEach(cmd => {
      __vnt += cmd.total;
      __remb += (cmd.remboursements) ? cmd.remboursements : 0;
      __tickets++;

      // ventilation par vendeurs
      if (!__ventil.vendeur.hasOwnProperty('v'+cmd.operator.id)) {
        __ventil.vendeur = Object.defineProperty(__ventil.vendeur, 'v'+cmd.operator.id, {
          value: {
            id: cmd.operator.id,
            nom: cmd.operator.nom,
            ventes: 0, remboursements: 0
          },
          writable: true
        });
        console.log(__ventil.vendeur);
      }
      __ventil.vendeur['v'+cmd.operator.id].ventes += cmd.total;
      __ventil.vendeur['v'+cmd.operator.id].remboursements += (cmd.remboursements) ? cmd.remboursements : 0;


      // ventilation par moyens de paiement
      cmd.reglements.forEach(rgl => {
        if (!__ventil.moyen.hasOwnProperty(rgl.moyen)) {
          __ventil.moyen = Object.defineProperty(__ventil.moyen, rgl.moyen, {
            value: {valeur: 0},
            writable: true
          });
        }
        __ventil.moyen[rgl.moyen].valeur += rgl.valeur;
      });

      // ventilation par tva
      cmd.items.forEach(itm => {
        if (!__ventil.tva.hasOwnProperty(itm.tva.id)) {
          __ventil.tva = Object.defineProperty(__ventil.tva, itm.tva.id, {
            value: {
              taux: Number(itm.tva.valeur),
              ht: 0,
              montant: 0,
              ttc: 0
            },
            writable: true
          });
        }
        let __ht = itm.prix / (1+Number(itm.tva.valeur));
        __ventil.tva[itm.tva.id].ttc += itm.prix;
        __ventil.tva[itm.tva.id].ht += __ht;
        __ventil.tva[itm.tva.id].montant += __ht * Number(itm.tva.valeur);
      });
    });

    __ca = __vnt - (__remb + __dep);

    __mtcaisse = params.fdcaisse + __ca;

    return {
      debut: startOfToday(),
      fin: endOfToday(),
      editeur: params.user,
      caisses: params.caisses,
      vendeurs: params.vendeurs,
      depenses: __dep,
      ventes: __vnt,
      remboursements: __remb,
      ca: __ca,
      fdcaisse: params.fdcaisse,
      mtcaisse: __mtcaisse,
      numtickets: __tickets,
      ticket_moyen: Math.round(__ca/__tickets),
      ventilation: __ventil
    };

  } else {
    return {error: 'pas de commande'};
  }
}