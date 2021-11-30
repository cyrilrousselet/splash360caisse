import { clotureActionTypes } from './clotureActionTypes';
import { clotureServices } from './clotureServices';
import { commandeActions } from '../commande/commandeActions';
import { peripheralActions } from '../peripheral/peripheralActions';

// import { differenceInMinutes } from 'date-fns/esm';

// import LocalizedStrings from 'react-localization';
// import {data} from '../../constants/translations';
// import Swal from 'sweetalert2';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import { commandeServices } from '../commande/commandeServices';
import { dateBounds, asyncForEach } from '../../helpers/toolbox';
import { notificationActions } from '../notification/notificationActions';
import { signatureServices } from '../signature/signatureServices';
import { format, lastDayOfMonth, set, sub } from 'date-fns';
import isBefore from 'date-fns/isBefore';
// import { dateBounds } from '../../helpers/toolbox';
// const strings = new LocalizedStrings(data);

// const logger = new Logger();


function getLast() {
  return dispatch => {
    dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_REQUEST, detail:"last" });
    // logger.time('ClotureActions.getLast');
    return clotureServices.getLast()
    .then(
        data => { 
          // logger.timeEnd('ClotureActions.getLast');
          dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_SUCCESS, ...data }) 
        }
    )
    .catch(
      error => { 
        // logger.timeEnd('ClotureActions.getLast');
        logger.error(error);
        dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}

function getBoundedClotures(params={}) {
  return dispatch => {
    dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_REQUEST, criterias:params });

    return clotureServices.getBoundedClotures(params)
    .then(
        data => { dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_FAILURE, error: error.toString() })
      }
    );
  }
}

