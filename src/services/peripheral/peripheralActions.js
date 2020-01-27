import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';

import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

function printTest(payload) {
  return dispatch => {
    peripheralServices.printTest()
    .then(
      response => {
        console.log(response);
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_TEST });
  }
}

function openDrawer() {
  return dispatch => {

// récup des infos
      // -> params imprimante
      const imprimante = {
        nom: 'POS Printer',
        connexion: 'usb',
        param: null,
        encoding: 'Cp850'
      };

    peripheralServices.openDrawer(imprimante)
    .then(
        data => { dispatch({ type: peripheralActionTypes.OPEN_DRAWER }) }
    )
    .catch(
      error => { dispatch({ type: peripheralActionTypes.OPEN_DRAWER_FAILURE, error: error.toString() }) }
    );
  }
}

function closeDrawer() {
  return dispatch => {
    dispatch({type: peripheralActionTypes.CLOSE_DRAWER});
  }
}


function printTicket(payload) {
  return (dispatch, getState) => {

    const state = getState();

    // en fonction du type de ticket demandé
    if (payload=='commande') {

      // récup des infos
      // -> params imprimante
      const imprimante = {
        nom: 'POS Printer',
        connexion: 'usb',
        param: null,
        encoding: 'Cp850'
      };
      // -> template ticket
      const template = [
        'logo', 
        'entreprise', 
        'commande', 
        'message', 
        'legal'
      ];


      const cmd = state.commandeReducer.commande;

      const caisse = {id:'001'};
      const operateur = cmd.operator;

      const date = format(new Date(), "d MMM yyyy", { locale: this.locale });
      const heure = format(new Date(), "H:mm:ss");

      const tva = {};
      let articles = [];
      let total = 0;
      cmd.items.forEach(article => {

        total += article.quantite * article.prix;

        articles.push({
          qte: article.quantite,
          codetva: article.tva.code,
          nom: article.nom,
          pu: article.prix,
          prix: (Number(article.prix)*article.quantite).toFixed(2),
          ingredients: []
        });
        if (!tva.hasOwnProperty(article.tva.code)) {
          Object.defineProperty(tva, article.tva.code, {
            value: {taux:`${Number(article.tva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
            writable: true,
            enumerable: true
          });
        }


        let ht = (Number(article.prix)*article.quantite) / (1 + Number(article.tva.valeur));

        tva[article.tva.code] = Object.assign(tva[article.tva.code], {
          montant: tva[article.tva.code].montant + (ht * Number(article.tva.valeur)),
          ht: tva[article.tva.code].ht + ht,
          ttc: tva[article.tva.code].ttc + Number(article.prix)*article.quantite
        });
        

      });
      

      const commande = {
        id: cmd.ticketId,
        date: format(cmd.createdAt | new Date(), "d MMM yyyy à H:mm:ss", { locale: this.locale }),
        articles: articles,
        total: {
          total: total.toFixed(2),
          tva: tva
        },
        reglements: cmd.reglements,
        rendus: cmd.rendus
      };


      console.log(commande);

      // contenu :
      const contenu = {
        // -> logo
        logo: null,
        // -> entreprise
        entreprise: {
          nom: 'LE RESTAURANT',
          coordonnees: [ '5 place de la ville', '75011 PARIS', 'Tél. 01 02 03 04 05', 'E-mail : paris@le-restaurant.fr', 'www.le-restaurant.fr' ],
          fiscal: [ 'SIRET 123 456 789 00012 - CODE NAF 5610C', 'TVA FR12 123 456 789' ]
        },
        // -> commande (id, date, articles, remises, totaux, tva, réglements)
        commande: commande,
        // -> message
        message: [ 'Notre restaurant est ouvert', 'Du lundi au samedi', 'De 11h à 14h et de 18h à 22h30', 'Et le dimanche', 'de 18h à 22h30', 'MERCI ET BON APPÉTIT !' ],
        // -> infos légales (type d'opération, code vendeur, code caisse, code centre profit, code opération, version logiciel)
        // et infos ticket : numéro ticket, date
        legal: {
          type: 'VENTE',
          vendeur: operateur.nom+' - '+operateur.id,
          caisse: caisse.id,
          centre: 'Rest.01',
          version: '0.1.0',
          ticketid: `T${caisse.id}-0001`,
          printid: 1,
          date: `${date} - ${heure}`
        }
      };

     peripheralServices.printTicketCommande(imprimante, template, contenu)
      // peripheralServices.printTest()
      .then(
        response => {
          console.log(response);
        }
      )
      dispatch({ type: peripheralActionTypes.PRINT_TICKET });
    }
  }
}

export const peripheralActions = {
  printTest,
  printTicket,
  openDrawer,
  closeDrawer
};