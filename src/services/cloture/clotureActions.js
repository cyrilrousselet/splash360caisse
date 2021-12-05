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
import { format, set, sub } from 'date-fns';
import isBefore from 'date-fns/isBefore';
import { signatureActions } from '../signature/signatureActions';
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
    const {financier} = state.parametresReducer.parametres;

    const { user } = state.authentication;

  //  const { heure_fin } = entreprise;
  //  const __periode_bounds = dateBounds(new Date(), heure_fin);
  //  const periode_start = __periode_bounds.debut;

    // const { caisse } = options;

    // récup. cmd non clôturées

    const {commandeslist} = await commandeServices.getCommandesList({
      $and: [
        { archived: {"$exists": false} },
        { status: { $ne: "deleted" } },
        // { $or: [
        //   { "caisse_encaissement.id": caisse.id },
        //   { $and: [
        //     { "caisse.id": caisse.id },
        //     { status: { $in: ["standby", "a_encaisser"]} }
        //   ]},
        // ]},
        { $or: [
          { centre_revenu: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]}
      ]
    });

    const __gtt_ids = Object.values(commandeslist).map(c => c.ticket);
    const _gtt = await clotureServices.getGTTicket({ numeroTicket:{$in: __gtt_ids} });

    let tickets = {};
    _gtt.forEach((g) => {
      tickets[g.numeroTicket] = g; 
    });

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


    

    const {periode} = clotureServices.getCurrentPeriode(commandeslist, tickets, catalogue, params)
    dispatch({ type: clotureActionTypes.GET_CURRENT_PERIODE, periode });
  }
}



function  createZCaisse(cloture, intervalle, mode) {
  return async (dispatch, getState) => {

    const { zdecaisse } = getState().numerotationReducer;   
    const { caisse } = getState().parametresReducer.parametres.options;
    const { privateKey, trousseauId } = getState().signatureReducer; 
    const { periode } = cloture;
    const { user } = getState().authentication;
    console.log('createZCaisse', periode);

    try {
      const lastZ = await clotureServices.getLastZCaisse();

    } catch(e) {
      console.error('getLastZ Error', e);
      // dispatch({ type: clotureActionTypes.UPDATE_GTP_FAILURE, error:e });
    }


    let intervalleId = (intervalle==="intermediaire") ? 'I' : ((intervalle==="jour") ? 'J' : 'M');

    console.log('📅 DEBUT',periode.debut)
    console.log('📅 FIN',periode.fin)

    // chaine symbolisant le début de la fin des commandes
    const __periode = format(new Date(periode.debut), 'yyyyMMddHHmmss') + '|' + format(new Date(periode.fin), 'yyyyMMddHHmmss');


    const __editeur = (periode.editeur) ? periode.editeur : {nom: user.nom, user_id: user.user_id};

    let __zdecaisse = {
      zId: 'Z' + intervalleId + format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + zdecaisse.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false}),
      ztype: intervalle,
      comptage: cloture.comptage,
      ecarts: cloture.ecarts,
      periode: __periode,
      ca: periode.ca,
      caisses: periode.caisses,
      caisse: periode.caisse ? periode.caisse.id : null,
      depenses: periode.depenses,
      editeur: __editeur,
      emission: periode.emission,
      fdcaisse: periode.fdcaisse,
      mtcaisse: periode.mtcaisse,
      numtickets: periode.numtickets,
      paramfdcaisse: periode.paramfdcaisse,
      remboursements: periode.remboursements,
      ticket_moyen: periode.ticket_moyen,
      ventes: periode.ventes,
      ventilation: periode.ventilation,
      prelevement: cloture.prelevement,
      staffmeals: periode.staffmeals,
      createdAt: format(new Date(),"yyyy-MM-dd HH:mm:ss.SSS")
    }

    const lastSignature = await signatureServices.getLastSignature('zdecaisse');
    const {source, hash, signature} = signatureServices.getZdecaisseSignature({...__zdecaisse}, privateKey, lastSignature);
 

    __zdecaisse.source = source;
    __zdecaisse.hash = hash;
    __zdecaisse.signature = signature;
    __zdecaisse.trousseauId = trousseauId;

    try {
      await clotureServices.persistZCaisse(__zdecaisse);
      dispatch(peripheralActions.printZCaisse(__zdecaisse));

      dispatch( signatureActions.updateSignature('zdecaisse', signature) );
      dispatch( signatureActions.updateNumerotation('zdecaisse', zdecaisse+1) );

      if (mode==="auto") {
        if (intervalle==="intermediaire") {
          dispatch(testZCaisse('jour'));
        } else if (intervalle==="jour") {
          dispatch(testZCaisse('mois'));
        }
      }
    }
    catch(e) {
      console.error(e);
    }


  }
}

