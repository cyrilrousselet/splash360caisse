import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';

import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, parseJSON } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

import { devise } from "../../helpers/toolbox";

import { templates } from '../../constants/templates';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { commandeActions } from '../commande/commandeActions';
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

function printAvoir(payload) {
  return (dispatch, getState) => {  
    
   
    console.log('printAvoir()', payload);

    const { imprimantes, tickets } = getState().peripheralReducer;
    const { entreprise } = getState().parametresReducer.parametres;

    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template=='avoir');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id==ticket.imprimantes[0]);

    const limite = format(new Date(payload.limite), "d MMM yyyy", { locale: frLocale });


    const siret = entreprise.siret;
    const contenu = {
      // -> entreprise
      entreprise: {
        nom: String(entreprise.denomination).toUpperCase(),
        coordonnees: [ entreprise.adresse, `${entreprise.code_postal} ${String(entreprise.ville).toUpperCase()}`, entreprise.site_web ],
        fiscal: [ `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` ]
      },
      code: payload.code,
      detail: {
        limite: limite,
        valeur: `${devise(payload.valeur)} EUR`,
        client: payload.client,
      },
      strings: strings.modules.marketing.avoir.impression
    };

    peripheralServices.printTicket(imprimante, templates.avoir, contenu)
    .then(
      response => {
        console.log('print Avoir');
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_AVOIR });
  }
}

