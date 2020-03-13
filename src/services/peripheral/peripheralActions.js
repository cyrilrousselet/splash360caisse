import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';

import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, parseJSON } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
const strings = new LocalizedStrings(data);

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



    const cmd = state.commandeReducer.commande;
    const types = state.catalogueReducer.ingredientTypes;
    const ingredients = state.catalogueReducer.ingredients;
    const tva = state.catalogueReducer.tva;

    const caisse = {id:'001'};
    const operateur = cmd.operator;

    let __createdAt = new Date();
    if (undefined!=cmd.createdAt) {
      __createdAt = parseJSON(cmd.createdAt);
    }
    const date = format(__createdAt, "d MMM yyyy", { locale: frLocale });
    const heure = format(__createdAt, "H:mm:ss");

    let contenu = {};

    let imprimante = {
      nom: 'POS Printer',
      connexion: 'usb',
      param: null,
      encoding: 'Cp850'
    };
    let template = [];

    // en fonction du type de ticket demandé
    if (payload=='commande') {

      // récup des infos
      // -> params imprimante
      imprimante = {
        nom: 'POS Printer',
        connexion: 'usb',
        param: null,
        encoding: 'Cp850'
      };
      // -> template ticket
      template = [
       // 'logo', 
        'entreprise', 
        'commande', 
      //  'message', 
        'legal'
      ];

      const cmdTva = {};
      let articles = [];
      let total = 0;
      cmd.items.forEach(article => {

        let articleIngredients = [];
        total += article.quantite * article.prix;

        article.ingredients.forEach(ing => {
          if (ing.fromStep!=null && types[ing.type].print.commande!=null) {
            articleIngredients.push({
              qte: ing.qte,
              codetva: tva[ingredients[ing.ingredient].tva_id].code,
              nom: ing.nom,
              pu: ing.prix==0 ? '' : Number(ing.prix).toFixed(2),
              prix: ing.prix==0 ? '' : (Number(ing.prix)*ing.qte).toFixed(2),
              weight: types[ing.type].print.commande
            });
          }
        });

        articleIngredients.sort((a,b)=>a.weight-b.weight);

        articles.push({
          qte: article.quantite,
          codetva: article.tva.code,
          nom: article.nom,
          pu: Number(article.prix).toFixed(2),
          prix: (Number(article.prix)*article.quantite).toFixed(2),
          ingredients: articleIngredients
        });
        if (!cmdTva.hasOwnProperty(article.tva.code)) {
          Object.defineProperty(cmdTva, article.tva.code, {
            value: {taux:`${Number(article.tva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
            writable: true,
            enumerable: true
          });
        }


        let ht = (Number(article.prix)*article.quantite) / (1 + Number(article.tva.valeur));

        cmdTva[article.tva.code] = Object.assign(cmdTva[article.tva.code], {
          montant: cmdTva[article.tva.code].montant + (ht * Number(article.tva.valeur)),
          ht: cmdTva[article.tva.code].ht + ht,
          ttc: cmdTva[article.tva.code].ttc + Number(article.prix)*article.quantite
        });
        

      });
      

      const commande = {
        id: cmd.ticketId,
        date: `${date} à ${heure}`,
        articles: articles,
        total: {
          total: total.toFixed(2),
          tva: cmdTva
        },
        reglements: cmd.reglements,
        rendus: cmd.rendus
      };


      // contenu :
      contenu = {
        // -> logo
        logo: null,
        // -> entreprise
        entreprise: {
          nom: 'CHICKEN STREET',
          coordonnees: [ '31, avenue Anatole France', '94600 CHOISY-LE-ROI', 'www.chickenstreet.fr' ],
          fiscal: [ '844 413 807 RCS Créteil' ]
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
        },
        strings: strings.tickets.commande
      };

    }
    else if (payload==="cuisine") {
      

      // récup des infos
      // -> params imprimante
      imprimante = {
        nom: 'Cuisine Printer',
        connexion: 'network',
        param: '192.168.182.151',
        encoding: 'Cp850'
      };
      // -> template ticket
      template = [
        'cuisine_info', 
        'cuisine_detail'
      ];



      let articles = [];
      cmd.items.forEach(article => {

        let articleIngredients = [];

        article.ingredients.forEach(ing => {
          if (ing.fromStep!=null && types[ing.type].print.cuisine!=null) {
            articleIngredients.push({
              qte: ing.qte,
              nom: ing.nom,
              weight: types[ing.type].print.cuisine
            });
          }
        });

        articleIngredients.sort((a,b)=>a.weight-b.weight);

        articles.push({
          qte: article.quantite,
          nom: article.nom,
          ingredients: articleIngredients
        });        

      });



      const cmdcuisine = {
        id: cmd.ticketId,
        mode: cmd.mode,
        date: `${date} à ${heure}`,
        articles: articles
      };




      contenu = {
        info: {
          date: date,
          heure: heure
        },
        detail: cmdcuisine,
        strings: strings.tickets.cuisine
      }


    }
    else if (payload==="sac") {
      

      // récup des infos
      // -> params imprimante
      imprimante = {
        nom: 'POS Printer',
        connexion: 'usb',
        param: null,
        encoding: 'Cp850'
      };
      // -> template ticket
      template = [
        'sac_info', 
        'sac_detail'
      ];



      let articles = [];
      cmd.items.forEach(article => {

        let articleIngredients = [];

        article.ingredients.forEach(ing => {
          if (ing.fromStep!=null && types[ing.type].print.cuisine!=null) {
            articleIngredients.push({
              qte: ing.qte,
              nom: ing.nom,
              weight: types[ing.type].print.cuisine
            });
          }
        });

        articleIngredients.sort((a,b)=>a.weight-b.weight);

        articles.push({
          qte: article.quantite,
          nom: article.nom,
          ingredients: articleIngredients
        });        

      });



      const cmdcuisine = {
        id: cmd.ticketId,
        mode: cmd.mode,
        date: `${date} à ${heure}`,
        articles: articles
      };




      contenu = {
        info: {
          date: date,
          heure: heure
        },
        detail: cmdcuisine,
        strings: strings.tickets.sac
      }


    }



    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        console.log(response);
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_TICKET });
  }
}


function printPeriodeX(payload={}) {

  return (dispatch, getState) => {

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
        'entreprise', 
        'periode_x'
      ];

      const {periode} = getState().clotureReducer;
      const {impression} = strings.modules.cloture;

      const {debut, fin} = periode;
      const __debut = format(debut, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
      const __fin = format(fin, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


      const __periode = {...periode, 
                 debut: __debut, 
                 fin: __fin};

      const contenu = {
        // -> entreprise
        entreprise: {
          nom: 'CHICKEN STREET',
          coordonnees: [ '31, avenue Anatole France', '94600 CHOISY-LE-ROI', 'www.chickenstreet.fr' ],
          fiscal: [ '844 413 807 RCS Créteil' ]
        },
        periode: __periode,
        strings: impression
      };

    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        console.log('print X');
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_PERIODE_X });

  }
}

export const peripheralActions = {
  printTest,
  printTicket,
  printPeriodeX,
  openDrawer,
  closeDrawer
};