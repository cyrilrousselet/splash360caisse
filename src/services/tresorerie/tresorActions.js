import { tresorActionTypes } from "./tresorActionTypes";
import { tresorServices } from "./tresorServices";
import { dateBounds, asyncForEach } from "../../helpers/toolbox";

import { notificationActions } from '../notification/notificationActions';

import Logger from '../../helpers/Logger';
const logger = new Logger();


function addTresor(payload) {
  return (dispatch, getState) => {

    logger.log('addTresor()', payload);

    dispatch({ type: tresorActionTypes.ADD_REQUEST });

    const user = getState().authentication.user;

    const {caisse} = getState().parametresReducer.parametres.options;


    const params = {
      ...payload,
      user: user.user_id
    };

    const tresor = tresorServices.createTresor(params);

    logger.time('addTresor');
    tresorServices.persistTresor({...tresor, localsync: [caisse.uniqid]}).then(
      data => {
        logger.timeEnd('addTresor');

        let __isOuverture = null;
        if (data.destination===caisse.uniqid) {
          if (data.type==="ouverture") __isOuverture = true;
          if (data.type==="cloture") __isOuverture = false;
        }


        dispatch({
          type: tresorActionTypes.ADD_SUCCESS,
          tresor: data,
          ouverture: __isOuverture
        });

        dispatch(notificationActions.syncDispatch('tresor', data));
      },
      error => { 
        logger.timeEnd('addTresor');
        dispatch({ type: tresorActionTypes.ADD_FAILURE, error: error.toString() })
      }
    );

  }
}

function getLastClotureAndAfter(caisseId) {
  return (dispatch, getState) => {
    dispatch({type: tresorActionTypes.GET_LASTCLOTUREANDAFTER_REQUEST});

    const {caisse} = getState().parametresReducer.parametres.options;
  
    tresorServices.getLastClotureAndAfter({caisseId:caisse.uniqid}).then(
      result => {

        let __solde = 0, __ouverture;
        if (result.hasOwnProperty('last') && result.last!==null) {
          __solde = result.last.solde;
        }

        if (result && result.hasOwnProperty('cloture') && result.cloture!==null) {
          if (result.hasOwnProperty('ouverture') && result.ouverture) {
            logger.log('IL Y A UNE CLOTURE et une ouverture');
            __ouverture = true;
          } else {
            __ouverture = false;
          }
        } else if (!result.ouverture) {
          logger.log('IL N’Y A PAS DE CLOTURE et PAS D’OUVERTURE -> POPIN');
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
}

function getLastOuvertureAndAfter(caisseId) {
  return (dispatch, getState) => {

    logger.log("TrsA.getLastOuvertureAndAfter()");
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

    logger.time('getLastOuvertureAndAfter');
    tresorServices.getLastOuvertureAndAfter({
      createdAt: __periode_bounds.debut,
      caisseId: caisseId
    }).then(
      data => { 

        logger.timeEnd('getLastOuvertureAndAfter');
        dispatch({ 
          type: tresorActionTypes.GET_LASTOUVERTUREANDAFTER_SUCCESS, 
          ...data
        }); 
      },
    )
    .catch(
      error => { 

        logger.timeEnd('getLastOuvertureAndAfter');
        dispatch({ type: tresorActionTypes.GET_LASTOUVERTUREANDAFTER_FAILURE, error: error.toString() }) }
    );


  }
}


function getTresors(params={}) {

  return dispatch => {
    dispatch({type: tresorActionTypes.GET_REQUEST});

    logger.time('getTresors');
    tresorServices.getTresors(params).then(
      data => { 
        logger.timeEnd('getTresors');
        dispatch({ 
          type: tresorActionTypes.GET_SUCCESS, 
          ...data
        }); 
      },
    )
    .catch(
      error => { 
        logger.timeEnd('getTresors');
        dispatch({ type: tresorActionTypes.GET_FAILURE, error: error.toString() })
      }
    );
  }
}



function updateTresor(payload) {
  return (dispatch, getState) => {

    dispatch({ type: tresorActionTypes.UPDATE_REQUEST });


    const {caisse} = getState().parametresReducer.parametres.options;

    logger.time('persistTresor');
    tresorServices.persistTresor({...payload, localsync:[caisse.uniqid]}).then(

      data => {


        let __isOuverture = null;
        if (data.destination===caisse.uniqid) {
          if (data.type==="ouverture") __isOuverture = true;
          if (data.type==="cloture") __isOuverture = false;
        }
 
        logger.timeEnd('persistTresor');
        dispatch({ 
          type: tresorActionTypes.UPDATE_SUCCESS,
          tresor: data,
          ouverture: __isOuverture
        });

        dispatch(notificationActions.syncDispatch('tresor', data));
      },
      error => {
        logger.timeEnd('persistTresor');
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
            logger.log('sync trs err', err);
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
        logger.log('sync trs err', err);
      }
      
    }
  }
}



export const tresorActions = {
  addTresor,
  getLastClotureAndAfter,
  getLastOuvertureAndAfter,
  getTresors,
  updateTresor,
  setTresorFromSync
}