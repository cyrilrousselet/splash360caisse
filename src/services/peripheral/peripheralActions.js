import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';
import { tresorServices } from '../tresorerie/tresorServices';

// import packageJson from '../../../package.json';

import 'date-fns';
import { format, parseJSON } from "date-fns";
import frLocale from "date-fns/locale/fr";

import { asyncForEach, devise } from "../../helpers/toolbox";

import { templates } from '../../constants/templates';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
// import { commandeActions } from '../commande/commandeActions';
import { remove } from 'diacritics';
import { last, lowerCase } from 'lodash';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import { commandeServices } from '../commande/commandeServices';
import { journalActions } from '../journal/journalActions';
// import { log } from 'winston';
// const logger = new Logger();
const removeDiacritics = remove;
const strings = new LocalizedStrings(data);

function printTest(payload) {
  return dispatch => {
    peripheralServices.printTest()
    .then(
      response => {
        logger.info(response);
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_TEST });
  }
}

function printAvoir(payload) {
  return (dispatch, getState) => {  
    
   
    logger.info('printAvoir()', payload);

    const { imprimantes, tickets } = getState().peripheralReducer;
    const { entreprise, financier } = getState().parametresReducer.parametres;

    const __isomonnaie = financier.monnaie ? financier.monnaie.iso : 'EUR';

    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template==='avoir');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

    const limite = format(new Date(payload.limite), "d MMM yyyy", { locale: frLocale });


    const siret = entreprise.siret;
   // const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';
  


    const contenu = {
      // -> entreprise
      entreprise: {
        nom: String(entreprise.denomination).toUpperCase(),
        coordonnees: [ entreprise.adresse, `${entreprise.code_postal} ${String(entreprise.ville).toUpperCase()}`, entreprise.telephone, entreprise.site_web ],
        fiscal: [ siret ]
      },
      code: payload.code,
      detail: {
        limite: limite,
        valeur: `${devise(payload.valeur)} ${__isomonnaie.toUpperCase()}`,
        client: payload.client,
      },
      strings: strings.modules.marketing.avoir.impression
    };

    peripheralServices.printTicket(imprimante, templates.avoir, contenu)
    .then(
      response => {
        logger.info('print Avoir');
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
      error => { 
        logger.error(error);
        dispatch({ type: peripheralActionTypes.OPEN_DRAWER_FAILURE, error: error.toString() }) 
      }
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

    logger.info('updateImprimante()', imprimante);

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
            tickets => dispatch({ type: peripheralActionTypes.GETALL_TICKET_SUCCESS, ...tickets }),
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
    logger.info('updateTicket()', ticket);

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

  logger.info('_getTicketsToPrint',filtre);
  logger.info(JSON.stringify(tickets,null,2));

  let liste;
  if (filtre==='all') {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && (['commande','partiel','principal','etiquette','produits']).indexOf(tck.template)>-1));
  } else if (filtre==='production') {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && (['partiel','principal','etiquette','produits']).indexOf(tck.template)>-1));
  } else if (filtre==='all_uber') {
    liste = Object.values(tickets).filter((tck) => ((tck.imprimantes.length>0 || tck.kds) && (['uber','partiel','principal','etiquette','produits']).indexOf(tck.template)>-1));
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
        const ingnoprint = ingredients[ing.ingredient].noprint!=null ? ingredients[ing.ingredient].noprint : [];
        let __noprint = ingnoprint.find(p=>p===ticket.ticket_id);
        // on comptabilise le nbre d'ingrédients imprimables provenant d'une personnalisation
        // on ne compte pas les ingrédients de composition, parce qu'on compte les produits
        __ingnum += (ing.fromStep!==null && !__noprint && !ingredients[ing.ingredient].asproduct) ? ing.qte * article.quantite : 0;
        // si l'ingrédient doit s'afficher comme un produit
        __ingasprdnum += (!__noprint && ingredients[ing.ingredient].asproduct) ? ing.qte * article.quantite : 0;
      });

      const prd = _getProduit(article.produitid, catalogue);
      const prdnoprint = prd.noprint!=null ? prd.noprint : [];
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




