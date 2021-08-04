import { tresorActionTypes } from "./tresorActionTypes";
import { tresorServices } from "./tresorServices";
import { dateBounds, asyncForEach } from "../../helpers/toolbox";
import { isBefore } from "date-fns";

import { notificationActions } from '../notification/notificationActions';

import logger from '../../helpers/Logger';
import { commandeServices } from "../commande/commandeServices";


function addTresor(payload) {
  return (dispatch, getState) => {

    logger.info('addTresor()', payload);

    dispatch({ type: tresorActionTypes.ADD_REQUEST });

    const user = getState().authentication.user;

    const {caisse} = getState().parametresReducer.parametres.options;


    const params = {
      ...payload,
      user: user.user_id
    };

    const tresor = tresorServices.createTresor(params);

    // logger.time('addTresor');
    tresorServices.persistTresor({...tresor, localsync: [caisse.uniqid]}).then(
      data => {
        // logger.timeEnd('addTresor');

        let __isOuverture = null;
        
        if (data.type==="ouverture") {
          if (data.destination===caisse.uniqid) __isOuverture = true;
        }
        if (data.type==="cloture") {
          if (data.origine===caisse.uniqid) __isOuverture = false;
        }


        dispatch({
          type: tresorActionTypes.ADD_SUCCESS,
          tresor: data,
          ouverture: __isOuverture
        });

        dispatch(notificationActions.syncDispatch('tresor', data));
      },
      error => { 
        // logger.timeEnd('addTresor');
        dispatch({ type: tresorActionTypes.ADD_FAILURE, error: error.toString() })
      }
    );

  }
}

function checkFinDeService() {
  return async (dispatch, getState) => {

    const {caisse} = getState().parametresReducer.parametres.options;

    dispatch({type: tresorActionTypes.CHECK_FINDESERVICE_REQUEST});

    try {
      const __reponse = await tresorServices.getLastClotureAndAfter({caisseId:caisse.uniqid}); 

      logger.info('CFS', __reponse);

      let __ouverture = false;
      if (__reponse && __reponse.hasOwnProperty('cloture') && __reponse.cloture!==null) {
        if (__reponse.hasOwnProperty('ouverture') && __reponse.ouverture) {
          
          // s'il y a une ouverture depuis la dernière cloture :
          // cette cloture date-t-elle d'un précédent service ?
          if (isBefore(new Date(__reponse.ouverture_mvt.createdAt), new Date().setHours(5,0))) {

              // y a-t-il des commandes non cloturées ?
              const currentCmd = await commandeServices.getCommandesList({$and: [
                { archived: {"$exists": false} },
                { status: { $eq: "confirmed" } },
                { $or: [
                  { "caisse_encaissement.id": caisse.id },
                  { $and: [
                    { "caisse.id": caisse.id },
                    { status: { $in: ["standby", "a_encaisser"]} }
                  ]},
                ]}
              ]});

              // s'il y a des commandes non cloturées : on bloque.
              if (Object.values(currentCmd.commandeslist).length>0) {
                __ouverture = true;
              }
          }
        }
      } else {
        logger.info('pas de cloture');
        if (__reponse.hasOwnProperty('ouverture') && __reponse.ouverture) {
          logger.info(new Date(__reponse.ouverture_mvt.createdAt), new Date().setHours(5,0));
          if (isBefore(new Date(__reponse.ouverture_mvt.createdAt), new Date().setHours(5,0))) {
            logger.info('la cloture est avant le servide d’aujourd’hui');

            // y a-t-il des commandes non cloturées ?
            const currentCmd = await commandeServices.getCommandesList({$and: [
              { archived: {"$exists": false} },
              { status: { $eq: "confirmed" } },
              { $or: [
                { "caisse_encaissement.id": caisse.id },
                { $and: [
                  { "caisse.id": caisse.id },
                  { status: { $in: ["standby", "a_encaisser"]} }
                ]},
              ]}
            ]});

            // s'il y a des commandes non cloturées : on bloque.
            if (Object.values(currentCmd.commandeslist).length>0) {
              __ouverture = true;
            }

          }
        }
      }

      if (__ouverture===true) {

        dispatch({ type: tresorActionTypes.CHECK_FINDESERVICE_SUCCESS, blocage: true });
        
      } else {

        dispatch({ type: tresorActionTypes.CHECK_FINDESERVICE_SUCCESS, blocage: false });}
      
    } catch (error) {
      logger.info('TrsAct.checkFinDeService() ERROR', error);
      dispatch({ type: tresorActionTypes.CHECK_FINDESERVICE_FAILURE, error })
    }


  }
}


