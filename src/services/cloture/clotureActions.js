import { clotureActionTypes } from './clotureActionTypes';
import { clotureServices } from './clotureServices';
import { commandeActions } from '../commande/commandeActions';
import { peripheralActions } from '../peripheral/peripheralActions';
import {remote} from 'electron';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
// import Swal from 'sweetalert2';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import { commandeServices } from '../commande/commandeServices';
import { dateBounds, asyncForEach } from '../../helpers/toolbox';
import { notificationActions } from '../notification/notificationActions';
import { signatureServices } from '../signature/signatureServices';
import { format, set, sub, isBefore } from 'date-fns';
import { signatureActions } from '../signature/signatureActions';
import { journalActions } from '../journal/journalActions';
import Swal from 'sweetalert2';
import { marketingServices } from '../marketing/marketingServices';
import { tresorServices } from '../tresorerie/tresorServices';
import { last, dropRight } from 'lodash';
import { ungzip } from 'node-gzip';
import packageJson from '../../../package.json';
import { signatureActionTypes } from '../signature/signatureActionTypes';
// import {statSync} from 'fs';

const strings = new LocalizedStrings(data);
const {app} = remote;
const fs = require('fs').promises;

// const logger = new Logger();

const COMPTE_COMPTABLE = {
  'ht1000':  {id: 7071000, intitule:'VENTES HT MAGASIN 10%'},
  'ht2000':  {id: 7072000, intitule:'VENTES HT MAGASIN 20%'},
  'ht0550':  {id: 7070550, intitule:'VENTES HT MAGASIN 5,5%'},
  'tva1000': {id: 4457110, intitule:'TVA COLLECTEE 10%'},
  'tva2000': {id: 4457120, intitule:'TVA COLLECTEE 20%'},
  'tva0550': {id: 4457105, intitule:'TVA COLLECTEE 5,5%'},
  'carte':   {id: 5111000, intitule:'CB A ENCAISSER'},
  'ticket':  {id: 5112000, intitule:'TICKET RESTAURANT'},
  'cheque':  {id: 5113000, intitule:'CHEQUE BANCAIRE'},
  'avoir':   {id: 5114000, intitule:'AVOIR A ENCAISSER'},
  'especes': {id: 5300000, intitule:'ESPECES'},
  'ecart':   {id: 6580000, intitule:'ECART DE CAISSE'},
}

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