function _setCommandeToKDS(ticketsListe, cmd, state) {


  const { catalogue, steps, ingredients } = state.catalogueReducer;
  const { options, peripheriques } = state.parametresReducer.parametres;
  const { clients } = state.clientsReducer;

  const kds_url = options.role==='secondary' ? (peripheriques.kdsurl || options.primary) : (peripheriques.kdsurl || 'http://localhost');
  const clt = cmd.client ? clients.find(c=>c.client_id===cmd.client.client_id) : null;

  const ticketsKDS = ticketsListe.filter(t => (['partiel', 'principal', 'etiquette', 'produits']).indexOf(t.template)>-1 && (t.kds!==undefined && t.kds===true));
  
  // y a-t-il KDS d'activé pour un des ticket de la liste ?
  if (ticketsKDS.length>0) {

    let __origine = cmd.caisse.type || "caisse";
    if (lowerCase(cmd.caisse.nom).indexOf('borne')>-1) __origine = 'borne';

    const __cmt = cmd.comments.find(c => c.item==null && c.ingredient==null);

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

    // URL de réponse du kds : 
    // si caisse secondary : url de la primary
    // si caisse primary : caisse_ip ou à défaut localhost
    const __responseurl = options.role==='secondary' ? options.primary : (options.caisse.url || 'http://localhost');    

    let kdsCmd = {
      id: cmd.ticketId,
      label_id: (cmd.hasOwnProperty('uber')) ? cmd.uber.display_id : cmdnumero,
      ticket_id: cmd.ticketId,
      origine: __origine,
      name: clt ? `${clt.prenom} ${clt.nom}`: '',
      city: clt ? `${clt.ville}`: '',
      mode: cmd.mode, // attention
      comment: __cmt ? __cmt.texte : '',
      timestamp: cmd.createdAt ? cmd.createdAt : (new Date()).getTime(),
      status: 0,
      commande_status: cmd.status,
      endTime: '',
      careTime: '',
      items: [],
      lot: cmd.lot,
      timestamplot: cmd.timestamplot,
      confirmurl: __responseurl+':3300/chrono',
      printurl: __responseurl+':3300/printticket',
    }



    cmd.items.forEach(article => {

      let articleIngredients = [];
      let ingredientsAsProducts = [];


      const inglist = [...article.composition, ...article.ingredients];
    
    
      const prd = _getProduit(article.produitid, catalogue);

      // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket

      const prdnoprint = prd.noprint!=null ? prd.noprint : [];

      const zones = ticketsKDS.filter(t => (prdnoprint.length===0 || prdnoprint.find(p=>p===t.ticket_id)===undefined) );

    
      inglist.forEach((ing, ii) => {

        const ingnoprint = ingredients[ing.ingredient].noprint!=null ? ingredients[ing.ingredient].noprint : [];
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

        // couleur de l'ingrédient
        const __ingcol = options.hasOwnProperty('kds_product_color') && options.kds_product_color ? ingredients[ing.ingredient].color : '';

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
            color: __ingcol===null ? '' : __ingcol,
            productName: ing.nom,
            subItems: [],
            zones: zonesilist.length>0 ? zonesilist : [],
            comment: __ingcmt ? __ingcmt.texte : ''
          });
        } else {
          articleIngredients.push({
            quantity: ing.qte * article.quantite, 
            color: __ingcol===null ? '' : __ingcol,
            subProductName: ing.nom,
            zones: zonesilist.length>0 ? zonesilist : [],
            comment: __ingcmt ? __ingcmt.texte : '',
            weight: __iweight
          });
        }
      //  }
      });



    

      // si le groupe de produits ne doit pas s'imprimer sur ce ticket
      // let __anoprint = catalogue[prd.groupe].noprint.find(p=>p===ticket.ticket_id);

      // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
      let __noprintableingredient =  (inglist.length>0 && articleIngredients.length===0);

      // commentaire sur l'article
      const __itmcmt = cmd.comments.find(c => c.item===article.itemid && (c.ingredient===null || c.ingredient===undefined));
     
      // couleur de l'article
      const __itmcol = options.hasOwnProperty('kds_product_color') && options.kds_product_color ? prd.color : '';

      
      const zoneslist = zones.map(z => {
        return {
          name: z.ticket_id, 
          status: 0, 
          handledBy: null
        }
      })
      
      // if (!__anoprint && !__noprintableingredient) {
      if (!__noprintableingredient) {
        kdsCmd.items.push({
          quantity: article.quantite,
          productName: article.nom,
          color: __itmcol===null ? '' : __itmcol,
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
  else {
    logger.info('ordre d’impression non concerné par le KDS');
  }
}


function printTicketFromAPI(payload) {
  return async (dispatch, getState) => {

    const { ticketId, zoneId, isSortie } = payload;

    const { tickets } = getState().peripheralReducer;

    const _tck = tickets[zoneId];

    let __tickets_a_imprimer = [];

    // si c'est la fin de la production et que le ticket commande est indirect
    if (isSortie && tickets.tck1.hasOwnProperty('indirect') && tickets.tck1.indirect===true) {
      // on l'ajoute à la liste des tickets à imprimer
      __tickets_a_imprimer.push('tck1');
    }

    // si le ticket de la zone doit être imprimé via le KDS
    if (_tck.hasOwnProperty('indirect') && _tck.indirect===true) { 
      // on l'ajoute à la liste des tickets à imprimer
      __tickets_a_imprimer.push(zoneId);
    }

    if (__tickets_a_imprimer.length>0) {
      try {
        const commande = await commandeServices.getCommandeById(ticketId);
        logger.info('peripheralActions.printTicketFromAPI()', commande);
        dispatch(printCommandeTicket({ids:__tickets_a_imprimer}, commande._cmd, true));
      }
      catch(error) {
        logger.info('printTicketFromAPI', `commande #${ticketId} introuvable`);
        logger.error(error);
      }
    } else {
        logger.info('printTicketFromAPI', 'pas d’impression indirecte pour ce ticket');
      }

  }
}


function printCommandeTicket(quelstickets, cmd, nokds=false) {
  return async (dispatch, getState) => {

    const state = getState();

    // logger.time('printCommandeTicket()');


   // const cmd = state.commandeReducer.commande;
    const types = state.catalogueReducer.ingredientTypes;
    const ingredients = state.catalogueReducer.ingredients;
    const {catalogue, steps} = state.catalogueReducer;
    const { imprimantes, tickets } = state.peripheralReducer;
    const { entreprise, financier, peripheriques, options } = state.parametresReducer.parametres;
  //  const { impression } = peripheriques;
    const { clients } = state.clientsReducer;
    const {print_standby} = state.parametresReducer.parametres.commandes;

    const __monnaie = financier.monnaie || {iso:'EUR', nom:'euro', nom_pl:'euros', symbole:'€'};



    // logger.info('peripheralAction.printCommandeTicket()',cmd);
    console.log('🖨 printCommandeTicket', quelstickets, cmd);
    // logger.info(clients);

    // const caisse = cmd.caisse;
    const operateur = cmd.operator;

    const logo = entreprise.ticket_logo || null;

    let __createdAt = new Date();
    if (undefined!==cmd.createdAt) {
      __createdAt = parseJSON(cmd.createdAt);
    }
    let date = format(__createdAt, "d MMM yyyy", { locale: frLocale });
    let heure = format(__createdAt, "H:mm:ss");
    let date_alt = date;
    if (options.hasOwnProperty('secondelangue') && options.secondelangue!==null) {
      date_alt = format(__createdAt, data[options.secondelangue].params.dateformat);
    }

    let contenu = {};
    let target_imprimantes = [];
  //  let impression_ordre = {};

  
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
    const recapTickets = _getRecap(ticketsListe.filter(t => 'partiel' === t.template), cmd, catalogue, types, ingredients);

    logger.info('ticketsListe', ticketsListe);

    // envoi de la commande au serveur KDS (sauf si nokds==true)
    if (!nokds) _setCommandeToKDS(ticketsListe, cmd, state);
    


    // pour chaque ticket à imprimer, on prépare les params et contenus
    let tckToPrint = ticketsListe.filter(t=>t.imprimantes.length>0);

    // on filtre les tickets à impression indirecte (c.-à-d. déclenchée par le KDS)
    // sauf si l'impression est déclenchée par le KDS
    if (!nokds) {
      tckToPrint = tckToPrint.filter(t => !t.indirect);
      logger.info('liste de tickets à impression directe', tckToPrint);
    }

    if (tckToPrint.length===0) {
      // si la commande a déjà été persistée
      if (cmd.createdAt) {          
        
        commandeServices.persistCommande({ticketId: cmd.ticketId, enproduction: true});
      }
    } else {
      

      let noarticle = false;
      // tckToPrint.forEach(async ticket => {
      await  asyncForEach(tckToPrint, async ticket => {

      //  impression_ordre = impression.find(it => it.ticket===ticket.ticket_id);
        target_imprimantes = Object.values(imprimantes).filter((imp)=>(ticket.imprimantes.indexOf(imp.printer_id)>-1));
      //  let imprimante = target_imprimantes[0];

        // en fonction du type de ticket demandé

        // ticket commande et ticket UberEats
        if (['commande','uber','deliveroo'].indexOf(ticket.template)>-1) {


          let piece = null;
          try {
            if (cmd.status==="confirmed") {
              piece = await commandeServices.getTicket({'ENC-TIK-NUM':cmd.ticket});
            } else {
              const lastnote = last(cmd.note.split('|'));
              piece = await commandeServices.getNote({'ENC-TIK-NUM':lastnote});
            }
            piece = piece[0];
            console.log("🧾 PIECE",piece);
          }
          catch(e) {
            console.error(e);
          }
          
          // -> template ticket
          template = (ticket.template==='uber') ? templates.uber : ( (ticket.template==='deliveroo') ? templates.uber : templates.commande );
          template = [...template];
          if (options.hasOwnProperty('secondelangue') && options.secondelangue!==null) {
            // console.log('🖨 AVANT', template);
            template.splice(template.indexOf('legal') + 1, 0, 'separateur', 'commande_alt', 'legal_alt');
            // console.log('🖨 APRES', template);
          }

          // const cmdTva = {};
          let articles = [];
          // let total = 0;
          // let articletotal = 0;
          let __comment = null;
          let __modificateur = null;


          // on déplace les frais de gestion à la fin de l'array
          if (cmd.items.findIndex(e=>e.produitid==='frais')>-1) {
            cmd.items.push(cmd.items.splice(cmd.items.findIndex(e=>e.produitid==='frais'), 1)[0]);
          }
          
          cmd.items.forEach(article => {


            // const artTva = {};
            let articleIngredients = [];
            // articletotal = article.quantite * article.prix;
            // articletotal = Number(article.pu) * article.quantite;
            // let articleRemise = 0;

            article.ingredients.forEach((ing,i) => {

              // si le type d'ingrédient ne doit pas s'imprimer sur ce ticket
              // let __noprint = types[ing.type].noprint.find(p=>p===ticket.ticket_id);
              
              // si l'ingrédient ne doit pas s'imprimer sur le ticket
              let __noprint = ing.noprint != null ? ing.noprint.find(p=>p===ticket.ticket_id) : false;

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
              
              const ligne_i = piece['LIGNES'].find(l => l['ENC-TIK-ORI-NUM']===article.itemid+'-'+i);
              // let artIngTva = ing.tva;

              // articletotal += Number(ligne_i['ENC-TIK-LIG-PRO-TTC'] / 100) * ligne_i['ENC-TIK-LIG-PRO-QTE'];
              
              console.log('ligne_i', ligne_i, ing.ingredient);

              if (ing.fromStep!==null && !__noprint) {
                articleIngredients.push({
                  qte: ligne_i['ENC-TIK-LIG-PRO-QTE'],
                  codetva: ligne_i['ENC-TIK-LIG-TAX-NID'] || '',
                  nom: removeDiacritics(ligne_i['ENC-TIK-LIG-PRO-LIB']),
                  pu: ligne_i['ENC-TIK-LIG-PRO-TTC']===0 ? '' : Number(ligne_i['ENC-TIK-LIG-PRO-TTC'] / 100).toFixed(2),
                  prix: ligne_i['ENC-TIK-LIG-TOT-TTC']===0 ? '' : Number((ligne_i['ENC-TIK-LIG-PRO-TTC'] / 100) * ligne_i['ENC-TIK-LIG-PRO-QTE']).toFixed(2),
                  weight: __ingweight,
                  comment: __comment ? removeDiacritics(__comment.texte) : '',
                  // modificateur: ligne_i['ENC-TIK-LIG-REM-TOT']!==0 ? {montant: Number(ligne_i['ENC-TIK-LIG-REM-TOT'] / 100).toFixed(2), valeur: ligne_i['ENC-TIK-LIG-REM-TXX']}: 0
                  
                  // qte: ing.qte,
                  // codetva: artIngTva.code,
                  // nom: removeDiacritics(ing.nom),
                  // pu: ing.prix===0 ? '' : Number(ing.prix).toFixed(2),
                  // prix: ing.supplement===0 ? '' : Number(ing.supplement).toFixed(2),
                  // weight: __ingweight,
                  // comment: __comment ? removeDiacritics(__comment.texte) : '',
                  // modificateur: __modificateur ? __modificateur.valeur: 0
                });
                // articleRemise += Number(ligne_i['ENC-TIK-LIG-REM-TOT']);
              }


              // // ajout et calcul de la tva pour l'ingrédient
              // if (!artTva.hasOwnProperty(artIngTva.code)) {
              //   Object.defineProperty(artTva, artIngTva.code, {
              //     value: {taux:`${Number(artIngTva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
              //     writable: true,
              //     enumerable: true
              //   });
              // }

              // let iht = Number(ing.supplement) / (1 + Number(artIngTva.valeur));

              // artTva[artIngTva.code] = Object.assign(artTva[artIngTva.code], {
              //   montant: artTva[artIngTva.code].montant + (iht * Number(artIngTva.valeur)),
              //   ht: artTva[artIngTva.code].ht + iht,
              //   ttc: artTva[artIngTva.code].ttc + Number(ing.supplement)
              // });

            });

            articleIngredients.sort((a,b)=>a.weight-b.weight);


            // commentaire pour l'article
            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);
         
         
            const ligne_p = piece['LIGNES'].find(l => l['ENC-TIK-ORI-NUM']===article.itemid);

            console.log("piece['LIGNES']", piece['LIGNES']);
            console.log('ligne_p', ligne_p, article.itemid);
          
            // modificateurs pour l'article
            __modificateur = cmd.modificateurs.find(m => m.item===article.itemid && m.ingredient===null);

          
          
            articles.push({

              qte: ligne_p['ENC-TIK-LIG-PRO-QTE'],
              produitid: ligne_p['ENC-TIK-LIG-PRO-NID'],  // article.produitid,
              codetva: ligne_p['ENC-TIK-LIG-TAX-NID'] || '',
              nom: removeDiacritics(ligne_p['ENC-TIK-LIG-PRO-LIB']),
              pu: ligne_p['ENC-TIK-LIG-PRO-TTC']===0 ? '' : Number(ligne_p['ENC-TIK-LIG-PRO-TTC'] / 100).toFixed(2),
              prix: ligne_p['ENC-TIK-LIG-TOT-TTC']===0 ? '' : Number((ligne_p['ENC-TIK-LIG-PRO-TTC'] / 100) * ligne_p['ENC-TIK-LIG-PRO-QTE']).toFixed(2),
              ingredients: articleIngredients,
              comment: __comment ? removeDiacritics(__comment.texte) : '',
              // modificateur: ligne_p['ENC-TIK-LIG-REM-TOT']!==0 ? {montant: Number((ligne_p['ENC-TIK-LIG-REM-TOT'] + articleRemise) / 100).toFixed(2), valeur: ligne_p['ENC-TIK-LIG-REM-TXX']}: 0
              soustotal: article.prix.toFixed(2),
              // qte: article.quantite,
              // codetva: article.tva.code,
              // nom: removeDiacritics(article.nom),
              // pu: Number(article.pu).toFixed(2),
              // prix: articletotal.toFixed(2),
              // ingredients: articleIngredients,
              // comment: __comment ? removeDiacritics(__comment.texte) : '',
              modificateur: __modificateur ? __modificateur : null
            });


            // modificateur au niveau de la tva pour les ingrédients de l'article
            // if (__modificateur) {
            //   Object.keys(artTva).forEach(k => {
            //     artTva[k].montant *= amodtx; 
            //     artTva[k].ht *= amodtx;
            //     artTva[k].ttc *= amodtx;
            //   });
            // } 

            // // ajout et calcul de la tva pour l'article
            // if (!cmdTva.hasOwnProperty(article.tva.code)) {
            //   Object.defineProperty(cmdTva, article.tva.code, {
            //     value: {taux:`${Number(article.tva.valeur)*100} %`, montant: 0, ht: 0, ttc: 0},
            //     writable: true,
            //     enumerable: true
            //   });
            // }

            // let ht = (Number(article.pu)*article.quantite)*amodtx / (1 + Number(article.tva.valeur));

            // cmdTva[article.tva.code] = Object.assign(cmdTva[article.tva.code], {
            //   montant: cmdTva[article.tva.code].montant + (ht * Number(article.tva.valeur)),
            //   ht: cmdTva[article.tva.code].ht + ht,
            //   ttc: cmdTva[article.tva.code].ttc + ((Number(article.pu)*article.quantite)*amodtx)
            // });

            // // if (__modificateur) {
            // //   cmdTva[article.tva.code].ht *= amodtx;
            // //   cmdTva[article.tva.code].ttc *= amodtx;
            // // }   
            

            // // ajout des tva des ingrédients de l'article
            // Object.entries(artTva).forEach(([k,v]) => {
              
            //   // si le taux n'est pas listé dans les TVA
            //   // on l'ajoute et on lui assigne les valeurs enregistrées pour les ingrédients
            //   if (!cmdTva.hasOwnProperty(k)) {
            //     Object.defineProperty(cmdTva, k, {
            //       value: {taux:v.taux, montant: v.montant, ht: v.ht, ttc: v.ttc},
            //       writable: true,
            //       enumerable: true
            //     });

            //   } 
            //   // si le taux est déjà listé,
            //   // on additionne avec les valeurs enregistrées pour les ingrédients
            //   else {
            //     cmdTva[k] = Object.assign(cmdTva[k], {
            //       montant: cmdTva[k].montant + v.montant,
            //       ht: cmdTva[k].ht + v.ht,
            //       ttc: cmdTva[k].ttc + v.ttc
            //     });
            //   }
            // });
            

            // logger.info('iht','(Number('+article.pu+')*'+article.quantite+') / (1 + Number('+article.tva.valeur +'))');
            // logger.info(JSON.stringify(cmdTva));
            // total += articletotal;
          });
          
          
          // commentaire pour la commande
          __comment = cmd.comments.find(c => c.item===null && c.ingredient===null);

          // modificateurs pour la commande
          __modificateur = cmd.modificateurs.find(c => c.item===null && c.ingredient===null);
        //   if (__modificateur) {
        // //   total += Number(__modificateur.valeur);

        //     const ispc = String(__modificateur.valeur).substr(-1,1)==='%';
        //     const val = Math.abs(Number(String(__modificateur.valeur).slice(0,-1)));
        //     const montant = ispc ? total * (val/100) : val;

        //     __modificateur = {...__modificateur, montant: montant};

        //     // conversion du modificateur en coefficient
        //     const modtx = (ispc)
        //     ? (
        //       __modificateur.operation>0 
        //       ? (100 + val) / 100
        //       : (100 - val) / 100
        //       ) 
        //     : (
        //       __modificateur.operation>0 
        //       ? 1 + (val/total)
        //       : 1 - (val/total)
        //       )
        //     ;

        //     if (ispc) {
        //       total *= __modificateur.operation>0 ? (100 + val) / 100 : (100 - val) / 100;
        //     } else {
        //       total = __modificateur.operation>0 ? total + val : total - val;
        //     }


            // // application de la réduction aux taux de tva
            // Object.entries(cmdTva).forEach(([key, value])=> {
            //   cmdTva[key].montant *= modtx; 
            //   cmdTva[key].ht *= modtx; 
            //   cmdTva[key].ttc *= modtx; 
            // });

          // }

          let ventiltva = null;
          if (piece['TVA']) {
            ventiltva = piece['TVA'].map(tva => ({
              code: tva['ENC-TIK-TVA-NID'],
              ht: Number(tva['ENC-TIK-TOT-MHT'] / 100).toFixed(2),
              ttc: Number((tva['ENC-TIK-TOT-MHT'] + tva['ENC-TIK-TVA-MTN']) / 100).toFixed(2),
              taxe: Number(tva['ENC-TIK-TVA-MTN'] / 100).toFixed(2),
              taux: tva['ENC-TIK-TVA-TXX']
            }));
          }

          let ventilrgt = [];
          if (piece['REGLEMENTS']) {
            ventilrgt = piece['REGLEMENTS'].map(rgt => ({
              lib: rgt['ENC-TIK-REG-MOD-LIB'],
              valeur: Number(rgt['ENC-TIK-REG-MTN'] / 100).toFixed(2)
            }));
          }



          const __gdh = piece['ENC-TIK-HOR-GDH']
          const __datetime = new Date(__gdh.substring(0,4)+"-"+__gdh.substring(4,6)+"-"+__gdh.substring(6,8)+' '+__gdh.substring(8,10)+':'+__gdh.substring(10,12)+':'+__gdh.substring(12,14)); 
          const __datestr = `${format(__datetime, "d MMM yyyy", { locale: frLocale })} à ${format(__datetime, "H:mm:ss")}`;

          let __client = null;
          if (ticket.template!=='deliveroo') {
            __client = cmd.client && clients.find(c=>c.client_id===cmd.client.client_id);
          }

          const commande = {
            numero: cmdnumero,
            id: cmd.ticketId,
            date: removeDiacritics(__datestr),
            date_alt: date_alt,
            articles: articles,
            total: {
              total: Number(piece['ENC-TIK-TOT-TTC'] / 100).toFixed(2),
              ht: Number(piece['ENC-TIK-TOT-MHT'] / 100).toFixed(2),
              taxe: Number(piece['FAC-TOT-TVA'] / 100).toFixed(2),
              tva: ventiltva,
              remise: Number(piece['ENC-TIK-REM-MTN'] / 100).toFixed(2),
              soustotal: cmd.soustotal,
              avantremise: cmd.ttcavantremise.toFixed(2)
            },
            status: cmd.status,
            scheduled: cmd.scheduled ? format(new Date(cmd.scheduled), 'HH:mm') : null,
            mode: cmd.mode,
            bipper: cmd.bipper || null,
            reglements: ventilrgt,
            rendus: cmd.rendus,
            troppercu: cmd.troppercu,
            devise: __monnaie.iso.toUpperCase(),
            comment: __comment ? __comment.texte : '',
            // modificateur: piece['ENC-TIK-REM-MTN'] || null,
            modificateur: __modificateur ? {valeur: __modificateur.valeur, montant: __modificateur.montant, operation: __modificateur.operation, nom: __modificateur.nom, symbolemonnaie: __monnaie.symbole} : null,
            client: __client
          };


          const siret = piece['ENC-TIK-SOC-SIR'];
          // const siret_formatted = (siret) ? `SIRET ${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3),siret.substr(9,5)].join(' ')}` : '';


          // message promo (bon d'achat) + source de QRCode
          let promo = null;
          if (peripheriques && peripheriques.hasOwnProperty('promo_message')) {
            promo = {
              message: peripheriques.promo_message,
              url: peripheriques.promo_url
            };
          }


          // let _extrait_sign = '';
          // // caractères 3, 7, 13, 19 de la signature
          // if (cmd.signature) {
          //   _extrait_sign += cmd.signature.substring(2,3);
          //   _extrait_sign += cmd.signature.substring(6,7);
          //   _extrait_sign += cmd.signature.substring(12,13);
          //   _extrait_sign += cmd.signature.substring(18,19);
          // }

          // traitement du duplicata
          let _dupli_sign = '';
          let _dupli_id = '';
          let _numPrint = 1;
          let _dupli_gdh = '';
          let duplitype = null;
          let _origin_id = null;
          if (cmd.duplicatas) {
            const __dtype = (cmd.status==='confirmed') ? 'TICKET' : 'NOTE'
            duplitype = cmd.duplicatas.filter(d => d.type===__dtype);
          }
          if (duplitype && duplitype.length>0) {
            const _lastDupliType = last(duplitype);
            try {
              let duplitype = await commandeServices.getDuplicata({'ENC-DUP-NID': _lastDupliType.id})

              duplitype = duplitype[0];

              _dupli_id = duplitype['ENC-DUP-NID'];
              _dupli_sign = duplitype['ENC-DUP-RES'];

              const __g = duplitype['ENC-DUP-HOR-GDH'];
              _dupli_gdh = format(new Date(__g.substring(0,4)+"-"+__g.substring(4,6)+"-"+__g.substring(6,8)+' '+__g.substring(8,10)+':'+__g.substring(10,12)+':'+__g.substring(12,14)), "d MMM yyyy - H:mm:ss", { locale: frLocale });
              _numPrint = duplitype['ENC-DUP-PRN-NUM'];
            }
            catch(e) {
              console.error(e);
            }
          }
          if (piece['ENC-OPE-TYP']==='MODIFICATION') {
            _origin_id = (cmd.status==="confirmed") ? piece['ENC-TIK-REF'] : last(piece['ENC-TIK-CDE'].split('|'));
          }


          let __coordoonees = [removeDiacritics(piece['ENC-TIK-SOC-ADR'])];
          __coordoonees = [...__coordoonees, `${piece['ENC-TIK-SOC-CCP']} ${removeDiacritics(String(piece['ENC-TIK-SOC-VIL']).toUpperCase())}, ${removeDiacritics(String(piece['ENC-TIK-SOC-PAY']).toUpperCase())}`];
          if ( entreprise.telephone ) { __coordoonees = [...__coordoonees, entreprise.telephone] }
          if ( entreprise.site_web ) { __coordoonees = [...__coordoonees, entreprise.site_web] }


          let strings_alt = null;
          if (options.hasOwnProperty('secondelangue') && options.secondelangue!==null) {
            strings_alt = {
              encoding: data[options.secondelangue].params.encoding,
              direction: data[options.secondelangue].params.direction,
              commande: data[options.secondelangue].tickets.commande, 
              uber: data[options.secondelangue].tickets.uber, 
              deliveroo: data[options.secondelangue].tickets.deliveroo
            }
          }

          // contenu :
          contenu = {
            // -> logo
            logo: logo,
            // -> entreprise
            entreprise: {
              enseigne: removeDiacritics(String(piece['ENC-TIK-SOC-ID']).toUpperCase()),
              denomination: removeDiacritics(String(piece['ENC-TIK-SOC-ETS']).toUpperCase()),
              coordonnees: __coordoonees,
              fiscal: [ siret, `NAF ${piece['ENC-TIK-SOC-NAF']} - TVA ${piece['ENC-TIK-SOC-TVA']}` ]
            },
            // -> commande (id, date, articles, remises, totaux, tva, réglements)
            commande: commande,
            // -> message
            message: [ 'Notre restaurant est ouvert', 'Du lundi au samedi', 'De 11h à 14h et de 18h à 22h30', 'Et le dimanche', 'de 18h à 22h30', 'MERCI ET BON APPÉTIT !' ],
            // -> infos légales (type d'opération, code vendeur, code caisse, code centre profit, code opération, version logiciel)
            // et infos ticket : numéro ticket, date
            legal: {
              type: piece['ENC-OPE-TYP'],
              vendeur: removeDiacritics(operateur.nom)+' - '+piece['ENC-TIK-VEN-NID'],
              caisse: cmd.caisse.id,  //piece['ENC-TIK-CAI-NID'],
              centre: 'Restaurant',
              version: piece['ENC-TIK-TAG-VER'],
              ticketid: piece['ENC-TIK-NUM'],
              signature: piece['ENC-TIK-TAG-RET'],
              originid: _origin_id,
              duplicataid: _dupli_id,
              duplicatasignature: _dupli_sign,
              duplicatagdh: _dupli_gdh,
              printid: _numPrint,
              date: __datestr.replace('à','-')
            },
            promo,
            nomticket: ticket.nom,
            strings: {commande: strings.tickets.commande, uber: strings.tickets.uber, deliveroo: strings.tickets.deliveroo},
            strings_alt: strings_alt
          };


          if (ticket.template==='uber') {
            contenu = {...contenu, uber: cmd.uber};
          }
          if (ticket.template==='deliveroo') {
            let heurecmt = cmd.comments.find(c => c.item==='heure' && c.ingredient===null);
            contenu = {...contenu, deliveroo: { display_id: cmd.client.client_id, heure: format(new Date(heurecmt['texte']), 'HH:mm') }};
          }

        }
        else if (ticket.template==="partiel") {
          
          // -> template ticket
          template = (ticket.hasOwnProperty('variante')) ? templates.partiel[ticket.variante] : templates.partiel[1];

          let __comment = null;
          let articles = [];
          cmd.items.forEach(article => {

            let articleIngredients = [];
            let ingredientsAsProducts = [];
            let ingredientTypes = [];


            const inglist = [...article.composition, ...article.ingredients];


            inglist.forEach(ing => {

              const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : [];

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

                if (ingredientTypes.findIndex(t=>t.id===ing.type)===-1) {
                  ingredientTypes.push({
                    id: ing.type, 
                    nom: types[ing.type].nom,
                    hilite: (types[ing.type].hasOwnProperty('hilite')) ? types[ing.type].hilite : false,
                    ingredients: [],
                  });
                }

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
                    type: ing.type,
                    weight: __ingweight,
                    comment: __comment ? removeDiacritics(__comment.texte) : ''
                  });
                }
              }
            });

            articleIngredients.sort((a,b)=>a.weight-b.weight);


            articleIngredients.forEach(ing => {
              let __tidx = ingredientTypes.findIndex(it=>it.id===ing.type);
              ingredientTypes[__tidx].ingredients.push(ing);
            })



            // commentaire pour l'article :
            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);


            const prd = _getProduit(article.produitid, catalogue);
            const prdnoprint = prd.noprint!=null ? prd.noprint : [];
            // si le groupe de produits ne doit pas s'imprimer sur ce ticket
            let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);

            // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
            // let __noprintableingredient =  (inglist.length>0 && articleIngredients.length===0 && ingredientsAsProducts.length===0);
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
                types: ingredientTypes,
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
            strings: strings.tickets.production,
            logo: logo,
          }


        }
        else if (ticket.template==="principal") {
          
          noarticle = false;

          template = (ticket.hasOwnProperty('variante')) ? templates.principal[ticket.variante] : templates.principal[1];

          let __comment = null;
          let articles = [];
          cmd.items.forEach(article => {

            let articleIngredients = [];
            let ingredientsAsProducts = [];
            let ingredientTypes = [];

        //   article.ingredients.forEach(ing => {
            const inglist = [...article.composition, ...article.ingredients];


            inglist.forEach(ing => {


              const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : [];

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


                if (ingredientTypes.findIndex(t=>t.id===ing.type)===-1) {
                  ingredientTypes.push({
                    id: ing.type, 
                    nom: types[ing.type].nom,
                    hilite: (types[ing.type].hasOwnProperty('hilite')) ? types[ing.type].hilite : false,
                    ingredients: [],
                  });
                }

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
                    type: ing.type,
                    comment: __comment ? removeDiacritics(__comment.texte) : ''
                  });
                }
              }
            });

            articleIngredients.sort((a,b)=>a.weight-b.weight);


            articleIngredients.forEach(ing => {
              let __tidx = ingredientTypes.findIndex(it=>it.id===ing.type);
              ingredientTypes[__tidx].ingredients.push(ing);
            })

            // commentaire pour l'article :
            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);

            const prd = _getProduit(article.produitid, catalogue);
            const prdnoprint = prd.noprint!=null ? prd.noprint : [];

            // si le groupe de produits ne doit pas s'imprimer sur ce ticket
            let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);


            // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
            // let __noprintableingredient =  (inglist.length>0 && articleIngredients.length===0 && ingredientsAsProducts.length===0);
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
                types: ingredientTypes,
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
            recap: recapTickets,
            logo: logo,
          }

        }
        else if (ticket.template==="etiquette") {

          // -> template ticket
          template = templates.etiquette;

          let articles = [];
          cmd.items.forEach(article => {

            let articleIngredients = [];
            let ingredientsAsProducts = [];
            let __comment = null;


            const inglist = [...article.composition, ...article.ingredients];


            inglist.forEach(ing => {

              const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : [];

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


            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);

            articleIngredients.sort((a,b)=>a.weight-b.weight);

            const prd = _getProduit(article.produitid, catalogue);
            const prdnoprint = prd.noprint!=null ? prd.noprint : catalogue[prd.groupe].noprint;
            // si le groupe de produits ne doit pas s'imprimer sur ce ticket
            let __anoprint = prdnoprint.find(p=>p===ticket.ticket_id);

            // si le produit a des ingrédients mais qu'aucun d'entre eux ne doit s'imprimer sur le ticket
            let __noprintableingredient = (inglist.length>0 && articleIngredients.length===0);
            // let __noprintableingredient = false;
            // if (inglist.length>0) {
            //   if (ingredientsAsProducts.length>0) __noprintableingredient = ingredientsAsProducts.length===inglist.length;
            // } 
            
            // si le groupe doit s'imprimer sur ce ticket
            // ou si au moins un de ses ingrédients doit s'imprimer sur ce ticket
            // on ajoute ce produit à la liste à imprimer
            // if (!__noprintableingredient && (!__anoprint || (__anoprint && articleIngredients.length>0))) {
            if (!__noprintableingredient && !__anoprint) {
            // if (!__anoprint) {
              articles.push({
                qte: article.quantite,
                nom: removeDiacritics(article.nom),
                ingredients: articleIngredients,
                comment: __comment ? removeDiacritics(__comment.texte) : ''
              });        
            }
            if (ingredientsAsProducts.length>0 && !__anoprint) {
            // if (ingredientsAsProducts.length>0) {
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
        else if (ticket.template==="produits") {

          // -> template ticket
          template = templates.produits;

          let articles = [];
          cmd.items.forEach(article => {

            let articleIngredients = [];
            let ingredientsAsProducts = [];
            let __comment = null;


            const inglist = [...article.composition, ...article.ingredients];


            inglist.forEach(ing => {

              const ingnoprint = (ingredients[ing.ingredient].noprint!==null && ingredients[ing.ingredient].noprint!==undefined) ? ingredients[ing.ingredient].noprint : [];

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
                    weight: __ingweight,
                    comments: __comment
                  });
                }
              }
            });

            __comment = cmd.comments.find(c => c.item===article.itemid && c.ingredient===null);

            articleIngredients.sort((a,b)=>a.weight-b.weight);

            const prd = _getProduit(article.produitid, catalogue);
            const prdnoprint = prd.noprint!=null ? prd.noprint : [];
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
                ingredients: articleIngredients,
                comment: __comment ? removeDiacritics(__comment.texte) : ''
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


        if (cmd.status==="standby" && print_standby && ticket.kds!==true) {
          dispatch({ type: peripheralActionTypes.NOPRINT_TICKET, template: template, reason: 'status=standby et pas de kds pour le ticket' });
        }
        else if (noarticle) {
          dispatch({ type: peripheralActionTypes.NOPRINT_TICKET, template: template, reason: 'no article' });

          // logger.timeEnd('printCommandeTicket()');
        } else {

          try {
            const response = await peripheralServices.printTicket(target_imprimantes[0], template, contenu);
            logger.info(response);
            dispatch({ type: peripheralActionTypes.PRINT_TICKET });
            
            if (template==='commande') {
              let duplitype = null;
              if (cmd.duplicatas) {
                if (cmd.status==='confirmed') {
                  duplitype = cmd.duplicatas.filter(d => d.type==='TICKET');
                }
              }
              if (duplitype && duplitype.length>0) {
                dispatch(journalActions.log('155', cmd.duplicataid));
              }
            } 
          } 
          catch(e) {
            console.error(e);
            // log de non édition d'une note dans le cas du ticket "commande" original (note)
            if (template==='commande') {
              let duplitype = null;
              if (cmd.duplicatas) {
                if (cmd.status==='confirmed') {
                  duplitype = cmd.duplicatas.filter(d => d.type==='TICKET');
                }
              }
              if (!duplitype || duplitype.length < 1) {
                dispatch(journalActions.log('329', e));
              }
            }
          }

        }


      });


      // on déclare la commande comme étant lancée en production
      // let updateCmdAfterPrint = {ticketId: cmd.ticketId, enproduction: true};

      // // pour les tickets commande, on met à jour le nombre d'impressions
      // if (tckToPrint.find(ticket => ticket.template==='commande')) {
      //   updateCmdAfterPrint.printnum = Number(cmd.printnum)+1;
      // }

      // si la commande a déjà été persistée
      if (cmd.enproduction===false) {
   //     commandeServices.persistCommande(updateCmdAfterPrint);
      }

    }

  }
}