function getLastClotureAndAfter(caisseId) {
  return (dispatch, getState) => {
    dispatch({type: tresorActionTypes.GET_LASTCLOTUREANDAFTER_REQUEST});

    const {caisse} = getState().parametresReducer.parametres.options;
  try {

  
    try {
      tresorServices.getLastClotureAndAfter({caisseId:caisse.uniqid}).then(
        result => {

          let __solde = 0, __ouverture;
          if (result.hasOwnProperty('last') && result.last!==null) {
            __solde = result.last.solde;
          }

          if (result && result.hasOwnProperty('cloture') && result.cloture!==null) {
            if (result.hasOwnProperty('ouverture') && result.ouverture) {
              logger.info('IL Y A UNE CLOTURE et une ouverture');
              __ouverture = true;
            } else {
              __ouverture = false;
            }
          } else if (!result.ouverture) {
            logger.info('IL N’Y A PAS DE CLOTURE et PAS D’OUVERTURE -> POPIN');
            __ouverture = false;
          } else {
            __ouverture = true;
          }

          dispatch({type: tresorActionTypes.GET_LASTCLOTUREANDAFTER_SUCCESS, ouverture: __ouverture, solde: __solde})
        },
        error => { 
          dispatch({ type: tresorActionTypes.GET_LASTCLOTUREANDAFTER_FAILURE, error: error.toString() })
        }
      );
    }
    catch(e) {
      logger.error(e);
      dispatch({ type: tresorActionTypes.GET_LASTCLOTUREANDAFTER_FAILURE, error: e.toString() })
    }
  }
  catch(e) {
    logger.error(e);
    dispatch({ type: tresorActionTypes.GET_LASTCLOTUREANDAFTER_FAILURE, error: e.toString() })
  }
  }
}

function getLastOuvertureAndAfter(caisseId) {
  return (dispatch, getState) => {

    logger.info("TrsA.getLastOuvertureAndAfter()");
    const { heure_fin } = getState().parametresReducer.parametres.entreprise;

    // *** définition de la fin de la période précédente
    const __periode_bounds = dateBounds(new Date(), heure_fin);

    dispatch({
      type: tresorActionTypes.GET_LASTOUVERTUREANDAFTER_REQUEST,
      params: {
        createdAt: __periode_bounds.debut,
        caisseId: caisseId
      }
    });

    // logger.time('getLastOuvertureAndAfter');
    tresorServices.getLastOuvertureAndAfter({
      createdAt: __periode_bounds.debut,
      caisseId: caisseId
    }).then(
      data => { 

        // logger.timeEnd('getLastOuvertureAndAfter');
        dispatch({ 
          type: tresorActionTypes.GET_LASTOUVERTUREANDAFTER_SUCCESS, 
          ...data
        }); 
      },
    )
    .catch(
      error => { 

        logger.error(error);
        // logger.timeEnd('getLastOuvertureAndAfter');
        dispatch({ type: tresorActionTypes.GET_LASTOUVERTUREANDAFTER_FAILURE, error: error.toString() }) }
    );


  }
}


function getTresors(params={}) {

  return dispatch => {
    dispatch({type: tresorActionTypes.GET_REQUEST});

    // logger.time('getTresors');
    tresorServices.getTresors(params).then(
      data => { 
        // logger.timeEnd('getTresors');
        dispatch({ 
          type: tresorActionTypes.GET_SUCCESS, 
          ...data
        }); 
      },
    )
    .catch(
      error => { 
        // logger.timeEnd('getTresors');
        logger.error(error);
        dispatch({ type: tresorActionTypes.GET_FAILURE, error: error.toString() })
      }
    );
  }
}



function updateTresor(payload) {
  return (dispatch, getState) => {

    dispatch({ type: tresorActionTypes.UPDATE_REQUEST });


    const {caisse} = getState().parametresReducer.parametres.options;

    // logger.time('persistTresor');
    tresorServices.persistTresor({...payload, localsync:[caisse.uniqid]}).then(

      data => {


        let __isOuverture = null;
        if (data.destination===caisse.uniqid) {
          if (data.type==="ouverture") __isOuverture = true;
          if (data.type==="cloture") __isOuverture = false;
        }
 
        // logger.timeEnd('persistTresor');
        dispatch({ 
          type: tresorActionTypes.UPDATE_SUCCESS,
          tresor: data,
          ouverture: __isOuverture
        });

        dispatch(notificationActions.syncDispatch('tresor', data));
      },
      error => {
        // logger.timeEnd('persistTresor');
        dispatch({ type: tresorActionTypes.UPDATE_FAILURE, error: error.toString() })
      }
    );
  }
}