function getTodayCa() {
  return async (dispatch, getState) => {

    const state = getState();
    const {heure_fin} = state.parametresReducer.parametres.entreprise;
    const __periode_bounds = dateBounds(new Date(), heure_fin);
    const lastperiode_end = __periode_bounds.debut;


    const stats = await clotureServices.getTodayCa(lastperiode_end);
    const {ca, numtickets} = stats;
    dispatch({type: clotureActionTypes.GET_TODAY_CA, ca, numtickets})

  }
}


function loadCloture(clotureId) {
  
}

function makeCloture(params={}) {
  return async (dispatch, getState) => {

    console.log('makeCloture()',params);
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {financier, options} = state.parametresReducer.parametres;
    const { user } = state.authentication; 
    const cloture_id = getState().numerotationReducer.cloture;
    const { caisse } = getState().parametresReducer.parametres.options;
    
    let lastClotureTotal = null;
    // const newClotureId = 'CL' + (params.type==="auto" ? "A" : "M") + format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + cloture_id.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
    try {  
      const lastCloture = await clotureServices.getLast();
      if (lastCloture.clotureslist.length>0) {
        lastClotureTotal = Math.round(lastCloture.clotureslist[0].periode.ca * 100);
      }
    } catch(e) {
      console.error(e);
    }

  //  logger.info(commandeslist);

    const default_params =  {
      user: {id: user.id, nom: user.nom, user_id: user.user_id},
      caisse: options.caisse,
      vendeur: null,
      clotureId: 'CL' + (params.type==="auto" ? "A" : "M") + format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + cloture_id.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false}),
      reportca: lastClotureTotal,
      fdcaisse: financier.fonddecaisse_activation ? Number(financier.fonddecaisse_montant) : 0,
      // debut: startOfToday(),
      // fin: endOfToday(),
      extract: 'z'
    };

    params = {...default_params, ...params};
    

    const __default_query = {
      $and: [
        { archived: {"$exists": false} },
        { status: { $ne: "deleted" } },
        // { $or: [
        //   { "caisse_encaissement.id": params.caisse.id },
        //   { $and: [
        //     { "caisse.id": params.caisse.id },
        //     { status: { $in: ["standby", "a_encaisser"]} }
        //   ]},
        // ]},
        { makeCloture: {$exists: false}},
        { $or: [
          { centre_revenu: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]}
      ]
    };

    const query = (params.query) ? params.query : __default_query;

    
    // récup. cmd non clôturées
    const {commandeslist} = await commandeServices.getCommandesList(query);

    console.warn('makeCloture : commandeslist',commandeslist);

    if (commandeslist && Object.values(commandeslist).length>0) {

      // récup des Grands Totaux Tickets associés à chaque commande
      const __gtt_ids = Object.values(commandeslist).map(c => c.ticket);

      const _gtt = await clotureServices.getGTTicket({ numeroTicket:{$in: __gtt_ids} });

      let tickets = {};
      _gtt.forEach((g) => {
        tickets[g.numeroTicket] = g;
      });


      const cloture = clotureServices.makeCloture(commandeslist, tickets, catalogue, params)

      const __cloture = {...cloture, localsync: [options.caisse.uniqid]};

      clotureServices.saveCloture(__cloture)
        .then(
          data => {
            dispatch(commandeActions.archiveCommands({cmd:cloture.archivedcommandesid, clotureId:cloture.clotureId}));
            dispatch({ type: clotureActionTypes.MAKE_CLOTURE, cloture });
            dispatch(getLast());

            dispatch( signatureActions.updateNumerotation('cloture', cloture_id+1) );

            dispatch(notificationActions.syncDispatch('cloture', __cloture));

            dispatch(createZCaisse(cloture, (params.type==="auto" ? 'jour':'intermediaire'), params.type));
            
          }
        );

    } 
    // s'il n'y a aucune commande à clôturer...
    else {
      console.warn('!!! aucune commande à clôturer !!!');
      // si la cloture est commandée automatiquement,
      // on lance le test pour crée une synthèse, si besoin.
      if (params.type==="auto") {
        dispatch(testZCaisse('jour'));
      }
    }

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


function testCloturesAuto(intervalle) {
  return async (dispatch, getState) => {

    const __today =  new Date();
    let end;

    // si la date de test est après 5h00, la fin est today@5h00  
    end = set(__today, {hours:5});
    
    // si la date de test est avant 5h00, la fin est (today-1)@5h00
    if (isBefore(__today, set(__today,{hours:5}))) {
      end = set(sub(__today,{days:1}), {hours:5});
    }

    // suppression des commandes "standby" et "a_encaisser" du service précédent
    const __cmdnonconfirmees = await commandeServices.getCommandesList({
      $and: [
        {status: {$in:['standby','a_encaisser']}},
        {createdAt:{$lt:end.getTime()}}
      ]
    });

    if (__cmdnonconfirmees.hasOwnProperty('commandeslist') && __cmdnonconfirmees.commandeslist.length > 0) {
      const __cmdnonconfirmees_ids = Object.values(__cmdnonconfirmees.commandeslist).map(c => c.ticketId);

      let cmdnum = 0;

      await asyncForEach(__cmdnonconfirmees_ids, async (id) => {

        try{
          const __cmdabandon = await commandeServices.deleteCommande(id, "abandon avant cloture auto");
          if (__cmdabandon) cmdnum ++;
        } catch(e) {
          console.error(e);
          return false;
        }
        if(cmdnum===__cmdnonconfirmees_ids.length) return true;

      });
    }


    // lancement de la clôture automatique des commandes prises avant aujdh.
    dispatch( makeCloture({
      type:"auto", 
      query: {
        $and: [
          { status: {$in:['confirmed']} },
          { createdAt:{$lt:end.getTime()} },
          { archived: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]
      } 
    }) );

  }
}

function testZCaisse(intervalle) {

  return async (dispatch, getState) => {

    const __today =  new Date();
    let start;
    let end;

    console.log('testZCaisse('+intervalle+')');

    // -------------- Z de caisse Journalier (ZJ) -------------- 
    if (intervalle==="jour") {


      // si la date de test est après 5h00, le créneau de recherche correspond à [(today-1)@5h00 -> today@5h00]  
      start = format(sub(__today,{days:1}),'yyyyMMdd050000');
      end = format(__today,'yyyyMMdd050000');

      // si la date de test est avant 5h00, le créneau de recherche correspond à [(today-2)@5h00 -> (today-1)@5h00]
      if (isBefore(__today, set(__today,{hours:5}))) {
        start = format(sub(__today,{days:2}), 'yyyyMMdd050000');
        end = format(sub(__today,{days:1}), 'yyyyMMdd050000');
      }


      const __ZJ_query = {
        "$expr" : {
          "$and":[ 
            {"$eq":["$ztype", "jour"]},
            {"$gte" : [
              {"$toDouble": 
                {"$arrayElemAt":[
                  {"$split":["$periode","|"]}, 
                  0
                ]}
              },
              parseInt(start)
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

      // y a-t-il un ZJ pour hier ?
      const zj_hier = await clotureServices.getZCaisse(__ZJ_query);

      console.log('zj_hier', zj_hier);

      // s'il n'y en a pas, on lance sa création
      if (zj_hier.length<1) {

        console.log('il n’y a pas de ZJ pour hier');

        // récup ZI pour hier
        const __ZI_query = {
          "$expr" : {
            "$and":[ 
              {"$eq":["$ztype", "intermediaire"]},
              {"$gte" : [
                {"$toDouble": 
                  {"$arrayElemAt":[
                    {"$split":["$periode","|"]}, 
                    0
                  ]}
                },
                parseInt(start)
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
        const zi_hier = await clotureServices.getZCaisse(__ZI_query);

        const zj_synth = _getZSynthese(zi_hier, "jour");

        dispatch(createZCaisse(zj_synth, "jour", "auto"));

      } 
      // s'il y en a un, on lance le test mensuel
      else {

        console.log('il y a un ZJ pour hier, donc on lance le test mensuel');

        dispatch(testZCaisse('mois'));
      }
      
    }
    // -------------- Z de caisse Mensuel (ZM) -------------- 
    else if (intervalle==="mois") {

      start = format(set(sub(__today,{months:1}), {date:1}),'yyyyMMdd050000');
      end = format(sub(set(__today, {date:1}), {days:1}),'yyyyMMdd050000');

      const __ZM_query = {
        "$expr" : {
          "$and":[ 
            {"$eq":["$ztype", "mois"]},
            {"$gte" : [
              {"$toDouble": 
                {"$arrayElemAt":[
                  {"$split":["$periode","|"]}, 
                  0
                ]}
              },
              parseInt(start)
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

      // y a-t-il un ZM pour le mois dernier ?
      const zm_mois = await clotureServices.getZCaisse(__ZM_query);

      console.log('zm_mois',zm_mois);

      // s'il n'y en a pas, on lance sa création
      if (zm_mois.length<1) {

        console.log('Il n’y a pas de ZM pour le mois dernier')

        // récup ZJ pour hier
        const __ZJ_query = {
          "$expr" : {
            "$and":[ 
              {"$eq":["$ztype", "jour"]},
              {"$gte" : [
                {"$toDouble": 
                  {"$arrayElemAt":[
                    {"$split":["$periode","|"]}, 
                    0
                  ]}
                },
                parseInt(start)
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
        const zj_mois = await clotureServices.getZCaisse(__ZJ_query);

        const zm_synth = _getZSynthese(zj_mois, "mois");

        dispatch(createZCaisse(zm_synth, "mois", "auto"));

      } else {
        console.log('il y a un ZM pour le mois dernier, tout va bien, on s’arrête là !');
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
      console.error(e);
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
      console.error(e);
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
      console.error(e);
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
      // si le grandtotal est un GTPeriodique (ztype 'jour' ou 'mois')
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
      gttype: intervalle,
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

      dispatch( signatureActions.updateSignature('grandstotaux', signature) );
      dispatch( signatureActions.updateNumerotation('grandtotal', grandtotal+1) );

      // on lance le test sur l'intervalle supérieur
      // (qui est susceptible d'utiliser le GT periodique qu'on vient de créer...)
      if (confirm && intervalle==="jour") {
        dispatch(testGTPeriodique('mois'));
      }
      else if (confirm && intervalle==="mois") {
        dispatch(testGTPeriodique('annee'));
      }
    }
    catch(e) {
      console.error(e);
      dispatch({ type: clotureActionTypes.PERSIST_GTPERIODIQUE_FAILURE, error: e })
    }

  }
}


function testGTPeriodique(intervalle) {
  return async dispatch => {

    const __today =  new Date();
    let end;


    // -------------- Grand Total Journalier (GTM) -------------- 
    if (intervalle==="jour") {
      // y a-t-il un GTJ pour hier ?

      // si la date de test est après 5h00, le créneau de recherche correspond à [(today-1)@5h00 -> today@5h00]  
      end = format(__today,'yyyyMMdd050000');

      // si la date de test est avant 5h00, le créneau de recherche correspond à [(today-2)@5h00 -> (today-1)@5h00]
      if (isBefore(__today, set(__today,{hours:5}))) {
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
      // si on n'a besoin de créer de GTJ
      else {
        // on va tester l'intervalle plus grand ("mois")
        dispatch(testGTPeriodique('mois'));
      }
    }
    // -------------- Grand Total Mensuel (GTM) -------------- 
    else if (intervalle==="mois") {
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
                  {"$eq":["$gttype", "jour"]},
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
                {"$eq":["$gttype", "jour"]},
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
      // si on n'a aucun GTM à créer
      else {
        // on va tester l'intervalle plus grand ("année")
        dispatch(testGTPeriodique('annee'));
      }
    }
    // -------------- Grand Total Annuel (GTA) -------------- 
    else if (intervalle==="annee") {
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
                  {"$eq":["$gttype", "mois"]},
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
                {"$eq":["$gttype", "mois"]},
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
}

function _getZSynthese(zliste, type) {

  let __periode_debut = new Date();
  let __periode_fin = new Date();
  let __comptage = {};
  let __ecarts = {};
  let __prelevement = 0;
  let __ca = 0;
  let __caisses = [];
  let __caisse = null;
  let __depenses = 0;
  let __emission = 0;
  let __fdcaisse = 0;
  let __mtcaisse = 0;
  let __numtickets = 0;
  let __paramfdcaisse = 0;
  let __remboursements = 0;
  let __ticket_moyen = 0;
  let __ventes = 0;
  let __ventilation = {
    moyen: {},
    tva: {},
    vendeur: {},
    caisse: {},
  };
  let __staffmeals = null;

  zliste.forEach(z => {


    const p = z.periode.split('|');
    const debut = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);
    const fin = p[1].substring(0,4)+"-"+p[1].substring(4,6)+"-"+p[1].substring(6,8)+' '+p[1].substring(8,10)+':'+p[1].substring(10,12)+':'+p[1].substring(12,14);

    __periode_debut = isBefore(new Date(debut), __periode_debut) ? new Date(debut) : __periode_debut;
    __periode_fin = isBefore(new Date(fin), __periode_fin) ? __periode_fin :new Date(fin);


    __prelevement += z.prelevement;
    __ca += z.ca;
    __depenses += z.depenses;
    __emission += z.emission;
    __fdcaisse += z.fdcaisse;
    __mtcaisse += z.mtcaisse;
    __numtickets += z.numtickets;
    __paramfdcaisse += z.paramfdcaisse;
    __remboursements += z.remboursements;
    __ticket_moyen += z.ticket_moyen;
    __ventes += z.ventes;

    Object.entries(z.comptage).forEach(([moyen,valeur])=> {
      if (!__comptage.hasOwnProperty(moyen)) {
        __comptage[moyen] = 0;
      }
      __comptage[moyen] += valeur;
      __comptage[moyen] = Math.round(__comptage[moyen] * 100) / 100;
    });

    Object.entries(z.ecarts).forEach(([moyen,ecart])=> {
      if (ecart) {
        if (!__ecarts.hasOwnProperty(moyen)) {
          __ecarts[moyen] = {
            motif: ecart.mofif,
            valeur: 0
          }
        } else {
          __ecarts[moyen].motif += ', '+ecart.mofif;
        }
        __ecarts[moyen].valeur += ecart.valeur;
        __ecarts[moyen].valeur = Math.round(__ecarts[moyen].valeur * 100) / 100;
      }
    });
    
    Object.entries(z.ventilation.moyen).forEach(([moyen,ventil])=> {
      if (!__ventilation.moyen.hasOwnProperty(moyen)) {
        __ventilation.moyen[moyen] = {
          moyen: ventil.moyen,
          valeur: 0
        };
      }
      __ventilation.moyen[moyen].valeur += ventil.valeur;
      __ventilation.moyen[moyen].valeur = Math.round(__ventilation.moyen[moyen].valeur * 100) / 100;
    });
    
    Object.entries(z.ventilation.tva).forEach(([taux,tva])=> {
      if (!__ventilation.tva.hasOwnProperty(taux)) {
        __ventilation.tva[taux] = {
          taux: tva.taux,
          ttc: 0,
          ht: 0,
          taxe: 0
        };
      }
      __ventilation.tva[taux].ttc += Math.round(tva.ttc);
      __ventilation.tva[taux].ht += Math.round(tva.ht);
      __ventilation.tva[taux].taxe += Math.round(tva.taxe);
    });
    
    Object.entries(z.ventilation.vendeur).forEach(([id,vendeur])=> {
      if (!__ventilation.vendeur.hasOwnProperty(id)) {
        __ventilation.vendeur[id] = {
          id: vendeur.id,
          nom: vendeur.nom,
          ventes: 0,
          remboursements: 0
        };
      }
      __ventilation.vendeur[id].ventes += Math.round(vendeur.ventes);
      __ventilation.vendeur[id].remboursements += Math.round(vendeur.remboursements);
    });
    
    Object.entries(z.ventilation.caisse).forEach(([id,caisse])=> {
      if (!__ventilation.caisse.hasOwnProperty(id)) {
        __ventilation.caisse[id] = {
          id: caisse.id,  
          nom: caisse.nom,
          ca: 0
        };
      }
      __ventilation.caisse[id].ca += Math.round(caisse.ca);
    });

  });



  return {
    comptage: __comptage,
    ecarts: __ecarts,
    prelevement: __prelevement,
    periode: {
      debut: format(__periode_debut, 'yyyy-MM-dd HH:mm:ss.SSS'),
      fin: format(__periode_fin, 'yyyy-MM-dd HH:mm:ss.SSS'),
      ca: __ca,
      caisses: __caisses,
      caisse: __caisse,
      depenses: __depenses,
      editeur: null,
      emission: __emission,
      fdcaisse: __fdcaisse,
      mtcaisse: __mtcaisse,
      numtickets: __numtickets,
      paramfdcaisse: __paramfdcaisse,
      remboursements: __remboursements,
      ticket_moyen: __ticket_moyen,
      ventes: __ventes,
      ventilation: __ventilation,
      staffmeals: __staffmeals
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
  testCloturesAuto,
  testZCaisse,
  testGTPeriodique
};