// function printPeriodeX(payload={}) {

//   return (dispatch, getState) => {

//       // -> template ticket
//       const template = [
//         'entreprise', 
//         'periode_x'
//       ];

//       let periode = {};
//       if (Object.values(payload).length===0) {
//         periode = getState().clotureReducer.periode;
//       } else {
//         periode = payload.periode;
//       }

//       const { impression } = strings.modules.cloture;
//       const { imprimantes, tickets } = getState().peripheralReducer;
//       const { entreprise } = getState().parametresReducer.parametres;

//       // récup des préf. du ticket et de l'imprimante correspondante
//       let ticket = Object.values(tickets).find(tck=>tck.template==='cloture_x');
//       let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

//       const { debut, fin } = periode;
//       const __debut = format(debut, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
//       const __fin = format(fin, "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


//       const __periode = {...periode, 
//                  debut: __debut, 
//                  fin: __fin};

//       const siret = entreprise.siret;
//       const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';

//       const contenu = {
//         // -> entreprise
//         entreprise: {
//           nom: removeDiacritics(String(entreprise.denomination).toUpperCase()),
//           coordonnees: [ removeDiacritics(entreprise.adresse), `${entreprise.code_postal} ${removeDiacritics(String(entreprise.ville).toUpperCase())}`, entreprise.site_web ],
//           fiscal: [ siret_formatted ]
//         },
//         periode: __periode,
//         strings: impression
//       };