function setTresorFromSync(tresor) {
  return async (dispatch, getState) => {
    const { data, emitter, response } = tresor;

    const {caisse} = getState().parametresReducer.parametres.options;

    // s'il s'agit de plusieurs mouvements de trésorerie à persister
    if (Array.isArray(data)) {


      let mouvementsIds = [];
      let trsNum = 0;

      const __syncTrs = async () => {
        await asyncForEach(data, async (trs) => {

          // on ajoute l'id de la caisse à la propriété localsync
          // et si elle n'existe pas, on crée la propriété
          const {localsync} = trs;
          let __lsync = localsync || [];
          if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

          let tresorconfirm = null;

          
          try {

            tresorconfirm = await tresorServices.persistTresor({...trs, localsync:__lsync});
          

            if (tresorconfirm.type==="cloture" && tresorconfirm.origine===caisse.uniqid) {

              dispatch({ 
                type: tresorActionTypes.ADD_SUCCESS, 
                tresor: tresorconfirm,
                ouverture: false
               });

            }

            dispatch({ type: tresorActionTypes.SETSYNCED_SUCCESS, tresorconfirm });
            trsNum++;
            mouvementsIds.push(tresorconfirm.tresorId);

          } catch (err) {
            dispatch({ type: tresorActionTypes.SETSYNCED_FAILURE, error: err });
            logger.info('sync trs err', err);
          }


          if (trsNum===data.length) {
            
            // confirmation du traitement de la synchro
            if (response!==null) {
              dispatch(notificationActions.syncConfirm(response, {db:"tresor", ids:mouvementsIds, from:caisse.uniqid}));
            }
            // -> si 'response' est null, la synchro ne provient pas de l'API,
            // il s'agit d'une synchro d'entretien commandée par la caisse "primary"
            else {
              dispatch(notificationActions.syncConfirmToPrimary({db:"tresor", ids:mouvementsIds, from:caisse.uniqid}));
            }

            // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
            // donc inutile de lui renvoyer la synchro
            if (emitter!==null) {
              dispatch(notificationActions.syncDispatch('tresor', tresorconfirm, emitter));
            }
            // dispatch(getTresors());
            dispatch(getLastOuvertureAndAfter(caisse.uniqid));
          }

        }); 

      }

      __syncTrs();

    } 
    // s'il n'y a qu'un mouvement de trésorerie à persister
    else {
    
      // on ajoute l'id de la caisse à la propriété localsync
      // et si elle n'existe pas, on crée la propriété
      const {localsync} = data;
      let __lsync = localsync || [];
      if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

      let tresorconfirm = null;
      try {
        tresorconfirm = await tresorServices.persistTresor({...data, localsync:__lsync});


        if (tresorconfirm.type==="cloture" && tresorconfirm.origine===caisse.uniqid) {

          dispatch({ 
            type: tresorActionTypes.ADD_SUCCESS, 
            tresor: tresorconfirm,
            ouverture: false
           });

        }

        dispatch({ type: tresorActionTypes.SETSYNCED_SUCCESS, tresorconfirm });

        // confirmation du traitement de la synchro
        if (response!==null) {
          dispatch(notificationActions.syncConfirm(response, {db:"tresor", ids:[tresorconfirm.tresorId], from:caisse.uniqid}));
        }
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // il s'agit d'une synchro d'entretien commandée par la caisse "primary"
        else {
          dispatch(notificationActions.syncConfirmToPrimary({db:"tresor", ids:[tresorconfirm.tresorId], from:caisse.uniqid}));
        }

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        if (emitter!==null) {
          dispatch(notificationActions.syncDispatch('tresor', tresorconfirm, emitter));
        }
        dispatch(getLastOuvertureAndAfter(caisse.uniqid));
      
      } catch (err) {
        dispatch({ type: tresorActionTypes.SETSYNCED_FAILURE, error: err });
        logger.info('sync trs err', err);
      }
      
    }
  }
}



export const tresorActions = {
  addTresor,
  checkFinDeService,
  getLastClotureAndAfter,
  getLastOuvertureAndAfter,
  getTresors,
  updateTresor,
  setTresorFromSync
}