function openDrawer() {
  return (dispatch, getState) => {
    
    const { imprimantes } = getState().peripheralReducer;
    const imprimante = Object.values(imprimantes).find(imp=>imp.pardefaut);

      
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

function getAllImprimantes() {
  return dispatch => {
      dispatch({ type: peripheralActionTypes.GETALL_IMPRIMANTE_REQUEST });

      peripheralServices.getAllImprimantes()
        .then(
            users => dispatch({ type: peripheralActionTypes.GETALL_IMPRIMANTE_SUCCESS, ...users }),
            error => dispatch({ type: peripheralActionTypes.GETALL_IMPRIMANTE_FAILURE, payload: error.toString() })
        );
  }
};
function updateImprimante(payload) {
  return (dispatch, getState) => {
    dispatch({ type: peripheralActionTypes.UPDATE_IMPRIMANTE_REQUEST });

    const {printer_id, data} = payload;
    const { imprimantes } = getState().peripheralReducer;
    let imprimante = imprimantes[printer_id];

    // on ne récupère que les propriétés qui ont été mises à jour
    let updated_data = {};
    Object.entries(data).map(([key,value]) => {
      if (value) updated_data[key] = value;
    });

    imprimante = {...imprimante, ...updated_data};

    console.log('updateImprimante()', imprimante);

    peripheralServices.updateImprimante(imprimante)
      .then(
        data => {
          dispatch({ type: peripheralActionTypes.UPDATE_IMPRIMANTE_SUCCESS, ...data });
          dispatch(getAllImprimantes());
        },
        error => dispatch({ type: peripheralActionTypes.UPDATE_IMPRIMANTE_FAILURE, payload: error.toString() })
      )
  }
}
function deleteImprimante(payload) {
  return dispatch => {
    dispatch({ type: peripheralActionTypes.DELETE_IMPRIMANTE_REQUEST });

    peripheralServices.deleteImprimante(payload)
      .then(
        data => {
          dispatch({ type: peripheralActionTypes.DELETE_IMPRIMANTE_SUCCESS, ...data });
          dispatch(getAllImprimantes());
        },
        error => dispatch({ type: peripheralActionTypes.DELETE_IMPRIMANTE_FAILURE, payload: error.toString() })
      )
  }
}
function createImprimante(payload) {
  return dispatch => {
    dispatch({ type: peripheralActionTypes.CREATE_IMPRIMANTE_REQUEST });

    let updated_data = {};
    Object.entries(payload).map(([key,value]) => {
      if (value) updated_data[key] = value;
    });
    const newprinter = {...updated_data};

    peripheralServices.updateImprimante(newprinter)
      .then(
        data => {
          const { imprimante, confirm } = data;
          dispatch({ type: peripheralActionTypes.CREATE_IMPRIMANTE_SUCCESS, user: {...imprimante, printer_id:confirm.printer_id } });
          dispatch(getAllImprimantes());
        },
        error => dispatch({ type: peripheralActionTypes.CREATE_IMPRIMANTE_FAILURE, payload: error.toString() })
      )
  }
}


function getAllTickets() {
  return dispatch => {
      dispatch({ type: peripheralActionTypes.GETALL_TICKET_REQUEST });

      peripheralServices.getAllTickets()
        .then(
            users => dispatch({ type: peripheralActionTypes.GETALL_TICKET_SUCCESS, ...users }),
            error => dispatch({ type: peripheralActionTypes.GETALL_TICKET_FAILURE, payload: error.toString() })
        );
  }
};
function updateTicket(payload) {
  return (dispatch, getState) => {
    dispatch({ type: peripheralActionTypes.UPDATE_TICKET_REQUEST });

    const {ticket_id, data} = payload;
    const { tickets } = getState().peripheralReducer;
    let ticket = tickets[ticket_id];

    // on ne récupère que les propriétés qui ont été mises à jour
    let updated_data = {};
    Object.entries(data).map(([key,value]) => {
      if (value) updated_data[key] = value;
    });

    ticket = {...ticket, ...updated_data};
    console.log('updateTicket()', ticket);

     peripheralServices.updateTicket(ticket)
      .then(
        data => {
          dispatch({ type: peripheralActionTypes.UPDATE_TICKET_SUCCESS, ...data });
          dispatch(getAllTickets());
        },
        error => dispatch({ type: peripheralActionTypes.UPDATE_TICKET_FAILURE, payload: error.toString() })
      )
  }
}
function deleteTicket(payload) {
  return dispatch => {
    dispatch({ type: peripheralActionTypes.DELETE_TICKET_REQUEST });

    peripheralServices.deleteTicket(payload)
      .then(
        data => {
          dispatch({ type: peripheralActionTypes.DELETE_TICKET_SUCCESS, ...data });
          dispatch(getAllTickets());
        },
        error => dispatch({ type: peripheralActionTypes.DELETE_TICKET_FAILURE, payload: error.toString() })
      )
  }
}
function createTicket(payload) {
  return dispatch => {
    dispatch({ type: peripheralActionTypes.CREATE_TICKET_REQUEST });

    let updated_data = {};
    Object.entries(payload).map(([key,value]) => {
      if (value) updated_data[key] = value;
    });
    const newticket = {...updated_data};

    peripheralServices.updateTicket(newticket)
      .then(
        data => {
          const { ticket, confirm } = data;
          dispatch({ type: peripheralActionTypes.CREATE_TICKET_SUCCESS, user: {...ticket, ticket_id:confirm.ticket_id } });
          dispatch(getAllTickets());
        },
        error => dispatch({ type: peripheralActionTypes.CREATE_TICKET_FAILURE, payload: error.toString() })
      )
  }
}


function _getTicketsToPrint(filtre, tickets) {

  let liste;
  if (filtre=='all') {
    liste = Object.values(tickets).filter((tck) => (tck.imprimantes.length>0 && (['commande','partiel','principal']).indexOf(tck.template)!=-1));
  } else if (filtre.hasOwnProperty('templates')) {
    liste = Object.values(tickets).filter((tck) => (tck.imprimantes.length>0 && filtre.templates.indexOf(tck.template)!=-1));
  } else if (filtre.hasOwnProperty('ids')) {
    liste = Object.values(tickets).filter((tck) => (tck.imprimantes.length>0 && filtre.ids.indexOf(tck.ticket_id)!=-1));
  }

  return liste;
}



function printTicket(payload) {
  return (dispatch, getState) => {

    const state = getState();



    const cmd = state.commandeReducer.commande;
    const types = state.catalogueReducer.ingredientTypes;
    const ingredients = state.catalogueReducer.ingredients;
    const tva = state.catalogueReducer.tva;
    const { imprimantes, tickets } = state.peripheralReducer;
    const { peripheriques, entreprise } = state.parametresReducer.parametres;
    const { impression } = peripheriques;

    const caisse = cmd.caisse;
    const operateur = cmd.operator;

    let __createdAt = new Date();
    if (undefined!=cmd.createdAt) {
      __createdAt = parseJSON(cmd.createdAt);
    }
    const date = format(__createdAt, "d MMM yyyy", { locale: frLocale });
    const heure = format(__createdAt, "H:mm:ss");

    let contenu = {};
    let imprimante = {};
    let target_imprimantes = [];
    let impression_ordre = {};

    let ticket = {};

    let template = [];



    // gestion du numéro de commande (s'il en a un, sinon -> ticketId)
    let cmdnumero = cmd.ticketId;
    if (cmd.numero) {
      // si le numéro doit être affiché en hexadécimal
      if (cmd.numero.hex==true) {
        cmdnumero = cmd.numero.value.toString(16);
      }
      else {
        cmdnumero = cmd.numero.value;
      }
    }


    // récup de la liste des tickets à imprimer
    const ticketsListe = _getTicketsToPrint(payload, tickets);

    // pour chaque ticket à imprimer, on prépare les params et contenus
    ticketsListe.forEach(ticket => {

      impression_ordre = impression.find(it => it.ticket==ticket.ticket_id);
      target_imprimantes = Object.values(imprimantes).filter((imp)=>(ticket.imprimantes.indexOf(imp.printer_id)!=-1));
      imprimante = target_imprimantes[0];

      // en fonction du type de ticket demandé
      if (ticket.template==='commande') {
     
        // -> template ticket
        template = templates.commande;

        const cmdTva = {};
        let articles = [];
        let total = 0;
        let __comment = null;
        cmd.items.forEach(article => {

          let articleIngredients = [];
          total += article.quantite * article.prix;



          article.ingredients.forEach(ing => {

            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = types[ing.type].noprint.find(p=>p==ticket.ticket_id);

            // ordre du type d'ingrédient
            let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // ordre du type d'ingrédient (défini dans les paramètres)
            if (impression_ordre) {
              let __typeweight = impression_ordre.types.findIndex(t=>t==ing.type);
              if (__typeweight!=-1) __ingweight = __typeweight;
            }

            // commentaire pour l'ingrédient
            __comment = cmd.comments.find(c => c.item==article.itemid && c.ingredient==ing.ingredient)

            if (ing.fromStep!=null && !__noprint) {
              articleIngredients.push({
                qte: ing.qte,
                codetva: tva[ingredients[ing.ingredient].tva_id].code,
                nom: ing.nom,
                pu: ing.prix==0 ? '' : Number(ing.prix).toFixed(2),
                prix: ing.prix==0 ? '' : (Number(ing.prix)*ing.qte).toFixed(2),
                weight: __ingweight,
                comment: __comment ? __comment.texte : ''
              });
            }
          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);


          // commentaire pour l'article
          __comment = cmd.comments.find(c => c.item==article.itemid && c.ingredient==null);

          articles.push({
            qte: article.quantite,
            codetva: article.tva.code,
            nom: article.nom,
            pu: Number(article.prix).toFixed(2),
            prix: (Number(article.prix)*article.quantite).toFixed(2),
            ingredients: articleIngredients,
            comment: __comment ? __comment.texte : ''
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
        
        
        // commentaire pour la commande
        __comment = cmd.comments.find(c => c.item==null && c.ingredient==null);

        const commande = {
          numero: cmdnumero,
          id: cmd.ticketId,
          date: `${date} à ${heure}`,
          articles: articles,
          total: {
            total: total.toFixed(2),
            tva: cmdTva
          },
          reglements: cmd.reglements,
          rendus: cmd.rendus,
          comment: __comment ? __comment.texte : ''
        };


        const siret = entreprise.siret;

        // contenu :
        contenu = {
          // -> logo
          logo: null,
          // -> entreprise
          entreprise: {
            nom: String(entreprise.denomination).toUpperCase(),
            coordonnees: [ entreprise.adresse, `${entreprise.code_postal} ${String(entreprise.ville).toUpperCase()}`, entreprise.site_web ],
            fiscal: [ `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` ]
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
            ticketid: `T${caisse.id}-${Number(cmd.printnum)+1}`,
            printid: Number(cmd.printnum)+1,
            date: `${date} - ${heure}`
          },
          nomticket: ticket.nom,
          strings: strings.tickets.commande
        };

      }
      else if (ticket.template==="partiel") {
        
        // -> template ticket
        template = templates.partiel;

        let __comment = null;
        let articles = [];
        cmd.items.forEach(article => {

          let articleIngredients = [];

          article.ingredients.forEach(ing => {

            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = types[ing.type].noprint.find(p=>p==ticket.ticket_id);

            // ordre du type d'ingrédient
            let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // ordre du type d'ingrédient (défini dans les paramètres)
            if (impression_ordre) {
              let __typeweight = impression_ordre.types.findIndex(t=>t==ing.type);
              if (__typeweight!=-1) __ingweight = __typeweight;
            }

            // commentaire pour l'ingrédient :
            __comment = cmd.comments.find(c => c.item==article.itemid && c.ingredient==ing.ingredient);


            if (ing.fromStep!=null && !__noprint) {
              articleIngredients.push({
                qte: ing.qte,
                nom: ing.nom,
                weight: __ingweight,
                comment: __comment ? __comment.texte : ''
              });
            }
          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);

          // commentaire pour l'article :
          __comment = cmd.comments.find(c => c.item==article.itemid && c.ingredient==null);

          articles.push({
            qte: article.quantite,
            nom: article.nom,
            ingredients: articleIngredients,
            comment: __comment ? __comment.texte : ''
          });        

        });

        // commentaire pour la commande :
        __comment = cmd.comments.find(c => c.item==null && c.ingredient==null);

        const cmdcuisine = {
          numero: cmdnumero,
          id: cmd.ticketId,
          mode: cmd.mode,
          date: `${date} à ${heure}`,
          articles: articles,
          comment: __comment ? __comment.texte : ''
        };


        contenu = {
          info: {
            date: date,
            heure: heure
          },
          nomticket: ticket.nom,
          detail: cmdcuisine,
          strings: strings.tickets.cuisine
        }


      }
      else if (ticket.template==="principal") {
        

        template = templates.principal;

        let __comment = null;
        let articles = [];
        cmd.items.forEach(article => {

          let articleIngredients = [];

          article.ingredients.forEach(ing => {


            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = types[ing.type].noprint.find(p=>p==ticket.ticket_id);

            // ordre du type d'ingrédient
            let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // ordre du type d'ingrédient (défini dans les paramètres)
            if (impression_ordre) {
              let __typeweight = impression_ordre.types.findIndex(t=>t==ing.type);
              if (__typeweight!=-1) __ingweight = __typeweight;
            }

            // commentaire pour l'ingrédient :
            __comment = cmd.comments.find(c => c.item==article.itemid && c.ingredient==ing.ingredient);

            if (ing.fromStep!=null && !__noprint) {
              articleIngredients.push({
                qte: ing.qte,
                nom: ing.nom,
                weight: __ingweight,
                comment: __comment ? __comment.texte : ''
              });
            }
          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);

          // commentaire pour l'article :
          __comment = cmd.comments.find(c => c.item==article.itemid && c.ingredient==null);

          articles.push({
            qte: article.quantite,
            nom: article.nom,
            ingredients: articleIngredients,
            comment: __comment ? __comment.texte : ''
          });        

        });


        // commentaire pour la commande :
        __comment = cmd.comments.find(c => c.item==null && c.ingredient==null);


        const cmdcuisine = {
          numero: cmdnumero,
          id: cmd.ticketId,
          mode: cmd.mode,
          date: `${date} à ${heure}`,
          articles: articles,
          comment: __comment ? __comment.texte : ''
        };




        contenu = {
          info: {
            date: date,
            heure: heure
          },
          nomticket: ticket.nom,
          detail: cmdcuisine,
          strings: strings.tickets.sac
        }

      }

      peripheralServices.printTicket(target_imprimantes[0], template, contenu)
      .then(
        response => {
          console.log(response);
        }
      )
      dispatch({ type: peripheralActionTypes.PRINT_TICKET });
      if (ticket.template=='commande') {
        dispatch(commandeActions.updateCommande({...cmd, printnum: Number(cmd.printnum)+1}));
      }


    });


  }
}


function printPeriodeX(payload={}) {

  return (dispatch, getState) => {

      // -> template ticket
      const template = [
        'entreprise', 
        'periode_x'
      ];

      const { periode } = getState().clotureReducer;
      const { impression } = strings.modules.cloture;
      const { imprimantes, tickets } = getState().peripheralReducer;
      const { entreprise } = getState().parametresReducer.parametres;

      // récup des préf. du ticket et de l'imprimante correspondante
      let ticket = Object.values(tickets).find(tck=>tck.template=='cloture_x');
      let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id==ticket.imprimantes[0]);

      const { debut, fin } = periode;
      const __debut = format(debut, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
      const __fin = format(fin, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


      const __periode = {...periode, 
                 debut: __debut, 
                 fin: __fin};

      const siret = entreprise.siret;
      const contenu = {
        // -> entreprise
        entreprise: {
          nom: String(entreprise.denomination).toUpperCase(),
          coordonnees: [ entreprise.adresse, `${entreprise.code_postal} ${String(entreprise.ville).toUpperCase()}`, entreprise.site_web ],
          fiscal: [ `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` ]
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

function printCloture(payload={}) {
  return (dispatch, getState) => {  
    
    // -> template ticket
    let template = [
      'entreprise', 
      'periode_z'
    ];

    let periode = {};
    let prelevement = -1;
    if (Object.values(payload).length==0) {
      periode = getState().clotureReducer.periode;
    } else {
      periode = payload.periode;
      prelevement = payload.prelevement;
      template.push('prelevement');
    }


    console.log('printCloture()', payload);
    console.log('printCloture() tpl', template);

    const { impression } = strings.modules.cloture;
    const { imprimantes, tickets } = getState().peripheralReducer;
    const { entreprise } = getState().parametresReducer.parametres;

    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template=='cloture_z');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id==ticket.imprimantes[0]);

    const { debut, fin } = periode;
    const __debut = format(new Date(debut), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
    const __fin = format(new Date(fin), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


    const __periode = {...periode, 
                debut: __debut, 
                fin: __fin};

    const siret = entreprise.siret;
    const contenu = {
      // -> entreprise
      entreprise: {
        nom: String(entreprise.denomination).toUpperCase(),
        coordonnees: [ entreprise.adresse, `${entreprise.code_postal} ${String(entreprise.ville).toUpperCase()}`, entreprise.site_web ],
        fiscal: [ `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` ]
      },
      periode: __periode,
      prelevement: prelevement,
      strings: impression
    };

    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        console.log('print Z');
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_PERIODE_Z });
  }
}

export const peripheralActions = {
  printTest,
  printAvoir,
  openDrawer,
  closeDrawer,
  getAllImprimantes,
  updateImprimante,
  deleteImprimante,
  createImprimante,
  getAllTickets,
  updateTicket,
  deleteTicket,
  createTicket,
  printTicket,
  printPeriodeX,
  printCloture,
};