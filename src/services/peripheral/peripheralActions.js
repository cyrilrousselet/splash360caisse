import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';

import 'date-fns';
import { format, parseJSON } from "date-fns";
import frLocale from "date-fns/locale/fr";

import { devise } from "../../helpers/toolbox";

import { templates } from '../../constants/templates';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { commandeActions } from '../commande/commandeActions';
import { remove } from 'diacritics';
import { lowerCase } from 'lodash';
import Logger from '../../helpers/Logger';
const logger = new Logger();
const removeDiacritics = remove;
const strings = new LocalizedStrings(data);

function printTest(payload) {
  return dispatch => {
    peripheralServices.printTest()
    .then(
      response => {
        logger.log(response);
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_TEST });
  }
}

function printAvoir(payload) {
  return (dispatch, getState) => {  
    
   
    logger.log('printAvoir()', payload);

    const { imprimantes, tickets } = getState().peripheralReducer;
    const { entreprise } = getState().parametresReducer.parametres;

    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template==='avoir');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

    const limite = format(new Date(payload.limite), "d MMM yyyy", { locale: frLocale });


    const siret = entreprise.siret;
    const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';
    const contenu = {
      // -> entreprise
      entreprise: {
        nom: String(entreprise.denomination).toUpperCase(),
        coordonnees: [ entreprise.adresse, `${entreprise.code_postal} ${String(entreprise.ville).toUpperCase()}`, entreprise.telephone, entreprise.site_web ],
        fiscal: [ siret_formatted ]
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
        logger.log('print Avoir');
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
    Object.entries(data).forEach(([key,value]) => {
      if (value) updated_data[key] = value;
    });

    imprimante = {...imprimante, ...updated_data};

    logger.log('updateImprimante()', imprimante);

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
    Object.entries(payload).forEach(([key,value]) => {
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
    Object.entries(data).forEach(([key,value]) => {
      if (value!==null) updated_data[key] = value;
    });

    ticket = {...ticket, ...updated_data};
    logger.log('updateTicket()', ticket);

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
    Object.entries(payload).forEach(([key,value]) => {
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

  logger.log('_getTicketsToPrint',filtre);

  let liste;
  if (filtre==='all') {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && (['commande','partiel','principal','etiquette']).indexOf(tck.template)>-1));
  } else if (filtre==='production') {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && (['partiel','principal','etiquette']).indexOf(tck.template)>-1));
  } else if (filtre==='all_uber') {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && (['uber','partiel','principal','etiquette']).indexOf(tck.template)>-1));
  } else if (filtre.hasOwnProperty('templates')) {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && filtre.templates.indexOf(tck.template)>-1));
  } else if (filtre.hasOwnProperty('ids')) {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && filtre.ids.indexOf(tck.ticket_id)>-1));
  }

  return liste;
}


function printTicket(payload) {
//function printCommandeTicket(payload) {
  return (dispatch, getState) => {

    const state = getState();

    const cmd = state.commandeReducer.commande;
    dispatch(printCommandeTicket(payload, cmd));
  }
}


function _getProduit(id, catalogue) {
  let produit = {};
  Object.values(catalogue).forEach(grp => {
    const p = grp.produits.find(p=>p.id===id);
    if (p!==undefined) {
      produit = p;
      return;
    }
  });
  return produit;
}

function _getRecap(tickets, commande, catalogue, types, ingredients) {
  const recap = tickets.map(ticket => {

    let tck = {nom: ticket.nom, num:0};

    commande.items.forEach(article => {

      let __ingnum = 0;
      let __ingasprdnum = 0;
      article.ingredients.forEach(ing => {
        // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
        const ingnoprint = ingredients[ing.ingredient].noprint!=null ? ingredients[ing.ingredient].noprint : types[ing.type].noprint;
        let __noprint = ingnoprint.find(p=>p===ticket.ticket_id);
        // on comptabilise le nbre d'ingrédients imprimables provenant d'une personnalisation
        // on ne compte pas les ingrédients de composition, parce qu'on compte les produits
        __ingnum += (ing.fromStep!==null && !__noprint && !ingredients[ing.ingredient].asproduct) ? ing.qte * article.quantite : 0;
        // si l'ingrédient doit s'afficher comme un produit
        __ingasprdnum += (!__noprint && ingredients[ing.ingredient].asproduct) ? ing.qte * article.quantite : 0;
      });

      const prd = _getProduit(article.produitid, catalogue);
      const prdnoprint = prd.noprint!=null ? prd.noprint : catalogue[prd.groupe].noprint;
      // si le groupe de produits ne doit pas s'imprimer sur ce ticket
      let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);

      // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur ce ticket
      let __noprintableingredient = (article.ingredients.length>0 && __ingnum===0);
      

      // if (!__noprintableingredient && (!__anoprint || (__anoprint && __ingnum>0))) {
      if (!__noprintableingredient && !__anoprint) {
        // tck.num += __ingnum>0 ? __ingnum : article.quantite;        
        tck.num += article.quantite;        
      }

      // ajout du nombre d'ingrédients à afficher comme produits
      tck.num += __ingasprdnum;

    });
    return tck;
  });
  return recap;
}


