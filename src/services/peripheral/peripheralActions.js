import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';

import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, parseJSON } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

import {templates} from '../../constants/templates';

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

    // liste des tickets à imprimer
    let ticketsToPrint = {};


    const cmd = state.commandeReducer.commande;
    const types = state.catalogueReducer.ingredientTypes;
    const catalogue = state.catalogueReducer.catalogue;
    const ingredients = state.catalogueReducer.ingredients;
    const tva = state.catalogueReducer.tva;
    const imprimantes = state.peripheralReducer.imprimantes;
    const tickets = state.peripheralReducer.tickets;


    const defaultprinter = Object.values(imprimantes).find(imp=>imp.default);

    // applatit la liste des produits dans un même objet
    const allproducts = {};
    for (let [catid, cat] of Object.entries(catalogue)) {
      cat.produits.forEach(prd => {
        Object.defineProperty(allproducts, prd.id, {
          value: prd.print || cat.print,  // <-- si le produit a une propriété d'impression, celle-ci est prioritaire sur celle de sa catégorie
          writable: false,
          enumerable: true
        });
      });
    }

    console.log(allproducts);

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


    const cmdTva = {};
    let total = 0;

    // pour chaque item de la commande
    cmd.items.forEach(article => {

      // calcul du prix total
      total += article.quantite * article.prix;


      // on récupère la liste des tickets sur lesquels il doit être imprimé
      allproducts[article.produitid].forEach(tick => {

        // si le ticket n'est pas encore défini dans la liste des tickets à imprimer...
        if (!ticketsToPrint.hasOwnProperty(tick.ticket)) {

          const options = {
            nom: tickets[tick.ticket].nom,
            id: `t${new Date().getTime()}`,
            template: tickets[tick.ticket].template,
            templatelist: templates[tickets[tick.ticket].template],
            imprimantes: [],
            contenu: {},
            commande: {
              id: cmd.ticketId,
              date: `${date} à ${heure}`,
              articles: [],
              total: {},
              reglements: cmd.reglements,
              rendus: cmd.rendus
            }
          };

          tickets[tick.ticket].imprimantes.forEach(imp => {
            options.imprimantes.push({...imprimantes[imp]});
          });

          Object.defineProperty(ticketsToPrint, tick.ticket, {
            value: options,
            writable: true,
            enumerable: true
          });
        }

        // on ajoute les articles dans la liste du ticket : 
        let articleIngredients = [];

        article.ingredients.forEach(ing => {

          // définit si l'ingrédient doit être présent sur le ticket
          let __onticket = types[ing.type].print.find(p=>p.ticket==tick.ticket);

          if (ing.fromStep!=null && __onticket!=undefined) {
            articleIngredients.push({
              qte: ing.qte,
              codetva: tva[ingredients[ing.ingredient].tva_id].code,
              nom: ing.nom,
              pu: ing.prix==0 ? '' : Number(ing.prix).toFixed(2),
              prix: ing.prix==0 ? '' : (Number(ing.prix)*ing.qte).toFixed(2),
              weight: __onticket.weight
            });
          }
        }); // -- end boucle des ingrédients de l'article
  
        // on organise les ingrédients en fonction de la règle établie pour le ticket
        articleIngredients.sort((a,b)=>a.weight-b.weight);
  
        ticketsToPrint[tick.ticket].commande.articles.push({
          qte: article.quantite,
          codetva: article.tva.code,
          nom: article.nom,
          pu: Number(article.prix).toFixed(2),
          prix: (Number(article.prix)*article.quantite).toFixed(2),
          ingredients: articleIngredients,
          weight: tick.weight
        });
          
      }); // -- end boucle tickets (sur lesquels doit être imprimé l'article)


      // récupération des infos de TVA à partir des articles

      // si la tva de l'article n'a pas encore été référencée...
      if (!cmdTva.hasOwnProperty(article.tva.code)) {
        Object.defineProperty(cmdTva, article.tva.code, {
          value: {taux:`${Number(article.tva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
          writable: true,
          enumerable: true
        });
      }

      // calcul du montant HT
      let ht = (Number(article.prix)*article.quantite) / (1 + Number(article.tva.valeur));

      // mise à jour des valeurs de TVA
      cmdTva[article.tva.code] = Object.assign(cmdTva[article.tva.code], {
        montant: cmdTva[article.tva.code].montant + (ht * Number(article.tva.valeur)),
        ht: cmdTva[article.tva.code].ht + ht,
        ttc: cmdTva[article.tva.code].ttc + Number(article.prix)*article.quantite
      });

    }); // -- end boucle articles

    // pour chaque ticket...
    for (let [key, val] of Object.entries(ticketsToPrint)) {
      // attribution des valeurs compilées de TVA et de montant total
      ticketsToPrint[key].commande.total = {
        total: total.toFixed(2),
        tva: cmdTva
      };
      // on organise les articles en fonction de la règle établie pour le ticket
      ticketsToPrint[key].commande.articles.sort((a,b)=>a.weight-b.weight);


      

      // en fonction du type de ticket demandé...

      if (val.template=='commande') {

        // contenu :
        ticketsToPrint[key].contenu = {
          // -> logo
          logo: null,
          // -> entreprise
          entreprise: {
            nom: 'CHICKEN STREET',
            coordonnees: [ '31, avenue Anatole France', '94600 CHOISY-LE-ROI', 'www.chickenstreet.fr' ],
            fiscal: [ '844 413 807 RCS Créteil' ]
          },
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
            mode: cmd.mode,
            date: `${date} - ${heure}`
          },
          strings: strings.tickets.commande
        };

      }


      if (val.template==="partiel") {

        ticketsToPrint[key].contenu = {
          info: {
            date: date,
            heure: heure
          },
          detail: {
            id: cmd.ticketId,
            mode: cmd.mode,
            date: `${date} à ${heure}`,
          },
          strings: strings.tickets.cuisine
        }

      }
      
      
      if (val.template==="principal") {


        ticketsToPrint[key].contenu = {
          info: {
            date: date,
            heure: heure
          },
          detail: {
            id: cmd.ticketId,
            mode: cmd.mode,
            date: `${date} à ${heure}`,
          },
          strings: strings.tickets.sac
        }
        
      }

    }


    console.log(ticketsToPrint);



    peripheralServices.printTicket(ticketsToPrint, defaultprinter)
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