function getCloturesList(params={}) {

  return (dispatch) => {
    dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_REQUEST, criterias:params });

    // logger.time('ClotureActions.getCloturesList');
    return clotureServices.getCloturesList(params)
    .then(
        data => { 
          // logger.timeEnd('ClotureActions.getCloturesList');
          dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_SUCCESS, ...data }) 
        }
    )
    .catch(
      error => { 
        // logger.timeEnd('ClotureActions.getCloturesList');
        logger.error(error);
        dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}

function getCurrentPeriode(params={}) {

  return async (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {financier, options} = state.parametresReducer.parametres;

    const { user } = state.authentication;

  //  const { heure_fin } = entreprise;
  //  const __periode_bounds = dateBounds(new Date(), heure_fin);
  //  const periode_start = __periode_bounds.debut;

    const { caisse } = options;

    // récup. cmd non clôturées

    // logger.time('ClotureActions.getCurrentPeriode -> getCommandesList()');
    const {commandeslist} = await commandeServices.getCommandesList({
      $and: [
        { archived: {"$exists": false} },
        { status: { $ne: "deleted" } },
        { $or: [
          { "caisse_encaissement.id": caisse.id },
          { $and: [
            { "caisse.id": caisse.id },
            { status: { $in: ["standby", "a_encaisser"]} }
          ]},
        ]},
        { $or: [
          { centre_revenu: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]}
      ]
    });

    // logger.timeEnd('ClotureActions.getCurrentPeriode -> getCommandesList()');
    
    
    // // si les cmd non clôt. proviennent d'une période précédente.
    // if (commandeslist.length>0) {
    //   const pastcmdopen = commandeslist.findIndex(oc=>differenceInMinutes(new Date(oc.updatedAt), periode_start)<0);
    //   logger.info('commandes provenant d’une période précédente', pastcmdopen);
    //   if (pastcmdopen>-1) {
    //     dispatch({ type: clotureActionTypes.PREVIOUS_PERIOD_ERROR });

    //     Swal.fire({
    //       title: strings.modules.cloture.alerte.cmdnoncloturees.titre,
    //       text: strings.modules.cloture.alerte.cmdnoncloturees.texte,
    //       focusConfirm: true,
    //       showCancelButton: false,
    //       customClass: 'differenterror',
    //       confirmButtonText: 'OK',
    //       buttonsStyling: false 
    //     }).then((result)=> {
    //    //   history.push(paths.CLOTURE);
    //     });
    //   }
    // }

    const default_params =  {
      user: {
        id: user.id,
        nom: user.nom,
        user_id: user.user_id,
      },
      caisse: null, //[{id:0, nom: 'caisse 0'}],
      vendeur: null, //[state.authentication.user],
      fdcaisse: (financier && financier.fonddecaisse_activation) ? Number(financier.fonddecaisse_montant) : 0,
      // debut: periode_start,
      // fin: periode_end,
      extract: 'x'
    };

    params = {...default_params, ...params};


    

    // logger.time('ClotureActions.getCurrentPeriode -> service');
    const {periode} = clotureServices.getCurrentPeriode(commandeslist, catalogue, params)
    // logger.timeEnd('ClotureActions.getCurrentPeriode -> service');
    dispatch({ type: clotureActionTypes.GET_CURRENT_PERIODE, periode });
  }
}

function getTodayCa() {
  return async (dispatch, getState) => {

    const state = getState();
    const {heure_fin} = state.parametresReducer.parametres.entreprise;
    // const {commandeslist} = state.commandesListReducer;
    const __periode_bounds = dateBounds(new Date(), heure_fin);
    const lastperiode_end = __periode_bounds.debut;


    // logger.time('ClotureActions.getTodayCa');
    // const {ca, numtickets} = clotureServices.getTodayCa(heure_fin, commandeslist);
    const stats = await clotureServices.getTodayCa(lastperiode_end);
    const {ca, numtickets} = stats;
    // logger.timeEnd('ClotureActions.getTodayCa', stats);
    // logger.time('clotureActions after getTodayCa');
    dispatch({type: clotureActionTypes.GET_TODAY_CA, ca, numtickets})

  }
}


function loadCloture(clotureId) {
  
}

function makeCloture(params={}) {
  return async (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {financier, options} = state.parametresReducer.parametres;
    const { user } = state.authentication;

  //  logger.info(commandeslist);

    const default_params =  {
      user: {id: user.id, nom: user.nom, user_id: user.user_id},
      caisse: options.caisse,
      vendeur: null,
      fdcaisse: financier.fonddecaisse_activation ? Number(financier.fonddecaisse_montant) : 0,
      // debut: startOfToday(),
      // fin: endOfToday(),
      extract: 'z'
    };

    params = {...default_params, ...params};

    // récup. cmd non clôturées
    const {commandeslist} = await commandeServices.getCommandesList({
      $and: [
        { archived: {"$exists": false} },
        { status: { $ne: "deleted" } },
        { $or: [
          { "caisse_encaissement.id": params.caisse.id },
          { $and: [
            { "caisse.id": params.caisse.id },
            { status: { $in: ["standby", "a_encaisser"]} }
          ]},
        ]},
        { $or: [
          { centre_revenu: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]}
      ]
    });

    
    // logger.time("makeCloture");
    const cloture = clotureServices.makeCloture(commandeslist, catalogue, params)
    // logger.timeEnd("makeCloture");
    // logger.time("saveCloture"); 

    const __cloture = {...cloture, localsync: [options.caisse.uniqid]};

    clotureServices.saveCloture(__cloture)
      .then(
        data => {
          // logger.timeEnd("saveCloture");
          dispatch(commandeActions.archiveCommands({cmd:cloture.archivedcommandesid, clotureId:cloture.clotureId}));
          dispatch({ type: clotureActionTypes.MAKE_CLOTURE, cloture });
          dispatch(getLast());
          dispatch(peripheralActions.printCloture(cloture));
          dispatch(notificationActions.syncDispatch('cloture', __cloture));
        //  dispatch(notificationActions.syncClotures([data]));
        }
      )

  }
}


function setSyncedClotures(payload) {
  return dispatch => {
    dispatch({ type: clotureActionTypes.SETSYNCED_REQUEST });
    logger.info('setSyncedClotures()', payload);
    const {id, datetime} = payload;
    clotureServices.setSyncedClotures(id,datetime)
    .then(
      confirm => {
        dispatch({ type: clotureActionTypes.SETSYNCED_SUCCESS });
      //  dispatch(notificationActions.syncDispatch('setsyncedcommandes', {id, datetime}));
      },
      error => {
        dispatch({ type: clotureActionTypes.SETSYNCED_FAILURE, error: error });
      }
    );

  }
}


function setClotureFromSync(cloture) {
  return async (dispatch, getState) => {
    const { data, emitter, response } = cloture;


    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;

    // s'il s'agit de plusieurs clotures à persister
    if (Array.isArray(data)) {

      let cloturesIds = [];
      let cloNum = 0;

      const __syncClo = async () => {
        await asyncForEach(data, async (clo) => {

          const {localsync} = clo;
          let __lsync = localsync || [];
          if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);
    
          let clotureConfirm = null;
          
          try {
            clotureConfirm = await clotureServices.saveCloture({...clo, localsync:__lsync});
            
            dispatch({ type: clotureActionTypes.PERSIST_FROM_SYNC_SUCCESS, clotureConfirm });
            cloNum++;
            cloturesIds.push(clotureConfirm.clotureId);

          } catch(err) {
            logger.error(err);
            dispatch({ type: clotureActionTypes.PERSIST_FROM_SYNC_FAILURE, error: err });
          }

          if (cloNum===data.length) {
            
            // confirmation du traitement de la synchro
            if (response!==null) {
              dispatch(notificationActions.syncConfirm(response, {db:"cloture", ids:cloturesIds, from:caisse.uniqid}));
            }
            // -> si 'response' est null, la synchro ne provient pas de l'API,
            // il s'agit d'une synchro d'entretien commandée par la caisse 'primary'
            else {
              dispatch(notificationActions.syncConfirmToPrimary({db:"cloture", ids:cloturesIds, from:caisse.uniqid}));
            }

            // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
            // donc inutile de lui renvoyer la synchro
            if (emitter!==null) {
              dispatch(notificationActions.syncDispatch('cloture', clotureConfirm, emitter));
            }
            
          }
        }); 
      }

      __syncClo();

    } 
    // s'il s'agit d'une seule cloture
    else {
      
      const {localsync} = data;
      let __lsync = localsync || [];
      if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

      let clotureConfirm = null;

      try {

        clotureConfirm = await clotureServices.saveCloture({...data, localsync:__lsync});
      
        // confirmation du traitement de la synchro
        if (response!==null) {
          dispatch(notificationActions.syncConfirm(response, {db:"cloture", ids:[clotureConfirm.clotureId], from:caisse.uniqid}));
        }
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // il s'agit d'une synchro d'entretien commandée par la caisse 'primary'
        else {
          dispatch(notificationActions.syncConfirmToPrimary({db:"cloture", ids:[clotureConfirm.clotureId], from:caisse.uniqid}));
        }

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
        // donc inutile de lui renvoyer la synchro
        if (emitter!==null) {
          dispatch(notificationActions.syncDispatch('cloture', clotureConfirm, emitter));
        }

      } catch(err) {
        logger.error(err);
        dispatch({ type: clotureActionTypes.PERSIST_FROM_SYNC_FAILURE, error: err });
      }

    }
  }
}


function getGTP() {
  return async dispatch => {

    try {
      const {gtpca, gtpva} = await clotureServices.getGTP(); 
      dispatch({ type: clotureActionTypes.GET_GTP_SUCCESS, gtpca, gtpva })
    }
    catch(e) {
      dispatch({ type: clotureActionTypes.GET_GTP_FAILURE, error:e })
    }
  }
}


function updateGTP(valeur) {
  return async (dispatch, getState) => {
    const {gtpca, gtpva} = getState().clotureReducer;
    try {
      const __gtp = await clotureServices.updateGTP(valeur, gtpca, gtpva);
      dispatch({ type: clotureActionTypes.UPDATE_GTP_SUCCESS, gtpca: __gtp.gtpca, gtpva: __gtp.gtpva });
    }
    catch(e) {
      dispatch({ type: clotureActionTypes.UPDATE_GTP_FAILURE, error:e });
    }
  }
}

function createGrandTotalTicket(commande) {
  return async (dispatch, getState) => {

    console.log('createGrandTotalTicket()');

    // const { grandtotal } = getState().numerotationReducer;
    // const { caisse, role } = getState().parametresReducer.parametres.options;
    const { trousseauId } = getState().signatureReducer; 
    let __gtp = null;
    try {
      const {gtpca, gtpva} = await clotureServices.getGTP();
      __gtp = await clotureServices.updateGTP(Math.round(commande.total*100), gtpca, gtpva);
      dispatch({ type: clotureActionTypes.UPDATE_GTP_SUCCESS, gtpca: __gtp.gtpca, gtpva: __gtp.gtpva });
    }
    catch(e) {
      dispatch({ type: clotureActionTypes.UPDATE_GTP_FAILURE, error:e });
    }

    
    let __tva_ttc = Object.values(commande.ventilation).map(tva => {
      let __tx = tva.taux * 10000;
      if (__tx<1000) __tx = '0'+__tx;
      return __tx + ':' + tva.ttc;
    });
    let __tva_ht = Object.values(commande.ventilation).map(tva => {
      let __tx = tva.taux * 10000;
      if (__tx<1000) __tx = '0'+__tx;
      return __tx + ':' + tva.ht;
    });
    let __tva_taxe = Object.values(commande.ventilation).map(tva => {
      let __tx = tva.taux * 10000;
      if (__tx<1000) __tx = '0'+__tx;
      return __tx + ':' + tva.tva;
    });
    let __total_ttc = 0
    let __total_ht = 0;
    Object.values(commande.ventilation).forEach(tva => {
      __total_ttc += tva.ttc;
      __total_ht += tva.ht;
    });

    const __gtt = {
      numeroTicket: commande.ticket,
      tva_ttc: __tva_ttc.join('|'),
      tva_ht: __tva_ht.join('|'),
      tva_taxe: __tva_taxe.join('|'),
      total_ttc: __total_ttc,
      total_ht: __total_ht,
      gtpca: __gtp.gtpca,
      gtpva: __gtp.gtpva,
      createdAt: format(new Date(commande.createdAt), 'yyyyMMddHHmmss'),
      source_hash: commande.hashsource,
      hash_ticket: commande.hash,
      trousseauId: trousseauId,
      signature_ticket: commande.signature
    };

    try {
      const confirm = await clotureServices.persistGTTicket(__gtt);
      dispatch({ type: clotureActionTypes.PERSIST_GTTICKET_REQUEST, gtt: __gtt });
    }
    catch(e) {
      dispatch({ type: clotureActionTypes.PERSIST_GTTICKET_FAILURE, error: e })
    }

  }
}


/**
 * 
 * @param {String} intervalle ['jour','mois','annee']
 * @param {Array} grandstotaux 
 * @returns 
 */
function createGrandTotalPeriodique(intervalle, grandstotaux) {
  return async (dispatch, getState) => {

    console.log('createGrandTotalPeriodique(' + intervalle + ') L=' + grandstotaux.length);

    const { grandtotal } = getState().numerotationReducer;
    const { caisse, role } = getState().parametresReducer.parametres.options;
    const { privateKey, trousseauId } = getState().signatureReducer; 
    
    const {gtpca, gtpva} = await clotureServices.getGTP();


    let __tva_ttc = {};
    let __tva_ht = {};
    let __tva_taxe = {};
    let __total_ttc = 0
    let __total_ht = 0;
    let __start = null;
    let __end = null;


    grandstotaux.forEach(gt => {

      // tva ttc
      const gt_tvattc = gt.tva_ttc.split('|');
      gt_tvattc.forEach(t => {
        let cpl = t.split(':');
        if (!__tva_ttc.hasOwnProperty(cpl[0])) __tva_ttc[cpl[0]] = 0;
        __tva_ttc[cpl[0]] += parseInt(cpl[1]);
      });

      // tva ht
      const gt_tvaht = gt.tva_ht.split('|');
      gt_tvaht.forEach(t => {
        let cpl = t.split(':');
        if (!__tva_ht.hasOwnProperty(cpl[0])) __tva_ht[cpl[0]] = 0;
        __tva_ht[cpl[0]] += parseInt(cpl[1]);
      });

      // tva taxe
      const gt_tvataxe = gt.tva_taxe.split('|');
      gt_tvataxe.forEach(t => {
        let cpl = t.split(':');
        if (!__tva_taxe.hasOwnProperty(cpl[0])) __tva_taxe[cpl[0]] = 0;
        __tva_taxe[cpl[0]] += parseInt(cpl[1]);
      });

      __total_ttc += gt.total_ttc;
      __total_ht += gt.total_ht;


      let __evalstart, __evalend;
      // si le grandtotal est un GTPeriodique (type 'jour' ou 'mois')
      if (gt.hasOwnProperty('periode')) {

        let periode_ar = gt.periode.split('|');
        __evalstart = parseInt(periode_ar[0]);
        __evalend = parseInt(periode_ar[1]);

      } 
      // si le grandtotal est un GTTicket
      else {
        __evalstart = parseInt(gt.createdAt);
        __evalend = parseInt(gt.createdAt);
      }


      if (__start) {
        __start = Math.min(__evalstart, __start);
      } else {
        __start = __evalstart;
      }
      if (__end) {
        __end = Math.max(__evalend, __end);
      } else {
        __end = __evalend;
      }

    });
    
    // formattage des ventilations de tva
    let __alltva_ttc = Object.entries(__tva_ttc).map(([taux,valeur]) => {
      return taux + ':' + valeur;
    });
    let __alltva_ht = Object.entries(__tva_ht).map(([taux,valeur]) => {
      return taux + ':' + valeur;
    });
    let __alltva_taxe = Object.entries(__tva_taxe).map(([taux,valeur]) => {
      return taux + ':' + valeur;
    });
   
    // formattage de l'horodatage (de int -> str)
    let __start_str = __start.toString();
    while(__start_str.length<14) {
      __start_str = __start_str + '0';
    }
    let __end_str = __end.toString();
    while(__end_str.length<14) {
      __end_str = __end_str + '0';
    }


    const source_signature = {
      tva: __alltva_ttc.join('|'),
      ttc: __total_ttc,
      periode: __start_str+'|'+__end_str
    }


    const lastSignature = await signatureServices.getLastSignature('grandstotaux');
    const newTicket = 'GTP'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + grandtotal.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
    const {source, hash, signature} = signatureServices.getGrandtotalSignature({...source_signature, type:"periode"}, gtpca, privateKey, lastSignature);
 

    const __grandtotalperiodique = {
      type: intervalle,
      grandtotal_id: newTicket,
      periode: __start_str+'|'+__end_str,
      tva_ttc: __alltva_ttc.join('|'),
      tva_ht: __alltva_ht.join('|'),
      tva_taxe: __alltva_taxe.join('|'),
      total_ttc: __total_ttc,
      total_ht: __total_ht,
      gtpca: gtpca,
      gtpva: gtpva,
      createdAt: format(new Date(), 'yyyyMMddHHmmss'),
      source_hash: source,
      hash: hash,
      trousseauId: trousseauId,
      signature: signature
    };

    try {
      const confirm = await clotureServices.persistGTPeriodique(__grandtotalperiodique);
      dispatch({ type: clotureActionTypes.PERSIST_GTPERIODIQUE_SUCCESS, gtp: __grandtotalperiodique });
    }
    catch(e) {
      dispatch({ type: clotureActionTypes.PERSIST_GTPERIODIQUE_FAILURE, error: e })
    }

  }
}


function testGTPeriodique() {
  return async dispatch => {

    const __today =  new Date();
    let end;

    // -------------- Grand Total Journalier (GTM) -------------- 
    // y a-t-il un GTJ pour hier ?

    // si la date de test est après 5h00, le créneau de recherche correspond à [(today-1)@6h00 -> today@5h00]  
  //  let start = format(sub(__today,{days:1}), 'yyyyMMdd060000');
    end = format(__today,'yyyyMMdd050000');

    // si la date de test est avant 5h00, le créneau de recherche correspond à [(today-2)@6h00 -> (today-1)@5h00]
    if (isBefore(__today, set(__today,{hours:5}))) {
  //    start = format(sub(__today,{days:2}), 'yyyyMMdd060000');
      end = format(sub(__today,{days:1}), 'yyyyMMdd050000');
    }


    let __GTT_query = null;

    try {
      // on récupère le GTJ le plus récent
      const __lastGTJ = await clotureServices.getLastGTPeriodique("jour");
      
      console.log('GTJ', __lastGTJ);

      if (__lastGTJ.length>0) {
        // fin de periode
        const last_fin = parseInt(__lastGTJ[0].periode.split("|")[1]);

        console.log('fin de la période du GTJ', last_fin, parseInt(end));

        // si la date de fin de la période du dernier GTJ 
        // est antérieure à la date de fin du dernier service
        if (last_fin < parseInt(end)) {
          console.log('date de fin de la période du GTJ antérieure à la fin du dernier service');
          // on va chercher les éventuels GTTickets créés entre les deux dates
          __GTT_query = {
            "$expr" : {
              "$and":[ 
                {"$gt" : [{"$toDouble": "$createdAt"} , last_fin]},
                {"$lt" : [{"$toDouble": "$createdAt"} , parseInt(end)]}
              ]
            }
          };
        } else {
          console.log('date de fin de la période du GTJ n’est pas antérieure à la fin du dernier service');
        }
      }
      // s'il n'y a pas de GTJ avant aujourd'hui
      else {
        console.log('pas de GTJ antérieur')
        // on va chercher tous les GTTickets antérieurs au service d'aujourd'hui
        __GTT_query = {"$expr" : {"$lt" : [{"$toDouble" :"$createdAt"} , parseInt(end)]}};
      }
    }
    catch(e) {
      console.error('last GTJ ERROR', e);
    }

    // on va chercher les GTTickets si besoin
    // et s'il y en a on crée un GTJ avec
    if (__GTT_query) {
      console.log('on va chercher les GTTickets', __GTT_query);
      try {
        const liste_GTT = await clotureServices.getGTTicket(__GTT_query);
        if (liste_GTT.length>0) {  
          dispatch(createGrandTotalPeriodique('jour',liste_GTT));
        }
      }
      catch(e) {
        console.error('liste GTT ERROR', e);
      }
    }

    // -------------- Grand Total Mensuel (GTM) -------------- 
    // y a-t-il un GTM pour le mois dernier ?
    end = format(set(__today,{date:1}), 'yyyyMMdd050000');

    let __GTJ_query = null;

    try {
      // on récupère le GTM le plus récent
      const __lastGTM = await clotureServices.getLastGTPeriodique("mois");

      console.log('GTM', __lastGTM);

      if (__lastGTM.length>0) {
        // fin de periode
        const last_fin = parseInt(__lastGTM[0].periode.split("|")[1]);

        console.log('fin de la période du GTM', last_fin, parseInt(end));

        // si la date de fin de la période du dernier GTM 
        // est antérieure à la date de fin du dernier mois
        if (last_fin < parseInt(end)) {
          console.log('date de fin de la période du GTM antérieure à la fin du dernier mois');
          // on va chercher les éventuels GTJ créés entre les deux dates
          __GTJ_query = {
            "$expr" : {
              "$and":[ 
                {"$type": "jour"},
                {"$gt" : [
                  {"$toDouble": 
                    {"$arrayElemAt":[
                      {"$split":["$periode","|"]}, 
                      1
                    ]}
                  },
                  last_fin
                ]},
                {"$lt" : [
                  {"$toDouble": 
                    {"$arrayElemAt":[
                      {"$split":["$periode","|"]}, 
                      1
                    ]}
                  }, 
                  parseInt(end)
                ]}
              ]
            }
          };
        } else {
          console.log('date de fin de la période du GTM n’est pas antérieure à la fin du dernier mois');
        }
      }
      // s'il n'y a pas de GTM avant aujourd'hui
      else {
        console.log('pas de GTM antérieur')
        // on va chercher tous les GTJ antérieurs au mois actuel
        __GTJ_query = {
          "$expr" : {
            "$and":[ 
              {"$type": "jour"},
              {"$lt" : [
                {"$toDouble": 
                  {"$arrayElemAt":[
                    {"$split":["$periode","|"]}, 
                    1
                  ]}
                }, 
                parseInt(end)
              ]}
            ]
          }
        };
      }

    } catch(e) {
      console.error('last GTM ERROR', e);
    }

    // on va chercher les GTJ si besoin
    // et s'il y en a on crée un GTM avec
    if (__GTJ_query) {
      console.log('on va chercher les GTJ', __GTJ_query);
      try {
        const liste_GTJ = await clotureServices.getGTPeriodique(__GTJ_query);
        if (liste_GTJ.length>0) {
          dispatch(createGrandTotalPeriodique('mois',liste_GTJ));
        }
      }
      catch(e) {
        console.error('liste GTJ ERROR', e);
      }
    }



    // -------------- Grand Total Annuel (GTA) -------------- 
    // y a-t-il un GTA pour l'année dernière ?
    end = format(set(__today,{month:0}), 'yyyyMMdd050000');

    let __GTM_query = null;

    try {
      // on récupère le GTA le plus récent
      const __lastGTA = await clotureServices.getLastGTPeriodique("annee");

      console.log('GTA', __lastGTA);

      if (__lastGTA.length>0) {
        // fin de periode
        const last_fin = parseInt(__lastGTA[0].periode.split("|")[1]);

        console.log('fin de la période du GTA', last_fin, parseInt(end));

        // si la date de fin de la période du dernier GTA 
        // est antérieure à la date de fin de la dernière année
        if (last_fin < parseInt(end)) {
          console.log('date de fin de la période du GTA antérieure à la fin du dernier mois');
          // on va chercher les éventuels GTM créés entre les deux dates
          __GTM_query = {
            "$expr" : {
              "$and":[ 
                {"$type": "mois"},
                {"$gt" : [
                  {"$toDouble": 
                    {"$arrayElemAt":[
                      {"$split":["$periode","|"]}, 
                      1
                    ]}
                  },
                  last_fin
                ]},
                {"$lt" : [
                  {"$toDouble": 
                    {"$arrayElemAt":[
                      {"$split":["$periode","|"]}, 
                      1
                    ]}
                  }, 
                  parseInt(end)
                ]}
              ]
            }
          };
        } else {
          console.log('date de fin de la période du GTA n’est pas antérieure à la fin de la dernière année');
        }
      }
      // s'il n'y a pas de GTA avant cette année
      else {
        console.log('pas de GTA antérieur')
        // on va chercher tous les GTM antérieurs à l'année actuelle
        __GTM_query = {
          "$expr" : {
            "$and":[ 
              {"$type": "mois"},
              {"$lt" : [
                {"$toDouble": 
                  {"$arrayElemAt":[
                    {"$split":["$periode","|"]}, 
                    1
                  ]}
                }, 
                parseInt(end)
              ]}
            ]
          }
        };
      }

    } catch(e) {
      console.error('last GTA ERROR', e);
    }

    // on va chercher les GTM si besoin
    // et s'il y en a on crée un GTA avec
    if (__GTM_query) {
      console.log('on va chercher les GTM', __GTM_query);
      try {
        const liste_GTM = await clotureServices.getGTPeriodique(__GTM_query);
        if (liste_GTM.length>0) {
          dispatch(createGrandTotalPeriodique('annee',liste_GTM));
        }
      }
      catch(e) {
        console.error('liste GTM ERROR', e);
      }
    }
  }
}


export const clotureActions = {
  getLast,
  getCurrentPeriode,
  loadCloture,
  makeCloture,
  getGTP,
  updateGTP,
  createGrandTotalTicket,
  createGrandTotalPeriodique,
  getCloturesList,
  getBoundedClotures,
  setSyncedClotures,
  setClotureFromSync,
  getTodayCa,
  testGTPeriodique
};