function printCommandeTicket(quelstickets, cmd) {
  return (dispatch, getState) => {

    const state = getState();

    logger.time('printCommandeTicket()');


   // const cmd = state.commandeReducer.commande;
    const types = state.catalogueReducer.ingredientTypes;
    const ingredients = state.catalogueReducer.ingredients;
    const {catalogue, steps} = state.catalogueReducer;
    const { imprimantes, tickets } = state.peripheralReducer;
    const { peripheriques, entreprise, options } = state.parametresReducer.parametres;
  //  const { impression } = peripheriques;
    const { clients } = state.clientsReducer;


    logger.log(cmd);
    // logger.log(clients);

    const caisse = cmd.caisse;
    const operateur = cmd.operator;

    const logo = entreprise.ticket_logo || null;

    let __createdAt = new Date();
    if (undefined!==cmd.createdAt) {
      __createdAt = parseJSON(cmd.createdAt);
    }
    const date = format(__createdAt, "d MMM yyyy", { locale: frLocale });
    const heure = format(__createdAt, "H:mm:ss");

    let contenu = {};
    let target_imprimantes = [];
  //  let impression_ordre = {};

    let ticket = {};

    let template = [];



    // gestion du numéro de commande (s'il en a un, sinon -> ticketId)
    let cmdnumero = cmd.ticketId;
    if (cmd.numero) {
      // si le numéro doit être affiché en hexadécimal
      if (cmd.numero.hex===true) {
        cmdnumero = cmd.numero.value.toString(16);
      }
      else {
        cmdnumero = cmd.numero.value;
      }
    }


    // récup de la liste des tickets à imprimer
    const ticketsListe = _getTicketsToPrint(quelstickets, tickets);
    const ticketsKDS = ticketsListe.filter(t => (['partiel', 'principal']).indexOf(t.template)>-1 && (t.kds!==undefined && t.kds===true));
    const recapTickets = _getRecap(ticketsListe.filter(t => 'partiel' === t.template), cmd, catalogue, types, ingredients);

    logger.log('ticketsListe', ticketsListe);

    // y a-t-il KDS d'activé pour un des ticket de la liste ?
    const withKds = ticketsKDS.length>0;
    if (withKds) {

      const kds_url = options.role==='secondary' ? (peripheriques.kdsurl || options.primary) : (peripheriques.kdsurl || 'http://localhost');
      const clt = cmd.client ? clients.find(c=>c.client_id===cmd.client.client_id) : null;


      let __origine = cmd.caisse.type || "caisse";
      if (lowerCase(cmd.caisse.nom).indexOf('borne')>-1) __origine = 'borne';

      const __cmt = cmd.comments.find(c => c.item==null && c.ingredient==null);


      // URL de réponse du kds : 
      // si caisse secondary : url de la primary
      // si caisse primary : caisse_ip ou à défaut localhost
      const __responseurl = options.role==='secondary' ? options.primary : (options.caisse.url || 'http://localhost');

      let kdsCmd = {
        id: cmd.ticketId,
        label_id: (quelstickets==='all_uber') ? cmd.uber.display_id : cmdnumero,
        ticket_id: cmd.ticketId,
        origine: __origine,
        name: clt ? `${clt.prenom} ${clt.nom}`: '',
        mode: cmd.mode, // attention
        comment: __cmt ? __cmt.texte : '',
        timestamp: 1,
        status: 0,
        commande_status: cmd.status,
        endTime: '',
        careTime: '',
        items: [],
        confirmurl: __responseurl+':3300/chrono'
      }

   

      cmd.items.forEach(article => {

        let articleIngredients = [];
        let ingredientsAsProducts = [];


        const inglist = [...article.composition, ...article.ingredients];
       
       
        const prd = _getProduit(article.produitid, catalogue);

        // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket

        const prdnoprint = prd.noprint!=null ? prd.noprint : catalogue[prd.groupe].noprint;

        const zones = ticketsKDS.filter(t => (prdnoprint.length===0 || prdnoprint.find(p=>p===t.ticket_id)===undefined) );

       
        inglist.forEach((ing, ii) => {

          const ingnoprint = ingredients[ing.ingredient].noprint!=null ? ingredients[ing.ingredient].noprint : types[ing.type].noprint;
          // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
          const zonesi = ticketsKDS.filter(t => ingnoprint.length===0 || ingnoprint.find(p=>p===t.ticket_id)===undefined );
          
          // on supprime les zones qui ne sont pas dans la liste des zones du produit
          const zonesifiltred = zonesi.filter(iz => zones.find(pz => pz.ticket_id===iz.ticket_id)!==undefined);
          
          const zonesilist = zonesifiltred.map(z => {
            return {
              name: z.ticket_id, 
              status: 0, 
              handledBy: null
            }
          });

          // commentaire sur l'ingredient
          const __ingcmt = cmd.comments.find(c => c.item===article.itemid && c.ingredient===ing.ingredient);

          let __iweight = -1;
          // ordre des ingrédients : d'abord la composition puis les ingrédients dans l'ordre de leur step
          if (ing.fromStep!==null) {
            const iistep = steps[article.produitid].find(s=>s.step_id===ing.fromStep);
            if (iistep) {
              __iweight = iistep.weight;
            }
          }

        //  if (ing.fromStep!=null) {
          if (ingredients[ing.ingredient].asproduct) {
            ingredientsAsProducts.push({
              quantity: ing.qte * article.quantite,
              productName: ing.nom,
              subItems: [],
              zones: zonesilist.length>0 ? zonesilist : [],
              comment: __ingcmt ? __ingcmt.texte : ''
            });
          } else {
            articleIngredients.push({
              quantity: ing.qte * article.quantite,
              subProductName: ing.nom,
              zones: zonesilist.length>0 ? zonesilist : [],
              comment: __ingcmt ? __ingcmt.texte : '',
              weight: __iweight
            });
          }
        //  }
        });


    
       

        // si le groupe de produits ne doit pas s'imprimer sur ce ticket
        let __anoprint = catalogue[prd.groupe].noprint.find(p=>p===ticket.ticket_id);

        // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
        let __noprintableingredient =  (inglist.length>0 && articleIngredients.length===0);
 
        // commentaire sur l'article
        const __itmcmt = cmd.comments.find(c => c.item===article.itemid && (c.ingredient===null || c.ingredient===undefined));

        
        const zoneslist = zones.map(z => {
          return {
            name: z.ticket_id, 
            status: 0, 
            handledBy: null
          }
        })
        
        if (!__anoprint && !__noprintableingredient) {
          kdsCmd.items.push({
            quantity: article.quantite,
            productName: article.nom,
            subItems: articleIngredients,
            zones: zoneslist.length>0 ? zoneslist : [],
            comment: __itmcmt ? __itmcmt.texte : ''
          });        
        }
        if (ingredientsAsProducts.length>0) {
          kdsCmd.items = [...kdsCmd.items, ...ingredientsAsProducts];
        }

      });

      peripheralServices.setCommandeToKDS(kdsCmd, kds_url);

    }


    // pour chaque ticket à imprimer, on prépare les params et contenus
    const tckToPrint = ticketsListe.filter(t=>t.imprimantes.length>0);
    let noarticle = false;
    tckToPrint.forEach(ticket => {

    //  impression_ordre = impression.find(it => it.ticket===ticket.ticket_id);
      target_imprimantes = Object.values(imprimantes).filter((imp)=>(ticket.imprimantes.indexOf(imp.printer_id)>-1));
    //  let imprimante = target_imprimantes[0];

      // en fonction du type de ticket demandé

      // ticket commande et ticket UberEats
      if (['commande','uber'].indexOf(ticket.template)>-1) {
     
        // -> template ticket
        template = (ticket.template==='uber') ? templates.uber : templates.commande;

        const cmdTva = {};
        let articles = [];
        let total = 0;
        let articletotal = 0;
        let __comment = null;
        let __modificateur = null;
        cmd.items.forEach(article => {


          const artTva = {};
          let articleIngredients = [];
          articletotal = article.quantite * article.prix;
          // articletotal = Number(article.pu)*article.quantite;


          article.ingredients.forEach(ing => {

            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = types[ing.type].noprint.find(p=>p===ticket.ticket_id);

            // // ordre du type d'ingrédient
            // let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // // ordre du type d'ingrédient (défini dans les paramètres)
            // if (impression_ordre && impression_ordre.types) {
            //   let __typeweight = impression_ordre.types.findIndex(t=>t===ing.type);
            //   if (__typeweight>-1) __ingweight = __typeweight;
            // }


            let __ingweight = -1;
            // ordre des ingrédients : d'abord la composition puis les ingrédients dans l'ordre de leur step
            if (ing.fromStep!==null) {
              const iistep = steps[article.produitid].find(s=>s.step_id===ing.fromStep);
              if (iistep) {
                __ingweight = iistep.weight;
              }
            }


            // commentaire pour l'ingrédient
            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===ing.ingredient)


            // // modificateurs pour l'ingrédient
            // __modificateur = cmd.modificateurs.find(m => m.item==article.itemid && m.ingredient==null);

            // if (__modificateur) {
            //   total += Number(__modificateur.valeur);
            // }


            // let artIngTva = tva[ingredients[ing.ingredient].tva_id];
            let artIngTva = ing.tva;

            if (ing.fromStep!==null && !__noprint) {
              articleIngredients.push({
                qte: ing.qte,
                codetva: artIngTva.code,
                nom: removeDiacritics(ing.nom),
                pu: ing.prix===0 ? '' : Number(ing.prix).toFixed(2),
                // prix: ing.prix==0 ? '' : (Number(ing.prix)*ing.qte).toFixed(2),
                prix: ing.supplement===0 ? '' : Number(ing.supplement).toFixed(2),
                weight: __ingweight,
                comment: __comment ? removeDiacritics(__comment.texte) : '',
                modificateur: __modificateur ? __modificateur.valeur: 0
              });
            }

         //   articletotal += Number(ing.supplement);


            // // ajout et calcul de la tva pour l'ingrédient
            // if (!cmdTva.hasOwnProperty(artIngTva.code)) {
            //   Object.defineProperty(cmdTva, artIngTva.code, {
            //     value: {taux:`${Number(artIngTva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
            //     writable: true,
            //     enumerable: true
            //   });
            // }

            // ajout et calcul de la tva pour l'ingrédient
            if (!artTva.hasOwnProperty(artIngTva.code)) {
              Object.defineProperty(artTva, artIngTva.code, {
                value: {taux:`${Number(artIngTva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
                writable: true,
                enumerable: true
              });
            }

            // let iht = (Number(ing.prix)*ing.qte) / (1 + Number(artIngTva.valeur));
            let iht = Number(ing.supplement) / (1 + Number(artIngTva.valeur));

            artTva[artIngTva.code] = Object.assign(artTva[artIngTva.code], {
              montant: artTva[artIngTva.code].montant + (iht * Number(artIngTva.valeur)),
              ht: artTva[artIngTva.code].ht + iht,
              ttc: artTva[artIngTva.code].ttc + Number(ing.supplement)
            });

            // logger.log('iht','(Number('+ing.prix+')*'+ing.qte+') / (1 + Number('+artIngTva.valeur+'))');
            // logger.log(JSON.stringify(cmdTva));
            

          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);


          // commentaire pour l'article
          __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);

        // 
          // modificateurs pour l'article
          __modificateur = cmd.modificateurs.find(m => m.item===article.itemid && m.ingredient===null);
          let amodtx = 1;
          let __montant = 0;
          if (__modificateur) {
           // total += Number(__modificateur.valeur);

            const ispc = String(__modificateur.valeur).substr(-1,1)==='%';
            const val = Math.abs(Number(String(__modificateur.valeur).slice(0,-1)));
            __montant = ispc ? articletotal*(val/100) : val;

            // conversion du modificateur en coefficient
            amodtx = (ispc) ? (100 - val) / 100 : 1 - (val/articletotal);

            if (ispc) {
              articletotal *= (100 - val) / 100;
            } else {
              articletotal -= val;
            }
        
          }
        
          articles.push({
            qte: article.quantite,
            codetva: article.tva.code,
            nom: removeDiacritics(article.nom),
            pu: Number(article.pu).toFixed(2),
            prix: articletotal.toFixed(2),
            ingredients: articleIngredients,
            comment: __comment ? removeDiacritics(__comment.texte) : '',
            modificateur: __modificateur ? {valeur: __modificateur.valeur, montant: __montant} : null
          });


          // modificateur au niveau de la tva pour les ingrédients de l'article
          if (__modificateur) {
            Object.keys(artTva).forEach(k => {
              artTva[k].ht *= amodtx;
              artTva[k].ttc *= amodtx;
            });
          } 

          // ajout et calcul de la tva pour l'article
          if (!cmdTva.hasOwnProperty(article.tva.code)) {
            Object.defineProperty(cmdTva, article.tva.code, {
              value: {taux:`${Number(article.tva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
              writable: true,
              enumerable: true
            });
          }

          // let ht = (Number(article.pu)*article.quantite) / (1 + Number(article.tva.valeur));
          let ht = (Number(article.pu)*article.quantite)*amodtx / (1 + Number(article.tva.valeur));

          cmdTva[article.tva.code] = Object.assign(cmdTva[article.tva.code], {
            montant: cmdTva[article.tva.code].montant + (ht * Number(article.tva.valeur)),
            ht: cmdTva[article.tva.code].ht + ht,
            ttc: cmdTva[article.tva.code].ttc + ((Number(article.pu)*article.quantite)*amodtx)
          });

          // if (__modificateur) {
          //   cmdTva[article.tva.code].ht *= amodtx;
          //   cmdTva[article.tva.code].ttc *= amodtx;
          // }   
          

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
          

          // logger.log('iht','(Number('+article.pu+')*'+article.quantite+') / (1 + Number('+article.tva.valeur +'))');
          // logger.log(JSON.stringify(cmdTva));
          total += articletotal;
        });
        
        
        // commentaire pour la commande
        __comment = cmd.comments.find(c => c.item===null && c.ingredient===null);

        // modificateurs pour la commande
        __modificateur = cmd.modificateurs.find(c => c.item===null && c.ingredient===null);
        if (__modificateur) {
       //   total += Number(__modificateur.valeur);

          const ispc = String(__modificateur.valeur).substr(-1,1)==='%';
          const val = Math.abs(Number(String(__modificateur.valeur).slice(0,-1)));
          const montant = ispc ? total*(val/100) : val;

          __modificateur = {...__modificateur, montant: montant};

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

        const commande = {
          numero: cmdnumero,
          id: cmd.ticketId,
          date: removeDiacritics(`${date} à ${heure}`),
          articles: articles,
          total: {
            total: total.toFixed(2),
            tva: cmdTva
          },
          status: cmd.status,
          mode: cmd.mode,
          bipper: cmd.bipper || null,
          reglements: cmd.reglements,
          rendus: cmd.rendus,
          comment: __comment ? __comment.texte : '',
          modificateur: __modificateur ? {valeur: __modificateur.valeur, montant: __modificateur.montant} : null,
          client: cmd.client && clients.find(c=>c.client_id===cmd.client.client_id)
        };


        const siret = entreprise.siret;
        const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';

        // contenu :
        contenu = {
          // -> logo
          logo: logo,
          // -> entreprise
          entreprise: {
            nom: removeDiacritics(String(entreprise.denomination).toUpperCase()),
            coordonnees: [ removeDiacritics(entreprise.adresse), `${entreprise.code_postal} ${removeDiacritics(String(entreprise.ville).toUpperCase())}`, entreprise.telephone, entreprise.site_web ],
            fiscal: [ siret_formatted ]
          },
          // -> commande (id, date, articles, remises, totaux, tva, réglements)
          commande: commande,
          // -> message
          message: [ 'Notre restaurant est ouvert', 'Du lundi au samedi', 'De 11h à 14h et de 18h à 22h30', 'Et le dimanche', 'de 18h à 22h30', 'MERCI ET BON APPÉTIT !' ],
          // -> infos légales (type d'opération, code vendeur, code caisse, code centre profit, code opération, version logiciel)
          // et infos ticket : numéro ticket, date
          legal: {
            type: 'VENTE',
            vendeur: removeDiacritics(operateur.nom)+' - '+operateur.id,
            caisse: caisse.id,
            centre: 'Rest.01',
            version: '0.1.0',
            ticketid: `T${caisse.id}-${Number(cmd.printnum)+1}`,
            printid: Number(cmd.printnum)+1,
            date: `${date} - ${heure}`
          },
          nomticket: ticket.nom,
          strings: {commande: strings.tickets.commande, uber: strings.tickets.uber}
        };


        if (ticket.template==='uber') {
          contenu = {...contenu, uber: cmd.uber};
        }

      }
      else if (ticket.template==="partiel") {
        
        // -> template ticket
        template = templates.partiel;

        let __comment = null;
        let articles = [];
        cmd.items.forEach(article => {

          let articleIngredients = [];
          let ingredientsAsProducts = [];


          const inglist = [...article.composition, ...article.ingredients];


          inglist.forEach(ing => {

            const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : types[ing.type].noprint;

            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = ingnoprint.find(p=>p===ticket.ticket_id);

            // // ordre du type d'ingrédient
            // let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // // ordre du type d'ingrédient (défini dans les paramètres)
            // if (impression_ordre && impression_ordre.types) {
            //   let __typeweight = impression_ordre.types.findIndex(t=>t===ing.type);
            //   if (__typeweight>-1) __ingweight = __typeweight;
            // }


            let __ingweight = -1;
            // ordre des ingrédients : d'abord la composition puis les ingrédients dans l'ordre de leur step
            if (ing.fromStep!==null) {
              const iistep = steps[article.produitid].find(s=>s.step_id===ing.fromStep);
              if (iistep) {
                __ingweight = iistep.weight;
              }
            }

            // commentaire pour l'ingrédient :
            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===ing.ingredient);


            if (!__noprint) {
              if (ingredients[ing.ingredient].asproduct) {
                ingredientsAsProducts.push({
                    qte: ing.qte * article.quantite,
                    nom: removeDiacritics(ing.nom),
                    ingredients: [],
                    comment: __comment ? removeDiacritics(__comment.texte) : ''
                });
              } else {
                articleIngredients.push({
                  qte: ing.qte * article.quantite,
                  nom: removeDiacritics(ing.nom),
                  weight: __ingweight,
                  comment: __comment ? removeDiacritics(__comment.texte) : ''
                });
              }
            }
          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);

          // commentaire pour l'article :
          __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);


          const prd = _getProduit(article.produitid, catalogue);
          const prdnoprint = prd.noprint!=null ? prd.noprint : catalogue[prd.groupe].noprint;
          // si le groupe de produits ne doit pas s'imprimer sur ce ticket
          let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);

          // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
          let __noprintableingredient =  (inglist.length>0 && articleIngredients.length===0);
          
          // si le groupe doit s'imprimer sur ce ticket
          // ou si au moins un de ses ingrédients doit s'imprimer sur ce ticket
          // on ajoute ce produit à la liste à imprimer
          // if (!__noprintableingredient && (!__anoprint || (__anoprint && articleIngredients.length>0))) {
          if (!__noprintableingredient && !__anoprint) {
            articles.push({
              qte: article.quantite,
              nom: removeDiacritics(article.nom),
              ingredients: articleIngredients,
              comment: __comment ? removeDiacritics(__comment.texte) : ''
            });        
          }
          if (ingredientsAsProducts.length>0 && !__anoprint) {
            articles = [...articles, ...ingredientsAsProducts];
          }

        });

        // commentaire pour la commande :
        __comment = cmd.comments.find(c => c.item===null && c.ingredient===null);


        // si aucun article ne s'imprime sur ce ticket, on n'imprime pas le ticket
        noarticle = (articles.length===0);

        const cmdpartiel = {
          numero: cmdnumero,
          id: cmd.ticketId,
          mode: cmd.mode,
          status: cmd.status,
          bipper: cmd.bipper || null,
          date: `${date} à ${heure}`,
          articles: articles,
          comment: __comment ? removeDiacritics(__comment.texte) : '',
          client: cmd.client && clients.find(c=>c.client_id===cmd.client.client_id)
        };


        contenu = {
          info: {
            date: date,
            heure: heure
          },
          nomticket: ticket.nom,
          detail: cmdpartiel,
          strings: strings.tickets.production
        }


      }
      else if (ticket.template==="principal") {
        
        noarticle = false;

        template = templates.principal;

        let __comment = null;
        let articles = [];
        cmd.items.forEach(article => {

          let articleIngredients = [];
          let ingredientsAsProducts = [];

       //   article.ingredients.forEach(ing => {
          const inglist = [...article.composition, ...article.ingredients];


          inglist.forEach(ing => {


            const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : types[ing.type].noprint;

            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = ingnoprint.find(p=>p===ticket.ticket_id);

            // // ordre du type d'ingrédient
            // let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // // ordre du type d'ingrédient (défini dans les paramètres)
            // if (impression_ordre && impression_ordre.types) {
            //   let __typeweight = impression_ordre.types.findIndex(t=>t===ing.type);
            //   if (__typeweight>-1) __ingweight = __typeweight;
            // }


            let __ingweight = -1;
            // ordre des ingrédients : d'abord la composition puis les ingrédients dans l'ordre de leur step
            if (ing.fromStep!==null) {
              const iistep = steps[article.produitid].find(s=>s.step_id===ing.fromStep);
              if (iistep) {
                __ingweight = iistep.weight;
              }
            }

            // commentaire pour l'ingrédient :
            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===ing.ingredient);

            if (!__noprint) {
              if (ingredients[ing.ingredient].asproduct) {
                ingredientsAsProducts.push({
                    qte: ing.qte * article.quantite,
                    nom: removeDiacritics(ing.nom),
                    ingredients: [],
                    comment: __comment ? removeDiacritics(__comment.texte) : ''
                });
              } else {
                articleIngredients.push({
                  qte: ing.qte * article.quantite,
                  nom: removeDiacritics(ing.nom),
                  weight: __ingweight,
                  comment: __comment ? removeDiacritics(__comment.texte) : ''
                });
              }
            }
          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);

          // commentaire pour l'article :
          __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);

          const prd = _getProduit(article.produitid, catalogue);
          const prdnoprint = prd.noprint!=null ? prd.noprint : catalogue[prd.groupe].noprint;

          // si le groupe de produits ne doit pas s'imprimer sur ce ticket
          let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);


          // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
          let __noprintableingredient =  (inglist.length>0 && articleIngredients.length===0);
          
          // si le groupe doit s'imprimer sur ce ticket
          // ou si au moins un de ses ingrédients doit s'imprimer sur ce ticket
          // on ajoute ce produit à la liste à imprimer
          // if (!__noprintableingredient && (!__anoprint || (__anoprint && articleIngredients.length>0))) {
          if (!__noprintableingredient && !__anoprint) {
            articles.push({
              qte: article.quantite,
              nom: removeDiacritics(article.nom),
              ingredients: articleIngredients,
              comment: __comment ? removeDiacritics(__comment.texte) : ''
            });     
          } 
          if (ingredientsAsProducts.length>0 && !__anoprint) {
            articles = [...articles, ...ingredientsAsProducts];
          }  

        });


        // commentaire pour la commande :
        __comment = cmd.comments.find(c => c.item===null && c.ingredient===null);


        const cmdprincipal = {
          numero: cmdnumero,
          id: cmd.ticketId,
          mode: cmd.mode,
          status: cmd.status,
          bipper: cmd.bipper || null,
          date: `${date} à ${heure}`,
          articles: articles,
          comment: __comment ? removeDiacritics(__comment.texte) : '',
          client: cmd.client && clients.find(c=>c.client_id===cmd.client.client_id)
        };




        contenu = {
          info: {
            date: date,
            heure: heure
          },
          nomticket: ticket.nom,
          detail: cmdprincipal,
          strings: strings.tickets.production,
          recap: recapTickets
        }

      }
      else if (ticket.template==="etiquette") {

        // -> template ticket
        template = templates.etiquette;

        let articles = [];
        cmd.items.forEach(article => {

          let articleIngredients = [];
          let ingredientsAsProducts = [];


          const inglist = [...article.composition, ...article.ingredients];


          inglist.forEach(ing => {

            const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : types[ing.type].noprint;

            // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
            let __noprint = ingnoprint.find(p=>p===ticket.ticket_id);

            // // ordre du type d'ingrédient
            // let __ingweight = Object.values(types).length + Number(types[ing.type].weight);
            // // ordre du type d'ingrédient (défini dans les paramètres)
            // if (impression_ordre && impression_ordre.types) {
            //   let __typeweight = impression_ordre.types.findIndex(t=>t===ing.type);
            //   if (__typeweight>-1) __ingweight = __typeweight;
            // }


            let __ingweight = -1;
            // ordre des ingrédients : d'abord la composition puis les ingrédients dans l'ordre de leur step
            if (ing.fromStep!==null) {
              const iistep = steps[article.produitid].find(s=>s.step_id===ing.fromStep);
              if (iistep) {
                __ingweight = iistep.weight;
              }
            }


            if (!__noprint) {
              if (ingredients[ing.ingredient].asproduct) {
                ingredientsAsProducts.push({
                    qte: ing.qte * article.quantite,
                    nom: removeDiacritics(ing.nom),
                    ingredients: []
                });
              } else {
                articleIngredients.push({
                  qte: ing.qte * article.quantite,
                  nom: removeDiacritics(ing.nom),
                  weight: __ingweight
                });
              }
            }
          });

          articleIngredients.sort((a,b)=>a.weight-b.weight);

          const prd = _getProduit(article.produitid, catalogue);
          const prdnoprint = prd.noprint!=null ? prd.noprint : catalogue[prd.groupe].noprint;
          // si le groupe de produits ne doit pas s'imprimer sur ce ticket
          let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);

          // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
          let __noprintableingredient = (inglist.length>0 && articleIngredients.length===0);
          
          // si le groupe doit s'imprimer sur ce ticket
          // ou si au moins un de ses ingrédients doit s'imprimer sur ce ticket
          // on ajoute ce produit à la liste à imprimer
          // if (!__noprintableingredient && (!__anoprint || (__anoprint && articleIngredients.length>0))) {
          if (!__noprintableingredient && !__anoprint) {
            articles.push({
              qte: article.quantite,
              nom: removeDiacritics(article.nom),
              ingredients: articleIngredients
            });        
          }
          if (ingredientsAsProducts.length>0 && !__anoprint) {
            articles = [...articles, ...ingredientsAsProducts];
          }

        });


        // si aucun article ne s'imprime sur ce ticket, on n'imprime pas le ticket
        noarticle = (articles.length===0);

        contenu = {
          numero: cmdnumero,
          mode: strings.tickets.production.mode[cmd.mode],
          date: `${format(__createdAt, "dd/MM/yyyy")} à ${heure}`,
          articles: articles
        };

      }

      if (noarticle) {
        dispatch({ type: peripheralActionTypes.NOPRINT_TICKET, template: template, reason: 'no article' });

        logger.timeEnd('printCommandeTicket()');
      } else {

        peripheralServices.printTicket(target_imprimantes[0], template, contenu)
        .then(
          response => {
            logger.timeEnd('printCommandeTicket()');
            logger.log(response);
          }
        )
        dispatch({ type: peripheralActionTypes.PRINT_TICKET });
        if (ticket.template==='commande') {
          dispatch(commandeActions.updateCommande({...cmd, printnum: Number(cmd.printnum)+1}));
        }
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

      let periode = {};
      if (Object.values(payload).length===0) {
        periode = getState().clotureReducer.periode;
      } else {
        periode = payload.periode;
      }

      const { impression } = strings.modules.cloture;
      const { imprimantes, tickets } = getState().peripheralReducer;
      const { entreprise } = getState().parametresReducer.parametres;

      // récup des préf. du ticket et de l'imprimante correspondante
      let ticket = Object.values(tickets).find(tck=>tck.template==='cloture_x');
      let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

      const { debut, fin } = periode;
      const __debut = format(debut, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
      const __fin = format(fin, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


      const __periode = {...periode, 
                 debut: __debut, 
                 fin: __fin};

      const siret = entreprise.siret;
      const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';

      const contenu = {
        // -> entreprise
        entreprise: {
          nom: removeDiacritics(String(entreprise.denomination).toUpperCase()),
          coordonnees: [ removeDiacritics(entreprise.adresse), `${entreprise.code_postal} ${removeDiacritics(String(entreprise.ville).toUpperCase())}`, entreprise.site_web ],
          fiscal: [ siret_formatted ]
        },
        periode: __periode,
        strings: impression
      };

    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        logger.log('print X');
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
    let comptage = {};
    let ecarts = {};
    let prelevement = -1;
    if (Object.values(payload).length===0) {
      periode = getState().clotureReducer.periode;
    } else {
      periode = payload.periode;
      comptage = payload.comptage;
      ecarts = payload.ecarts;
      prelevement = payload.prelevement;
      template.push('prelevement');
    }


    logger.log('printCloture()', payload);

    const { impression } = strings.modules.cloture;
    const { imprimantes, tickets } = getState().peripheralReducer;
    const { entreprise } = getState().parametresReducer.parametres;

    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template==='cloture_z');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

    const { debut, fin } = periode;
    const __debut = format(new Date(debut), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
    const __fin = format(new Date(fin), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


    const __periode = {...periode, 
                debut: __debut, 
                fin: __fin};

    const siret = entreprise.siret;
    const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';


    const contenu = {
      // -> entreprise
      entreprise: {
        nom: removeDiacritics(String(entreprise.denomination).toUpperCase()),
        coordonnees: [ removeDiacritics(entreprise.adresse), `${entreprise.code_postal} ${removeDiacritics(String(entreprise.ville).toUpperCase())}`, entreprise.site_web ],
        fiscal: [ siret_formatted ]
      },
      periode: __periode,
      prelevement: prelevement,
      comptage: comptage,
      ecarts: ecarts,
      strings: impression
    };

    logger.log('peripheralActions.printCloture contenu:', contenu);

    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        logger.log('print Z');
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_PERIODE_Z });
  }
}

function quitApp() {
  return dispatch => {
    dispatch({type: peripheralActionTypes.QUIT_APP});
    peripheralServices.quitApp();
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
  printCommandeTicket,
  printTicket,
  printPeriodeX,
  printCloture,
  quitApp
};