function checkZCaisse() {
  return async (dispatch, getState) => {

    const { privateKey } = getState().signatureReducer; 
    const { caisse } = getState().parametresReducer.parametres.options;

    if (caisse) {
      try {
        const zcliste = await clotureServices.getZCaisse({},50);
        
        let integ_error = false;
        let seq_error = false;
        let prevNIDnum = null;
        let prevSign = null;
        let integ_detection = [];
        let seq_detection = [];

        zcliste.forEach(zc => {
          if (prevSign) {
            const { signature } = signatureServices.createZdecaisseSignature({...zc}, privateKey, prevSign); 
            if (signature !== zc.signature) {
              integ_error = true;
              integ_detection = [...integ_detection, zc.zId];
            }
            const NIDnum = parseInt(zc.zId.split('-')[2]);
            
            if (NIDnum !== (prevNIDnum - 1)) {
              seq_error = true;
              seq_detection = [...seq_detection, zc.zId];
            }
          }
          prevSign = zc.signature;
          prevNIDnum = parseInt(zc.zId.split('-')[2]);
        });
    
        if (integ_error) {
          dispatch({ type: signatureActionTypes.INTEGRITE_ERROR, detail: "Z de Caisse" });
          dispatch(journalActions.log('90', `détecté dans Z de Caisse : ${integ_detection.join(', ')}`));
        }
        if (seq_error) {
          dispatch({ type: signatureActionTypes.SEQUENCE_ERROR, detail: "Z de Caisse" });
          dispatch(journalActions.log('95', `détecté dans Z de Caisse : ${seq_detection.join(', ')}`));
        }



      }
      catch(e) {
        console.error(e);
      }
    }

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
    const {source, hash, signature} = signatureServices.createZdecaisseSignature({...__zdecaisse}, privateKey, lastSignature);
 

    __zdecaisse.source = source;
    __zdecaisse.hash = hash;
    __zdecaisse.signature = signature;
    __zdecaisse.trousseauId = trousseauId;

    try {
      await clotureServices.persistZCaisse(__zdecaisse);
      dispatch(peripheralActions.printZCaisse(__zdecaisse));

      dispatch(journalActions.log('50', intervalle));
      dispatch(journalActions.log('160', 'Z de Caisse #'+__zdecaisse.zId));

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
      user: user ? {id: user.id, nom: user.nom, user_id: user.user_id}: 'auto',
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

      const _gtt = await clotureServices.getGTTicket({ 'ENC-GTT-ORI-NUM':{$in: __gtt_ids} });

      let tickets = {};
      _gtt.forEach((g) => {
        tickets[g['ENC-GTT-ORI-NUM']] = g;
      });


      const cloture = clotureServices.makeCloture(commandeslist, tickets, catalogue, params);

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
            dispatch({ type: clotureActionTypes.CHECK_NOCOMPLETED_COMMANDS, blocage: false});
            
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


function testCloturesAuto() {
  return async (dispatch, getState) => {

    console.log('testCloturesAuto()');

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
    console.log('__cmdnonconfirmees',__cmdnonconfirmees);

    if (__cmdnonconfirmees.hasOwnProperty('commandeslist') && Object.values(__cmdnonconfirmees.commandeslist).length > 0) {
      const __cmdstandby_ids = Object.values(__cmdnonconfirmees.commandeslist).filter(cmd => cmd.status==="standby").map(c => c.ticketId);
      const __cmdaencaisser = Object.values(__cmdnonconfirmees.commandeslist).filter(cmd => cmd.status==="a_encaisser");

      if (__cmdaencaisser.length>0) {
        console.log('il y a des commandes à encaisser : impossible de faire la clôture auto -> on bloque la caisse');
        dispatch({ type: clotureActionTypes.CHECK_NOCOMPLETED_COMMANDS, blocage: true});
      } else {
        dispatch({ type: clotureActionTypes.CHECK_NOCOMPLETED_COMMANDS, blocage: false});
      }

      console.log('commandes en attente à supprimer (service passé) => ',__cmdstandby_ids, end);


      let cmdnum = 0;

      await asyncForEach(__cmdstandby_ids, async (id) => {

        try{
          const __cmdabandon = await commandeServices.deleteCommande(id, "abandon avant cloture auto");
          if (__cmdabandon) cmdnum ++;
        } catch(e) {
          console.error(e);
          return false;
        }
        if(cmdnum===__cmdstandby_ids.length) return true;

      });
    }
    else {
      console.log('aucune commande inachevée dans un service passé', end);
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

function getZCaisse(params) {
  return async (dispatch, getState) => {
    dispatch({ type: clotureActionTypes.GET_ZCAISSE_REQUEST, criterias:params });

    try {

      const data = await clotureServices.getZCaisse(params);      
      dispatch({ type: clotureActionTypes.GET_ZCAISSE_SUCCESS, zcaisse: [...data] }) 

    } catch(error) { 

      logger.error(error);
      dispatch({ type: clotureActionTypes.GET_ZCAISSE_FAILURE, error: error.toString() }) 
   
    }
  }
}

function testZCaisse(intervalle) {

  return async (dispatch, getState) => {

    const __today =  new Date();
    let start;
    let end;

    console.trace('testZCaisse('+intervalle+')');

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

      try {
        // récup le dernier Z de caisse intermédiaire
        const __lastZI = await clotureServices.getLastZCaisse({
          "$expr" : {
            "$and":[ 
              {"$eq":["$ztype", "intermediaire"]},
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
        });
      

        console.log('__lastZI', __lastZI);

      } catch(e) {
        console.error(e);
      }



      console.log('testZCaisse, jour', start, end);
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

        console.log('TZC zi_hier',zi_hier);

        if (zi_hier.length>0) {
          const zj_synth = _getZSynthese(zi_hier, "jour");
          dispatch(createZCaisse(zj_synth, "jour", "auto"));
        }
        else {
          console.log('TZC jour : pas de ZCaisse pour ce jour, on lance le test pour le mois');
          dispatch(testZCaisse('mois'));
        }

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

      console.log('testZCaisse, jour', start, end);

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

      console.log('TZC zm_mois',zm_mois);

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

        console.log('TZC zj_mois',zj_mois);
        if (zj_mois.length>0) {
          const zm_synth = _getZSynthese(zj_mois, "mois");
          dispatch(createZCaisse(zm_synth, "mois", "auto"));
        } else {
          console.log('aucun ZJ pour faire le Z du mois, on s’arrête là !');
        }

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


// function checkGrandTotalTicket() {
//   return async (dispatch, getState) => {

//     const { privateKey } = getState().signatureReducer; 

//     try {
//       const gttlist = await clotureServices.getGTTicket({},50);
      
//       let integ_error = false;
//       let seq_error = false;
//       let prevNIDnum = null;
//       let prevSign = null;
//       let integ_detection = [];
//       let seq_detection = [];


//       asyncForEach(gttlist, async (gtt) => {
//         if (prevSign) {

//           const commande = await commandeServices.getCommandesList({ticket:{$eq:gtt['ENC-GTT-ORI-NUM']}})

//           const {signature} = signatureServices.createGrandtotalSignature() ({...source_signature, type:"periode"}, gtp['ENC-GTP-PER-TTC'], privateKey, prevSign);
 

//           if (signature !== gtp['ENV-GTP-TAG-SIG']) {
//             integ_error = true;
//             integ_detection = [...integ_detection, gtp['ENC-GTP-ORI-NID']];
//           }
//           const NIDnum = parseInt(gtp['ENC-GTP-ORI-NID'].split('-')[2]);
          
//           if (NIDnum !== (prevNIDnum - 1)) {
//             seq_error = true;
//             seq_detection = [...seq_detection, gtp['ENC-GTP-ORI-NID']];
//           }
//         }
//         prevSign = gtp['ENV-GTP-TAG-SIG'];
//         prevNIDnum = parseInt(gtp['ENC-GTP-ORI-NID'].split('-')[2]);
//       });
  
//       if (integ_error) {
//         dispatch(journalActions.log('90', `détecté dans Grands Totaux Periodiques : ${integ_detection.join(', ')}`));
//       }
//       if (seq_error) {
//         dispatch(journalActions.log('95', `détecté dans Grands Totaux Periodiques : ${seq_detection.join(', ')}`));
//       }



//     }
//     catch(e) {
//       console.error(e);
//     }

//   }
// }

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
      'ENC-GTT-ORI-NUM': commande.ticket,
      'ENC-GTT-MTN-TVA-TTC': __tva_ttc.join('|'),
      'ENC-GTT-MTN-TVA-HT': __tva_ht.join('|'),
      'ENC-GTT-MTN-TVA-TAUX': __tva_taxe.join('|'),
      'ENC-GTT-TTC': __total_ttc,
      'ENC-GTT-HT': __total_ht,
      'ENC-GTT-PER-TTC': __gtp.gtpca,
      'ENC-GTT-PER-TTC-ABS': __gtp.gtpva,
      'ENC-GTT-HOR-GDH': format(new Date(commande.createdAt), 'yyyyMMddHHmmss'),
      'ENC-GTT-ARG': commande.hashsource,
      'ENC-GTT-HASH': commande.hash,
      'ENC-GTT-ID-KEY': trousseauId,
      'ENC-GTT-TAG-SIG': commande.signature
    };

    console.log('gtt',__gtt);

    // const __gtt = {
    //   numeroTicket: commande.ticket,
    //   tva_ttc: __tva_ttc.join('|'),
    //   tva_ht: __tva_ht.join('|'),
    //   tva_taxe: __tva_taxe.join('|'),
    //   total_ttc: __total_ttc,
    //   total_ht: __total_ht,
    //   gtpca: __gtp.gtpca,
    //   gtpva: __gtp.gtpva,
    //   createdAt: format(new Date(commande.createdAt), 'yyyyMMddHHmmss'),
    //   source_hash: commande.hashsource,
    //   hash_ticket: commande.hash,
    //   trousseauId: trousseauId,
    //   signature_ticket: commande.signature
    // };

    try {
      await clotureServices.persistGTTicket(__gtt);
      dispatch({ type: clotureActionTypes.PERSIST_GTTICKET_REQUEST, gtt: __gtt });
      dispatch(journalActions.log('160', 'Grand Total Ticket #'+__gtt['ENC-GTT-ORI-NUM']));
    }
    catch(e) {
      console.error(e);
      dispatch({ type: clotureActionTypes.PERSIST_GTTICKET_FAILURE, error: e })
    }

  }
}



function checkGrandTotalPeriodique() {
  return async (dispatch, getState) => {

    const { privateKey } = getState().signatureReducer; 
    const { caisse } = getState().parametresReducer.parametres.options;

    if (caisse) {

      try {
        const gtplist = await clotureServices.getGTPeriodique({},50);
        
        let integ_error = false;
        let seq_error = false;
        let prevNIDnum = null;
        let prevSign = null;
        let integ_detection = [];
        let seq_detection = [];

        gtplist.forEach(gtp => {
          if (prevSign) {


            const source_signature = {
              tva: gtp['ENC-GTP-MTN-TVA-TTC'],
              ttc: gtp['ENC-GTP-MTN-TVA-HT'],
              periode: gtp['ENC-GTP-ORI-NUM']
            }


            const {signature} = signatureServices.createGrandtotalSignature({...source_signature, type:"periode"}, gtp['ENC-GTP-PER-TTC'], privateKey, prevSign);
  

            if (signature !== gtp['ENV-GTP-TAG-SIG']) {
              integ_error = true;
              integ_detection = [...integ_detection, gtp['ENC-GTP-ORI-NID']];
            }
            const NIDnum = parseInt(gtp['ENC-GTP-ORI-NID'].split('-')[2]);
            
            if (NIDnum !== (prevNIDnum - 1)) {
              seq_error = true;
              seq_detection = [...seq_detection, gtp['ENC-GTP-ORI-NID']];
            }
          }
          prevSign = gtp['ENV-GTP-TAG-SIG'];
          prevNIDnum = parseInt(gtp['ENC-GTP-ORI-NID'].split('-')[2]);
        });
    
        if (integ_error) {
          dispatch({ type: signatureActionTypes.INTEGRITE_ERROR, detail: "Grands Totaux Periodiques" });
          dispatch(journalActions.log('90', `détecté dans Grands Totaux Periodiques : ${integ_detection.join(', ')}`));
        }
        if (seq_error) {
          dispatch({ type: signatureActionTypes.SEQUENCE_ERROR, detail: "Grands Totaux Periodiques" });
          dispatch(journalActions.log('95', `détecté dans Grands Totaux Periodiques : ${seq_detection.join(', ')}`));
        }



      }
      catch(e) {
        console.error(e);
      }
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
    const { caisse } = getState().parametresReducer.parametres.options;
    const { privateKey, trousseauId } = getState().signatureReducer; 
    
    const {gtpca, gtpva} = await clotureServices.getGTP();


    let key = privateKey;
    let keyid = trousseauId;
    
    // let create_trousseau = null;
    if (!privateKey) {
      const trousseau = await signatureServices.checkAndCreateKeys();
      dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, ...trousseau });
      // create_trousseau = trousseau.create;
      key = trousseau.privateKey;
      keyid = trousseau.trousseauId;
    }



    let __tva_ttc = {};
    let __tva_ht = {};
    let __tva_taxe = {};
    let __total_ttc = 0
    let __total_ht = 0;
    let __start = null;
    let __end = null;


    grandstotaux.forEach(gt => {

      const gttype = gt.hasOwnProperty('gttype') ? 'GTP' : 'GTT';

      // tva ttc
      const gt_tvattc = gt[`ENC-${gttype}-MTN-TVA-TTC`].split('|');
      gt_tvattc.forEach(t => {
        let cpl = t.split(':');
        if (!__tva_ttc.hasOwnProperty(cpl[0])) __tva_ttc[cpl[0]] = 0;
        __tva_ttc[cpl[0]] += parseInt(cpl[1]);
      });

      // tva ht
      const gt_tvaht = gt[`ENC-${gttype}-MTN-TVA-HT`].split('|');
      gt_tvaht.forEach(t => {
        let cpl = t.split(':');
        if (!__tva_ht.hasOwnProperty(cpl[0])) __tva_ht[cpl[0]] = 0;
        __tva_ht[cpl[0]] += parseInt(cpl[1]);
      });

      // tva taxe
      const gt_tvataxe = gt[`ENC-${gttype}-MTN-TVA-TAUX`].split('|');
      gt_tvataxe.forEach(t => {
        let cpl = t.split(':');
        if (!__tva_taxe.hasOwnProperty(cpl[0])) __tva_taxe[cpl[0]] = 0;
        __tva_taxe[cpl[0]] += parseInt(cpl[1]);
      });

      __total_ttc += gt[`ENC-${gttype}-TTC`];
      __total_ht += gt[`ENC-${gttype}-HT`];


      let __evalstart, __evalend;
      // si le grandtotal est un GTPeriodique (ztype 'jour' ou 'mois')
      if (gttype === 'GTP') {

        let periode_ar = gt['ENC-GTP-ORI-NUM'].split('|');
        __evalstart = parseInt(periode_ar[0]);
        __evalend = parseInt(periode_ar[1]);

      } 
      // si le grandtotal est un GTTicket
      else {
        __evalstart = parseInt(gt['ENC-GTT-HOR-GDH']);
        __evalend = parseInt(gt['ENC-GTT-HOR-GDH']);
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


    const lastSignature = await signatureServices.getLastSignature('grandstotaux_'+intervalle);
    const newTicket = 'GTP'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + grandtotal.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
    const {source, hash, signature} = signatureServices.createGrandtotalSignature({...source_signature, type:"periode"}, gtpca, key, lastSignature);
 

    const __grandtotalperiodique = {
      gttype: intervalle,
      'ENC-GTP-ORI-NID': newTicket,
      'ENC-GTP-ORI-NUM': __start_str+'|'+__end_str,
      'ENC-GTP-MTN-TVA-TTC': __alltva_ttc.join('|'),
      'ENC-GTP-MTN-TVA-HT': __alltva_ht.join('|'),
      'ENC-GTP-MTN-TVA-TAUX': __alltva_taxe.join('|'),
      'ENC-GTP-TTC': __total_ttc,
      'ENC-GTP-HT': __total_ht,
      'ENC-GTP-PER-TTC': gtpca,
      'ENC-GTP-PER-TTC-ABS': gtpva,
      'ENC-GTP-HOR-GDH': format(new Date(), 'yyyyMMddHHmmss'),
      'ENC-GTP-ARG': source,
      'ENC-GTP-HASH': hash,
      'ENV-GTP-ID-KEY': keyid,
      'ENV-GTP-TAG-SIG': signature
    };
    // const __grandtotalperiodique = {
    //   gttype: intervalle,
    //   grandtotal_id: newTicket,
    //   periode: __start_str+'|'+__end_str,
    //   tva_ttc: __alltva_ttc.join('|'),
    //   tva_ht: __alltva_ht.join('|'),
    //   tva_taxe: __alltva_taxe.join('|'),
    //   total_ttc: __total_ttc,
    //   total_ht: __total_ht,
    //   gtpca: gtpca,
    //   gtpva: gtpva,
    //   createdAt: format(new Date(), 'yyyyMMddHHmmss'),
    //   source_hash: source,
    //   hash: hash,
    //   trousseauId: trousseauId,
    //   signature: signature
    // };

    try {
      const confirm = await clotureServices.persistGTPeriodique(__grandtotalperiodique);
      dispatch({ type: clotureActionTypes.PERSIST_GTPERIODIQUE_SUCCESS, gtp: __grandtotalperiodique });

      dispatch(journalActions.log('160', `Grand Total Periodique (${intervalle}) #${__grandtotalperiodique['ENC-GTP-ORI-NID']}`));

      dispatch( signatureActions.updateSignature('grandstotaux_'+intervalle, signature) );
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


function testGTPeriodique(intervalle='jour') {
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
          const last_fin = parseInt(__lastGTJ[0]['ENC-GTP-ORI-NUM'].split("|")[1]);

          console.log('fin de la période du GTJ', last_fin, parseInt(end));

          // si la date de fin de la période du dernier GTJ 
          // est antérieure à la date de fin du dernier service
          if (last_fin < parseInt(end)) {
            console.log('date de fin de la période du GTJ antérieure à la fin du dernier service');
            // on va chercher les éventuels GTTickets créés entre les deux dates
            __GTT_query = {
              "$expr" : {
                "$and":[ 
                  {"$gt" : [{"$toDouble": "$ENC-GTT-HOR-GDH"} , last_fin]},
                  {"$lt" : [{"$toDouble": "$ENC-GTT-HOR-GDH"} , parseInt(end)]}
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
          __GTT_query = {"$expr" : {"$lt" : [{"$toDouble" :"$ENC-GTP-HOR-GDH"} , parseInt(end)]}};
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
          const last_fin = parseInt(__lastGTM[0]['ENC-GTP-ORI-NUM'].split("|")[1]);

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
                        {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
                        1
                      ]}
                    },
                    last_fin
                  ]},
                  {"$lt" : [
                    {"$toDouble": 
                      {"$arrayElemAt":[
                        {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
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
                      {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
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
          const last_fin = parseInt(__lastGTA[0]['ENC-GTP-ORI-NUM'].split("|")[1]);

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
                        {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
                        1
                      ]}
                    },
                    last_fin
                  ]},
                  {"$lt" : [
                    {"$toDouble": 
                      {"$arrayElemAt":[
                        {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
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
                      {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
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

function getArchivesFiscales() {
  return async dispatch => {
    dispatch({ type: clotureActionTypes.GET_ARCHIVE_FISCALE_REQUEST });

    try {
      const archives = await clotureServices.getArchiveFiscale();
      dispatch({ type: clotureActionTypes.GET_ARCHIVE_FISCALE_SUCCESS, archives: [...archives] });
    } catch(e) {
      dispatch({ type: clotureActionTypes.GET_ARCHIVE_FISCALE_FAILURE, error: e });
    }
  }
}

function checkArchive(filename) {
  return async (dispatch, getState) => {
    const { privateKey } = getState().signatureReducer; 
    const { archives_fiscales } = getState().clotureReducer; 

    const afdata = archives_fiscales.find(a => a['TAG-ARC-DOC']===filename);

    if (!afdata) return console.error('fichier introuvable en base');

    let __afcont;
    try {
      __afcont = await fs.readFile(`${app.getPath('userData')}/archives_fiscales/${filename}`);
    } catch(e) {
      return console.error(e);
    }
    if (__afcont) {

      const { hmac, signature } = await signatureServices.createSignature(__afcont.toString(), privateKey); 

      console.log('fichier',hmac);
      console.log('base',afdata['TAG-ARC-HASH']);

      // const isVerif = signatureServices.verifyBuffer(__afcont, afdata['TAG-ARC-SIG'], publicKey);
      // const isVerif = hmac===afdata['TAG-ARC-HASH'];
      const isVerif = signature===afdata['TAG-ARC-SIG'];
      dispatch({ type: clotureActionTypes.QUALIFY_ARCHIVE_FISCALE, archive: {...afdata, verif: isVerif} });
    }


  }
}


function archiveFiscale(intervalle, debut, fin) {
  return async (dispatch, getState) => {


    const { privateKey, trousseauId } = getState().signatureReducer; 
    const { caisse, archive_secret } = getState().parametresReducer.parametres.options;
    const { user } = getState().authentication;

    let __startdefacto = null;
    let __enddefacto = null;

    let __int = 'A';
    let __periode = format(debut, 'yyyy');
    if (intervalle==="jour") {
      __int = 'J';
      __periode = format(debut, 'yyyyMMdd')
    }
    else if (intervalle==="mois") {
      __int = 'M';
      __periode = format(debut, 'yyyyMM')
    }

    let fileNameRad = `${format(new Date(), 'yyMMddHHmmss')}_FA${__int}-${__periode}`;

    let fileName = fileNameRad+'.zip';

    // for (let num=0; statSync(`${app.getPath('userData')}/archives_fiscales/${fileName}`); num++) {
    //   fileName = fileNamerad+'-'+num+'.zip';
    // }

    const start = format(debut, 'yyyyMMdd050000');
    const end = format(fin, 'yyyyMMdd050000');


    // TEST PREALABLE
    // y a-t-il des commandes non clôturées dans la période à archiver ?
    const cmdnonarchivees = await commandeServices.getCommandesList({
      $and: [
        { createdAt: {$gte: debut.getTime()} },
        { createdAt: {$lt: fin.getTime()} },
        { status: 'confirmed' },
        { archived: {$exists: false} }
      ]
    });

    if (Object.values(cmdnonarchivees.commandeslist).length>0) {
      Swal.fire({
        title: strings.modules.parametres.submodules.fiscal.archive.alerte.commandes.titre,
        html: strings.modules.parametres.submodules.fiscal.archive.alerte.commandes.texte
      });
      dispatch({type: clotureActionTypes.ARCHIVE_FISCALE_FAILURE, error: 'commandes non clôturées'});
      return false;
    }

    let __purge = {
      gtt: [],
      gtp: [],
      zc: [],
      tickets: [],
      duplicatas: [],
      commandes: [],
      clotures: [],
      avoirs: [],
      tresors: [],
      jet: [],
    };
    let __data = [];

    // EXPORT DES DONNEES
    // ------------> GTTickets
    const __GTT_query = {
      "$expr" : {
        "$and":[ 
          {"$gte" : [{"$toDouble": "$ENC-GTT-HOR-GDH"} , parseInt(start)]},
          {"$lt" : [{"$toDouble": "$ENC-GTT-HOR-GDH"} , parseInt(end)]}
        ]
      }
    };
    const gttlist = await clotureServices.getGTTicket(__GTT_query);

    // fichier JSON
    __data.push({type: 'json', data: JSON.stringify(gttlist), file: 'grandtotauxtickets.json'});


    // ajout des ID de GTT à purger
    __purge.gtt = gttlist.map(gtt => gtt['ENC-GTT-ORI-NUM'] );

    // fichier CSV
    const gttCsvString = [
      [
        'ENC-GTT-ORI-NUM',
        'ENC-GTT-MTN-TVA-TTC',
        'ENC-GTT-MTN-TVA-HT',
        'ENC-GTT-MTN-TVA-TAUX',
        'ENC-GTT-TTC',
        'ENC-GTT-HT',
        'ENC-GTT-PER-TTC',
        'ENC-GTT-PER-TTC-ABS',
        'ENC-GTT-HOR-GDH',
        'ENC-GTT-ARG',
        'ENC-GTT-HASH',
        'ENC-GTT-ID-KEY',
        'ENC-GTT-TAG-SIG'
      ],
      ...gttlist.map(gtt => [
        gtt['ENC-GTT-ORI-NUM'],
        gtt['ENC-GTT-MTN-TVA-TTC'],
        gtt['ENC-GTT-MTN-TVA-HT'],
        gtt['ENC-GTT-MTN-TVA-TAUX'],
        gtt['ENC-GTT-TTC'],
        gtt['ENC-GTT-HT'],
        gtt['ENC-GTT-PER-TTC'],
        gtt['ENC-GTT-PER-TTC-ABS'],
        gtt['ENC-GTT-HOR-GDH'],
        gtt['ENC-GTT-ARG'],
        gtt['ENC-GTT-HASH'],
        gtt['ENC-GTT-ID-KEY'],
        gtt['ENC-GTT-TAG-SIG']
      ])
    ]
     .map(e => e.join(";")) 
     .join("\n");

    __data.push({type: 'csv', data: gttCsvString, file: 'grandtotauxtickets.csv'});


    // ------------> GTPeriodiques
    const __GTP_query = {
      "$expr" : {
        "$and":[ 
          {"$gte" : [
            {"$toDouble": 
              {"$arrayElemAt":[
                {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
                0
              ]}
            }, 
            parseInt(start)
          ]},
          {"$lt" : [
            {"$toDouble": 
              {"$arrayElemAt":[
                {"$split":["$ENC-GTP-ORI-NUM","|"]}, 
                1
              ]}
            }, 
            parseInt(end)
          ]}
        ]
      }
    };
    const gtplist = await clotureServices.getGTPeriodique(__GTP_query);

    // fichier JSON
    __data.push({type: 'json', data: JSON.stringify(gtplist), file: 'grandtotauxperiodiques.json'});


    // ajout des ID de GTP à purger
    __purge.gtp = gtplist.map(gtp => gtp['ENC-GTP-ORI-NID'] );

    // fichier CSV
    const gtpCsvString = [
      [
        'gttype',
        'ENC-GTP-ORI-NID',
        'ENC-GTP-ORI-NUM',
        'ENC-GTP-MTN-TVA-TTC',
        'ENC-GTP-MTN-TVA-HT',
        'ENC-GTP-MTN-TVA-TAUX',
        'ENC-GTP-TTC',
        'ENC-GTP-HT',
        'ENC-GTP-PER-TTC',
        'ENC-GTP-PER-TTC-ABS',
        'ENC-GTP-HOR-GDH',
        'ENC-GTP-ARG',
        'ENC-GTP-HASH',
        'ENV-GTP-ID-KEY',
        'ENV-GTP-TAG-SIG' 
      ],
      ...gtplist.map(gtp => [
        gtp.gttype,
        gtp['ENC-GTP-ORI-NID'],
        gtp['ENC-GTP-ORI-NUM'],
        gtp['ENC-GTP-MTN-TVA-TTC'],
        gtp['ENC-GTP-MTN-TVA-HT'],
        gtp['ENC-GTP-MTN-TVA-TAUX'],
        gtp['ENC-GTP-TTC'],
        gtp['ENC-GTP-HT'],
        gtp['ENC-GTP-PER-TTC'],
        gtp['ENC-GTP-PER-TTC-ABS'],
        gtp['ENC-GTP-HOR-GDH'],
        gtp['ENC-GTP-ARG'],
        gtp['ENC-GTP-HASH'],
        gtp['ENV-GTP-ID-KEY'],
        gtp['ENV-GTP-TAG-SIG']
      ])
    ]
     .map(e => e.join(";")) 
     .join("\n");

    __data.push({type: 'csv', data: gtpCsvString, file: 'grandtotauxperiodiques.csv'});


    // ------------>  ZCaisse 
    const __ZC_query = {
      "$expr" : {
        "$and":[ 
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
    const zclist = await clotureServices.getZCaisse(__ZC_query);

    console.log('zclist',zclist);
    if (zclist) {
      // fichier JSON
      __data.push({type: 'json', data: JSON.stringify(zclist), file: 'zdecaisse.json'});



    // ajout des ID de Z de Caisse à purger
    __purge.zc = zclist.map(zc => zc.zId );

      // fichier CSV
      const zcCsvString = [
        [
          "zId",
          "ztype",
          "comptage_total",
          "comptage_especes",
          "comptage_carte",
          "comptage_ticket",
          "comptage_cheque",
          "comptage_avoir",
          "ecarts_especes",
          "ecarts_especes_motif",
          "ecarts_carte",
          "ecarts_carte_motif",
          "ecarts_ticket",
          "ecarts_ticket_motif",
          "ecarts_cheque",
          "ecarts_cheque_motif",
          "ecarts_avoir",
          "ecarts_avoir_motif",
          "periode",
          "ca",
          "caisse",
          "depenses",
          "editeur_id",
          "editeur_nom",
          "editeur_user_id",
          "emission",
          "fdcaisse",
          "mtcaisse",
          "numtickets",
          "paramdfcaisse",
          "remboursements",
          "ticket_moyen",
          "ventes",
          "ventilation_moyen",
          "ventilation_tva_ttc",
          "ventilation_tva_ht",
          "ventilation_tva_taxe",
          "ventilation_vendeur",
          "ventilation_caisse",
          "prelevement",
          "staffmeals",
          "createdAt",
          "source",
          "hash",
          "signature",
          "trousseauId"
        ],
        ...zclist.map(zc => [
          zc.zId,
          zc.ztype,
          (zc.comptage && zc.comptage.total ? zc.comptage.total : ''),
          (zc.comptage && zc.comptage.especes ? zc.comptage.especes : ''),
          (zc.comptage && zc.comptage.carte ? zc.comptage.carte : ''),
          (zc.comptage && zc.comptage.ticket ? zc.comptage.ticket : ''),
          (zc.comptage && zc.comptage.cheque ? zc.comptage.cheque : ''),
          (zc.comptage && zc.comptage.avoir ? zc.comptage.avoir : ''),
          (zc.ecarts && zc.ecarts.especes ? zc.ecarts.especes.valeur : ''),
          (zc.ecarts && zc.ecarts.especes ? zc.ecarts.especes.motif : ''),
          (zc.ecarts && zc.ecarts.carte ? zc.ecarts.carte.valeur : ''),
          (zc.ecarts && zc.ecarts.carte ? zc.ecarts.carte.motif : ''),
          (zc.ecarts && zc.ecarts.ticket ? zc.ecarts.ticket.valeur : ''),
          (zc.ecarts && zc.ecarts.ticket ? zc.ecarts.ticket.motif : ''),
          (zc.ecarts && zc.ecarts.cheque ? zc.ecarts.cheque.valeur : ''),
          (zc.ecarts && zc.ecarts.cheque ? zc.ecarts.cheque.motif : ''),
          (zc.ecarts && zc.ecarts.avoir ? zc.ecarts.avoir.valeur : ''),
          (zc.ecarts && zc.ecarts.avoir ? zc.ecarts.avoir.motif : ''),
          zc.periode,
          zc.ca,
          zc.caisse,
          zc.depenses,
          zc.editeur.id,
          zc.editeur.nom,
          zc.editeur.user_id,
          zc.emission,
          zc.fdcaisse,
          zc.mtcaisse,
          zc.numtickets,
          zc.paramdfcaisse,
          zc.remboursements,
          zc.ticket_moyen,
          zc.ventes,
          Object.values(zc.ventilation.moyen).map(m=>m.moyen+': '+m.valeur).join('|'),
          zc.ventilation.tva && Object.entries(zc.ventilation.tva).map(([k,t])=>k+':'+t.ttc).join('|'),
          zc.ventilation.tva && Object.entries(zc.ventilation.tva).map(([k,t])=>k+':'+t.ht).join('|'),
          zc.ventilation.tva && Object.entries(zc.ventilation.tva).map(([k,t])=>k+':'+t.taxe).join('|'),
          Object.values(zc.ventilation.vendeur).map(v=>`${v.nom} (${v.id}) : ${v.ventes} - ${v.remboursements}`).join('|'),
          Object.values(zc.ventilation.caisse).map(c=>`${c.nom} (${c.id}): ${c.ca}`).join('|'),
          zc.prelevement,
          zc.staffmeals,
          zc.createdAt,
          zc.source,
          zc.hash,
          zc.signature,
          zc.trousseauId
        ])
      ]
      .map(e => e.join(";")) 
      .join("\n");

      __data.push({type: 'csv', data: zcCsvString, file: 'zdecaisse.csv'});
    }


    // ------------>  Tickets
    const tickets_id = gttlist.map(t=>t['ENC-GTT-ORI-NUM']);
    const __ft = tickets_id.filter(t => t);

    const tickets = await commandeServices.getTicket({
      'ENC-TIK-NUM': {$in: __ft}
    });

    // export en JSON
    __data.push({type: 'json', data: JSON.stringify(tickets), file: 'tickets.json'});

    // ajout des ID de Z de Caisse à purger
    __purge.tickets = tickets.map(t => t['ENC-TIK-NUM'] );


    console.log('tickets',tickets);
    if (Array.isArray(tickets) && tickets.length>0) {
      let __tck = [];
      const __tck_hdr = [
        'ENC-TIK-NUM',
        'ENC-TIK-CDE',
        'ENC-TIK-TAG-VER',
        'ENC-TIK-PRN-NBR',
        'ENC-TIK-SOC-ETS',
        'ENC-TIK-SOC-ID',
        'ENC-TIK-SOC-ADR',
        'ENC-TIK-SOC-CCP',
        'ENC-TIK-SOC-VIL',
        'ENC-TIK-SOC-PAY',
        'ENC-TIK-SOC-SIR',
        'ENC-TIK-SOC-NAF',
        'ENC-TIK-SOC-TVA',
        'ENC-TIK-VEN-NID',
        'ENC-TIK-VEN-NOM',
        'ENC-TIK-OPS-NID',
        'ENC-TIK-OPS-NOM',
        'ENC-TIK-CAI-NID',
        'ENC-TIK-HOR-GDH',
        'ENC-OPE-TYP',
        'ENC-TIK-DOC-TYP',
        'ENC-TIK-LIG-NBR',
        'ENC-TIK-TAG-SIG',
        'ENC-TIK-ID-KEY',
        'ENC-TIK-TAG-RET',
        'ENC-TIK-HASH',
        'ENC-TIK-ARG',
        'ENC-TIK-LOG',
        'ENC-TIK-TOT-MHT',
        'ENC-TIK-TOT-TTC'
      ];
      
      let __tcklgn = [];
      const __tcklgn_hdr = [
        'ENC-NID',
        'ENC-TIK-ORI-NUM',
        'ENC-TIK-LIG-NUM',
        'ENC-TIK-LIG-PRO-NID',
        'ENC-TIK-LIG-PRO-LIB',
        'ENC-TIK-LIG-PRO-QTE',
        'ENC-TIK-LIG-TAX-NID',
        'ENC-TIK-LIG-TAX-TXX',
        'ENC-TIK-LIG-PRO-MTH',
        'ENC-TIK-LIG-PRO-TTC',
        'ENC-TIK-LIG-REM-TXX',
        'ENC-TIK-LIG-REM-TOT',
        'ENC-TIK-LIG-TOT-MHT',
        'ENC-TIK-LIG-TOT-TTC',
        'ENC-TIK-LIG-OPE-TYP',
        'ENC-TIK-LIG-CAI-NID',
        'ENC-TIK-LIG-VEN-NID',
        'ENC-TIK-LIG-OPS-NID',
        'ENC-TIK-LIG-HOR-GDH'
      ];

      let __tcktva = [];
      const __tcktva_hdr = [
        'ENC-NID',
        'ENC-TIK-TOT-MHT',
        'ENC-TIK-TVA-NID',
        'ENC-TIK-TVA-TXX',
        'ENC-TIK-TVA-MTN'
      ];

      let __tckrgt = [];
      const __tckrgt_hdr = [
        'ENC-NID',
        'ENC-TIK-ORI-NUM',
        'ENC-TIK-REG-TYP',
        'ENC-TIK-REG-MOD-LIB',
        'ENC-TIK-REG-MTN',
        'ENC-TIK-REG-NUM',
        'ENC-TIK-REG-USR-NID',
        'ENC-TIK-REG-HOR-GDH'
      ]
      

      tickets.forEach(tck => {
        
        let __evalstart = parseInt(tck['ENC-TIK-HOR-GDH']);
        let __evalend = parseInt(tck['ENC-TIK-HOR-GDH']);

        if (__startdefacto) {
          __startdefacto = Math.min(__evalstart, __startdefacto);
        } else {
          __startdefacto = __evalstart;
        }
        if (__enddefacto) {
          __enddefacto = Math.max(__evalend, __enddefacto);
        } else {
          __enddefacto = __evalend;
        }

        __tck.push([
          tck['ENC-TIK-NUM'],
          tck['ENC-TIK-CDE'],
          tck['ENC-TIK-TAG-VER'],
          tck['ENC-TIK-PRN-NBR'],
          tck['ENC-TIK-SOC-ETS'],
          tck['ENC-TIK-SOC-ID'],
          tck['ENC-TIK-SOC-ADR'],
          tck['ENC-TIK-SOC-CCP'],
          tck['ENC-TIK-SOC-VIL'],
          tck['ENC-TIK-SOC-PAY'],
          tck['ENC-TIK-SOC-SIR'],
          tck['ENC-TIK-SOC-NAF'],
          tck['ENC-TIK-SOC-TVA'],
          tck['ENC-TIK-VEN-NID'],
          tck['ENC-TIK-VEN-NOM'],
          tck['ENC-TIK-OPS-NID'],
          tck['ENC-TIK-OPS-NOM'],
          tck['ENC-TIK-CAI-NID'],
          tck['ENC-TIK-HOR-GDH'],
          tck['ENC-OPE-TYP'],
          tck['ENC-TIK-DOC-TYP'],
          tck['ENC-TIK-LIG-NBR'],
          tck['ENC-TIK-TAG-SIG'],
          tck['ENC-TIK-ID-KEY'],
          tck['ENC-TIK-TAG-RET'],
          tck['ENC-TIK-HASH'],
          tck['ENC-TIK-ARG'],
          tck['ENC-TIK-LOG'],
          tck['ENC-TIK-TOT-MHT'],
          tck['ENC-TIK-TOT-TTC']
        ]);

        __tcklgn= [
          ...__tcklgn,
          ...tck['LIGNES'].map(l => [
            l['ENC-NID'],
            l['ENC-TIK-ORI-NUM'],
            l['ENC-TIK-LIG-NUM'],
            l['ENC-TIK-LIG-PRO-NID'],
            l['ENC-TIK-LIG-PRO-LIB'],
            l['ENC-TIK-LIG-PRO-QTE'],
            l['ENC-TIK-LIG-TAX-NID'],
            l['ENC-TIK-LIG-TAX-TXX'],
            l['ENC-TIK-LIG-PRO-MTH'],
            l['ENC-TIK-LIG-PRO-TTC'],
            l['ENC-TIK-LIG-REM-TXX'],
            l['ENC-TIK-LIG-REM-TOT'],
            l['ENC-TIK-LIG-TOT-MHT'],
            l['ENC-TIK-LIG-TOT-TTC'],
            l['ENC-TIK-LIG-OPE-TYP'],
            l['ENC-TIK-LIG-CAI-NID'],
            l['ENC-TIK-LIG-VEN-NID'],
            l['ENC-TIK-LIG-OPS-NID'],
            l['ENC-TIK-LIG-HOR-GDH']  
          ])
        ];

        __tcktva = [
          ...__tcktva,
          ...tck['TVA'].map(t => [
            t['ENC-NID'],
            t['ENC-TIK-TOT-MHT'],
            t['ENC-TIK-TVA-NID'],
            t['ENC-TIK-TVA-TXX'],
            t['ENC-TIK-TVA-MTN']
          ])
        ];

        __tckrgt = [
          ...__tckrgt,
          ...tck['REGLEMENTS'].map(r => [
            r['ENC-NID'],
            r['ENC-TIK-ORI-NUM'],
            r['ENC-TIK-REG-TYP'],
            r['ENC-TIK-REG-MOD-LIB'],
            r['ENC-TIK-REG-MTN'],
            r['ENC-TIK-REG-NUM'],
            r['ENC-TIK-REG-USR-NID'],
            r['ENC-TIK-REG-HOR-GDH']
          ])
        ];

      });

      const tckString = __tck_hdr.join(';') + "\n" + __tck.map(e => e.join(";")).join("\n");
      __data.push({type: 'csv', data: tckString, file: 'tickets.csv'});

      const tcklgnString = __tcklgn_hdr.join(';') + "\n" + __tcklgn.map(e => e.join(";")).join("\n");
      __data.push({type: 'csv', data: tcklgnString, file: 'ticketlignes.csv'});

      const tcktvaString = __tcktva_hdr.join(';') + "\n" + __tcktva.map(e => e.join(";")).join("\n");
      __data.push({type: 'csv', data: tcktvaString, file: 'tickettva.csv'});

      const tckrgtString = __tckrgt_hdr.join(';') + "\n" + __tckrgt.map(e => e.join(";")).join("\n");
      __data.push({type: 'csv', data: tckrgtString, file: 'ticketreglements.csv'});
    }

      
    // ------------>  Clotures
    const __cloQuery = {
      $and: [
        {createdAt: {$gte:debut.getTime()}},
        {createdAt: {$lt:fin.getTime()}}
      ]
    }
    const { clotureslist } = await clotureServices.getCloturesList(__cloQuery);
    // fichier JSON
    __data.push({type: 'json', data: JSON.stringify(clotureslist), file: 'clotures.json'});

    // ajout des id de clotures à purger
    __purge.clotures = Object.values(clotureslist).map(c => c.clotureId);

    // ------------>  Duplicatas
    const __dplQuery = {
      $and: [
        {'ENC-DUP-HOR-GDH': {$gte:start}},
        {'ENC-DUP-HOR-GDH': {$lt:end}}
      ]
    }
    const dpllist = await commandeServices.getDuplicata(__dplQuery);


    // export en JSON
    __data.push({type: 'json', data: JSON.stringify(dpllist), file: 'duplicatas.json'});

    // ajout des ID de duplicatas à purger
    __purge.duplicatas = dpllist.map(t => t['ENC-DUP-NID'] );


    const dplCsvString = [
      [
        'ENC-DUP-NID',
        'ENC-DUP-ORI-NUM',
        'ENC-DUP-TYP',
        'ENC-DUP-PRN-NUM',
        'ENC-DUP-OPS-NID',
        'ENC-DUP-HOR-GDH',
        'ENC-DUP-HASH',
        'ENC-TIK-ARG',
        'ENC-DUP-TAG-SIG',
        'ENC-DUP-RES',
        'ENC-TIK-ID-KEY',
        'ENC-DUP-VER',
        'ENC-SIG-RES',
        'ENC-SIG-MOTIF'
      ],
      ...dpllist.map(dpl =>[
        dpl['ENC-DUP-NID'],
        dpl['ENC-DUP-ORI-NUM'],
        dpl['ENC-DUP-TYP'],
        dpl['ENC-DUP-PRN-NUM'],
        dpl['ENC-DUP-OPS-NID'],
        dpl['ENC-DUP-HOR-GDH'],
        dpl['ENC-DUP-HASH'],
        dpl['ENC-TIK-ARG'],
        dpl['ENC-DUP-TAG-SIG'],
        dpl['ENC-DUP-RES'],
        dpl['ENC-TIK-ID-KEY'],
        dpl['ENC-DUP-VER'],
        dpl['ENC-SIG-RES'],
        dpl['ENC-SIG-MOTIF']
      ])
    ]
    .map(e => e.join(";")) 
    .join("\n");

   __data.push({type: 'csv', data: dplCsvString, file: 'duplicatas.csv'});

    // ------------>  Commandes
    const __cmdQuery = {
      $and: [
        {status: 'confirmed'},
        {archived: {$exists: true}},
        {createdAt: {$gte:debut.getTime()}},
        {createdAt: {$lt:fin.getTime()}}
      ]
    }
    const { commandeslist } = await commandeServices.getCommandesList(__cmdQuery);
    // fichier JSON
    __data.push({type: 'json', data: JSON.stringify(commandeslist), file: 'commandes.json'});

    // ajout des id de commandes à purger
    __purge.commandes = Object.values(commandeslist).map(c => c.ticketId);

    // ------------>  Trésorerie
    const __tresorQuery = {
      $and: [
        {createdAt: {$gte:debut.getTime()}},
        {createdAt: {$lt:fin.getTime()}},
      ]
    }
    const { tresorslist } = await tresorServices.getTresors(__tresorQuery);
    // fichier JSON
    __data.push({type: 'json', data: JSON.stringify(tresorslist), file: 'tresorerie.json'});

    // ajout des id de mouvements de trésorerie à purger
    __purge.tresors = Object.values(tresorslist).map(t => t.tresorId);


    // ------------>  Avoirs
    const __avoirQuery = {
      $and: [
        {emission: {$gte:debut.getTime()}},
        {emission: {$lt:fin.getTime()}},
      ]
    }
    const { avoirslist } = await marketingServices.getAvoirsList(__avoirQuery);
    // fichier JSON
    __data.push({type: 'json', data: JSON.stringify(avoirslist), file: 'avoirs.json'});

    // ajout des ID de duplicatas à purger 
    // (les avoirs périmés avant la fin de la période archivée)
    __purge.avoirs = avoirslist.map(a => a.limite < fin.getTime() );


    // ------------>  export comptable
    const __XCPTquery = {
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
    const liste = await clotureServices.getZCaisse(__XCPTquery);

    const recap = _getExportComptable(liste);

    const recap_hdr = recap.header.map(h => h.title);
    const recap_data = recap.data.map(d => [
      d.date,
      d.compte,
      d.intitule,
      d.libelle,
      d.credit||'',
      d.debit||''
    ]);
    const xcpt_data = recap_hdr.join(';') + "\n" + recap_data.map(e => e.join(";")).join("\n");

    __data.push({type: 'csv', data: xcpt_data, file: 'exportcomptable.csv'});

    // COPIE DE FICHIERS
    // ------------>  JET et PA
  
    const compta_dir = `${app.getPath('userData')}/compta/`;

    let files
    try {
      files = await fs.readdir(compta_dir);
    }
    catch(e) {
      console.error('impossible de scanner le dossier compta', e);
    }
    if (files===undefined) {
      console.log('fichier de compta undefined');
    } else {

      const debut_aj = parseInt(format(debut,'yyDDD'));
      const fin_aj = parseInt(format(fin,'yyDDD'));

      await  asyncForEach(files, async (f) => {
          
        let fjour = parseInt(f.substring(0,5));
        console.log(debut_aj, fjour, fin_aj);
        if (fjour >= debut_aj && fjour <= fin_aj) {
          console.log('inclu', f);
          const __gz = (last(f.split('.'))==='gz');

          // ajout des JET de la période
          __purge.jet.push(`${compta_dir}${f}`);
          
          let filecont = await fs.readFile(`${compta_dir}${f}`);
          let filedef;
          let fdef = f;
          if (__gz) {
            filedef = await ungzip(filecont);
            fdef = dropRight(f.split('.')).join('.');
          } else {
            filedef = filecont;
          }

          __data.push({ type: 'json', data: filedef, file: `journaux/${fdef}` });
          
        }
        else {
          console.log('exclu', f);
        }

      });
      

    }
    
    // ------------>  Documentation



    // Génération du fichier d'information

    const __contenu_archive = __data.map(d => [` - ${d.file}`]);

    const __infos = [
      [`EMETTEUR: ${ user.user_id }`],
      [`STATION: ${ caisse.id }`],
      [`LOGICIEL: SPLASH360`],
      [`VERSION: ${ packageJson.version }`],
      [`HORODATAGE: ${ format(new Date(),'yyyyMMddHHmmss') }`],
      [`PERIODE: ${ start }|${ end }`],
      [`CONTENU:`],
      [` - INFOS.txt`],
      ...__contenu_archive
    ].join("\n");

    __data.push({ type: 'txt', data: __infos, file: 'INFOS.txt'});

    await clotureServices.createArchiveFiscale(fileName, __data, archive_secret);

    const __afcont = await fs.readFile(`${app.getPath('userData')}/archives_fiscales/${fileName}`);
    const { hmac, signature } = await signatureServices.createSignature(__afcont.toString(), privateKey); 

    const __afdata = {
      'TAG-ARC-HOR-GDH': format(new Date(),'yyyyMMddHHmmss'),
      'TAG-ARC-DOC': fileName,
      'TAG-ARC-OPS-NID': user.user_id,
      'TAG-ARC-CAI-NID': caisse.id,
      'TAG-ARC-OPE-TYP': 'ANNEE',
      'TAG-ARC-ID-KEY': trousseauId,
      'TAG-ARC-SIG': signature,
      'TAG-ARC-HASH': hmac,
      'periode': `${__startdefacto}|${__enddefacto}`
    };

    try {
      await clotureServices.persistArchiveFiscale(__afdata);
      dispatch({ type: clotureActionTypes.ADD_ARCHIVE_FISCALE, archive: __afdata });
    }
    catch(e) {
      console.error(e);
    }

   
    

  } 
}



function exportArchive(target, filename) {
  return async dispatch => {


    const origin = `${app.getPath('userData')}/archives_fiscales/${filename}`;
    try {
      await fs.copyFile(origin, target);
      console.log(`${origin} was copied to ${target}`);
      dispatch(journalActions.log('440',`Exportation de ${filename} vers ${target}`));
    } catch {
      console.log(`The file ${origin} could not be copied`);
    }

  }
}


function exportComptable(target, debut, fin) {
  return async (dispatch, getState) => {

    const { privateKey, trousseauId } = getState().signatureReducer; 

    const start = format(debut, 'yyyyMMdd050000');
    const end = format(fin, 'yyyyMMdd050000');
    
    dispatch(journalActions.log('180', `Recapitulatif ventilations du ${format(debut, 'dd/MM/yyyy')} au ${format(fin, 'dd/MM/yyyy')}`));

    const __query = {
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

    console.log('exportComptable',__query);
    const liste = await clotureServices.getZCaisse(__query);

    const recap = _getExportComptable(liste);
  
    const { signature } = await signatureServices.createExportComptableSignature(recap, privateKey);

    try {
      await clotureServices.exportComptable(target, recap);
      dispatch({type: clotureActionTypes.EXPORT_COMPTABLE_SUCCESS});
      dispatch(journalActions.log('902', `trousseauId:${trousseauId}, signature:${signature}`));
    }
    catch(e) {
      dispatch({type: clotureActionTypes.EXPORT_COMPTABLE_FAILURE, error: e});
    }


  }
}

function _getExportComptable(zcaisse) {

  let recap = {
    header:[   
      {id: 'date', title: 'DATE'},
      {id: 'compte', title: 'COMPTE COMPTABLE'},
      {id: 'intitule', title: 'INTITULE DE COMPTE'},
      {id: 'libelle', title: 'LIBELLE ECRITURE COMPTABLE'},
      {id: 'credit', title: 'MONTANT CREDIT'},
      {id: 'debit', title: 'MONTANT DEBIT'}
    ],
    data:[]
  };


  if (zcaisse) {

    zcaisse.forEach(zj => {

      const p = zj.periode.split('|');
      const j = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);
      const date = format(new Date(j), 'dd/MM/yyyy');



      // ventilation TVA + HT
      Object.entries(zj.ventilation.tva).forEach(([k,t]) => { 
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['ht'+k].id,
          intitule:  COMPTE_COMPTABLE['ht'+k].intitule,
          libelle: `RECETTES ${date}`, 
          credit: (t.ht / 100).toFixed(2).replace('.',',')
        });
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['tva'+k].id,
          intitule:  COMPTE_COMPTABLE['tva'+k].intitule,
          libelle: `RECETTES ${date}`, 
          credit: (t.taxe / 100).toFixed(2).replace('.',',')
        });
      });




      let __especes = 0,
          __cheques = 0,
          __cartes = 0,
          __tickets = 0,
          __avoirs = 0
        ;
      // ventilation moyens de paiement
      Object.entries(zj.ventilation.moyen).forEach(([k,m]) => {

        let moy = k;
        if (k.includes('_')) {
          moy = k.split('_')[0];
        }

        if (moy==='carte') __cartes += m.valeur;
        if (moy==='ticket') __tickets += m.valeur;
        if (moy==='cheque') __cheques += m.valeur;
        if (moy==='avoir') __avoirs += m.valeur;
        if (moy==='especes') __especes += m.valeur;
      });

      if (__cartes > 0) {
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['carte'].id,
          intitule:  COMPTE_COMPTABLE['carte'].intitule,
          libelle: `RECETTES ${date}`, 
          debit: __cartes.toFixed(2).replace('.',',')
        });
      } 

      if (__tickets > 0) {
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['ticket'].id,
          intitule:  COMPTE_COMPTABLE['ticket'].intitule,
          libelle: `RECETTES ${date}`, 
          debit: __tickets.toFixed(2).replace('.',',')
        });
      } 

      if (__cheques > 0) {
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['cheque'].id,
          intitule:  COMPTE_COMPTABLE['cheque'].intitule,
          libelle: `RECETTES ${date}`, 
          debit: __cheques.toFixed(2).replace('.',',')
        });
      } 

      if (__avoirs > 0) {
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['avoir'].id,
          intitule:  COMPTE_COMPTABLE['avoir'].intitule,
          libelle: `RECETTES ${date}`, 
          debit: __avoirs.toFixed(2).replace('.',',')
        });
      } 

      if (__especes > 0) {
        recap.data.push({
          date: date,
          compte: COMPTE_COMPTABLE['especes'].id,
          intitule:  COMPTE_COMPTABLE['especes'].intitule,
          libelle: `RECETTES ${date}`, 
          debit: __especes.toFixed(2).replace('.',',')
        });
      } 


      recap.data.push({
        date: date,
        compte: COMPTE_COMPTABLE['ecart'].id,
        intitule:  COMPTE_COMPTABLE['ecart'].intitule,
        libelle: `RECETTES ${date}`
      });

    });
  
  }

  return recap;

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
  getZCaisse,
  checkZCaisse,
  createGrandTotalTicket,
  checkGrandTotalPeriodique,
  createGrandTotalPeriodique,
  getCloturesList,
  getBoundedClotures,
  setSyncedClotures,
  setClotureFromSync,
  getTodayCa,
  testCloturesAuto,
  testZCaisse,
  testGTPeriodique,
  getArchivesFiscales,
  exportArchive,
  checkArchive,
  archiveFiscale,
  exportComptable,
};