//     peripheralServices.printTicket(imprimante, template, contenu)
//     .then(
//       response => {
//         logger.info('print X');
//       }
//     )
//     dispatch({ type: peripheralActionTypes.PRINT_PERIODE_X });

//   }
// }

function printCloture(payload={}) {
  return async (dispatch, getState) => {  
    
    // -> template ticket
    // let template = [
    //   'entreprise', 
    //   'periode_z',
    //   'mouvements',
    //   'prelevement'
    // ];

    const template = templates.cloture;

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
     // template.push('prelevement');
    }


    logger.info('printCloture()', payload);

    const { impression } = strings.modules.cloture;
    const { imprimantes, tickets } = getState().peripheralReducer;
    const { financier, entreprise } = getState().parametresReducer.parametres;


    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template==='cloture_z');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

    const { debut, fin, caisse } = periode;
    const __debut = format(new Date(debut), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
    const __fin = format(new Date(fin), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


    const __periode = {...periode, 
                debut: __debut, 
                fin: __fin};

    const siret = entreprise.siret;
    const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';

    
    const { tresorslist } = 
      financier.fonddecaisse_activation 
      ? ( caisse 
        ? await tresorServices.getServiceMouvements( {caisseId: caisse.uniqid, debut: new Date(debut).getTime()} ) 
        : {tresorslist: null} ) 
      : {tresorslist: null};



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
      strings: impression,
      mouvements: tresorslist
    };

    logger.info('peripheralActions.printCloture contenu:', contenu);

    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        logger.info('print Z');
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_PERIODE_Z });
  }
}

