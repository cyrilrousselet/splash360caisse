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
          { "caisse_encaissement.uniqid": params.caisse.uniqid },
          { $and: [
            { "caisse.uniqid": params.caisse.uniqid },
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


export const clotureActions = {
  getLast,
  getCurrentPeriode,
  loadCloture,
  makeCloture,
  getCloturesList,
  getBoundedClotures,
  setSyncedClotures,
  setClotureFromSync,
  getTodayCa
};