function printZCaisse(zdecaisse) {
  return async (dispatch, getState) => {

    const template = templates.cloture;
    
    logger.info('printZCaisse()', zdecaisse);

    const { impression } = strings.modules.cloture;
    const { imprimantes, tickets } = getState().peripheralReducer;
    const { financier, entreprise, options } = getState().parametresReducer.parametres;
    const { caisse } = options;

    // récup des préf. du ticket et de l'imprimante correspondante
    let ticket = Object.values(tickets).find(tck=>tck.template==='cloture_z');
    let imprimante = Object.values(imprimantes).find(imp=>imp.printer_id===ticket.imprimantes[0]);

    const { periode } = zdecaisse;
    const p = periode.split('|');
    const debut = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);
    const fin = p[1].substring(0,4)+"-"+p[1].substring(4,6)+"-"+p[1].substring(6,8)+' '+p[1].substring(8,10)+':'+p[1].substring(10,12)+':'+p[1].substring(12,14);

    const __debut = format(new Date(debut), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });
    const __fin = format(new Date(fin), "dd/MM/yyyy-HH:mm:ss", { locale: frLocale });


    const __periode = {...zdecaisse, 
                debut: __debut, 
                fin: __fin};

    const siret = entreprise.siret;
    const siret_formatted = (siret) ? `${[siret.substr(0,3),siret.substr(3,3),siret.substr(6,3)].join(' ')} RCS ${entreprise.rcs}` : '';

    
    const { tresorslist } = 
      financier.fonddecaisse_activation 
      ? ( caisse 
        ? await tresorServices.getServiceMouvements( {caisseId: caisse.uniqid, debut: new Date(debut).getTime()} ) 
        : {tresorslist: null} ) 
      : {tresorslist: null};



    const contenu = {
      // -> entreprise
      entreprise: {
        nom: removeDiacritics(String(entreprise.denomination).toUpperCase()),
        coordonnees: [ removeDiacritics(entreprise.adresse), `${entreprise.code_postal} ${removeDiacritics(String(entreprise.ville).toUpperCase())}`, entreprise.site_web ],
        fiscal: [ siret_formatted ]
      },
      periode: __periode,
      prelevement: zdecaisse.prelevement || 0,
      comptage: zdecaisse.comptage || null,
      ecarts: zdecaisse.ecarts || null,
      strings: impression,
      mouvements: tresorslist,
      nomticket: ticket.nom,
      createdAt: format(new Date(zdecaisse.createdAt),'yyyy/MM/dd HH:mm:ss')
    };

    logger.info('peripheralActions.printZCaisse contenu:', contenu);

    peripheralServices.printTicket(imprimante, template, contenu)
    .then(
      response => {
        logger.info('print Z');
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_PERIODE_Z });
  }
}

function quitApp() {
  return dispatch => {
    dispatch({type: peripheralActionTypes.QUIT_APP});
    dispatch(journalActions.log('40','extinction'));
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
  printTicketFromAPI,
  printCommandeTicket,
  printTicket,
  // printPeriodeX,
  printCloture,
  printZCaisse,
  quitApp
};