import { marketingActionTypes } from "./marketingActionTypes";
import { marketingServices } from "./marketingServices";
import { peripheralActions } from "../peripheral/peripheralActions";
import { notificationActions } from "../notification/notificationActions";
import logger from '../../helpers/Logger';
import { notificationServices } from "../notification/notificationServices";
import LocalizedStrings from "react-localization";
import Swal from "sweetalert2";
import { data } from "../../constants/translations";
import { add, format, formatISO, isBefore } from "date-fns";

let strings = new LocalizedStrings(data);


function getAvoirsList() {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_AVOIRS_LIST_REQUEST });

    return marketingServices.getAvoirsList()
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_AVOIRS_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: marketingActionTypes.GET_AVOIRS_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}

function createAvoir(payload) {
  return (dispatch, getState) => {
    dispatch({ type: marketingActionTypes.CREATE_AVOIR_REQUEST });
    
    const { user } = getState().authentication;
    const {caisse} = getState().parametresReducer.parametres.options;

    if (!payload.operator_id) {
      payload = {...payload, operator_id: user.user_id};
    }

    marketingServices.createAvoir({...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: marketingActionTypes.CREATE_AVOIR_SUCCESS, ...data });
        dispatch(peripheralActions.printAvoir(data));
        dispatch(notificationActions.syncDispatch('avoir', data));
        dispatch(getAvoirsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: marketingActionTypes.CREATE_AVOIR_FAILURE, error: error.toString() })
      }
    );
  }
}

function updateAvoir(payload) {
  return (dispatch, getState) => {
    dispatch({ type: marketingActionTypes.UPDATE_AVOIR_REQUEST });
    const {caisse} = getState().parametresReducer.parametres.options;
    

//    marketingServices.updateAvoir({...avoir, ...payload})
    marketingServices.updateAvoir({...payload, localsync:[caisse.uniqid]})
    .then(
      data => {
        dispatch({ type: marketingActionTypes.UPDATE_AVOIR_SUCCESS, ...data });
        dispatch(notificationActions.syncDispatch('avoir', data));
        dispatch(getAvoirsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: marketingActionTypes.UPDATE_AVOIR_FAILURE, error: error.toString() })
      }
    );
  }
}

function deleteAvoir(payload) {
  return dispatch => {
    dispatch({ type: marketingActionTypes.DELETE_AVOIR_REQUEST });

    marketingServices.deleteAvoir(payload)
    .then(
      data => {
        dispatch({ type: marketingActionTypes.DELETE_AVOIR_SUCCESS, ...data });
        dispatch(notificationActions.syncDispatch('deleteavoir', payload));
        dispatch(getAvoirsList());
      },
      error => {
        logger.error(error);
        dispatch({ type: marketingActionTypes.DELETE_AVOIR_FAILURE, error: error.toString() })
      }
    );
  }
}



function getReglesPanierList(params={}) {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_REGLESPANIER_LIST_REQUEST });

    return marketingServices.getReglesPanierList(params)
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_REGLESPANIER_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: marketingActionTypes.GET_REGLESPANIER_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}


function getReglesCatalogueList(params={}) {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_REGLESCATALOGUE_LIST_REQUEST });

    return marketingServices.getReglesCatalogueList(params)
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_REGLESCATALOGUE_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: marketingActionTypes.GET_REGLESCATALOGUE_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}


function getGiftsList(params={}) {

  return dispatch => {
    dispatch({ type: marketingActionTypes.GET_GIFTS_LIST_REQUEST });

    return marketingServices.getGiftsList(params)
    .then(
        data => { dispatch({ type: marketingActionTypes.GET_GIFTS_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { 
        logger.error(error);
        dispatch({ type: marketingActionTypes.GET_GIFTS_LIST_FAILURE, error: error.toString() }) 
      }
    );
  }
}

/** 
 * ajout / modif d'avoir depuis la synchro
 */
function setAvoirFromSync(payload) {
  return (dispatch, getState) => {

    const {data, emitter, response} = payload;

    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    const {localsync} = data;
    let __lsync = localsync || [];
    if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

    const __data = {...data, localsync:__lsync};

    marketingServices.updateAvoir(__data)
    .then(
      avoir => {

        dispatch({ type: marketingActionTypes.SET_AVOIR_FROM_SYNC, ...avoir });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('avoir', __data, emitter));
        }
        dispatch(getAvoirsList());
      }
    )
  }
}
/** 
 * suppression d'avoir depuis la synchro
 */
function deleteAvoirFromSync(payload) {
  return dispatch => {

    const {data, emitter, response} = payload;

    marketingServices.deleteAvoir(data)
    .then(
      avoir => {

        dispatch({ type: marketingActionTypes.DELETE_AVOIR_FROM_SYNC, ...avoir });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('deleteavoir', data, emitter));
        }
        dispatch(getAvoirsList());
      }
    )
  }
}

function burnGift(payload) {
  return async (dispatch, getState) => {
    const {partyid} = payload;


    dispatch({type: marketingActionTypes.BURN_GIFT_REQUEST, partyid});

    let __party = {};
    try {

      // récupération des données de cadeau depuis l'API luckylikes
      __party = await notificationServices.getGiftById(partyid);

      console.log('🎁 GIFT BY ID', __party);
    } catch(err) {
      console.warn(err);
      dispatch({type: marketingActionTypes.BURN_GIFT_FAILURE, error: err});
    }
    const { party } = __party;
    if ( party ) {

      let update = {
        ...__party,
        isBurned: true,
        burnDate: formatISO(new Date())
      };

      try {
        await notificationServices.burnGift(partyid, update);
        dispatch({type: marketingActionTypes.BURN_GIFT_SUCCESS});
      } catch(err) {
        console.warn(err);
        dispatch({type: marketingActionTypes.BURN_GIFT_FAILURE, error: err});
      }

    } 

  }
}

function getGiftById(payload) {
  return async (dispatch, getState) => {
    const {code} = payload;
    const {gifts} = getState().marketingReducer;


    console.log('🎁 MarketingActions.getGiftById()', code);
    dispatch({type: marketingActionTypes.GET_GIFT_REQUEST, code});

    // s'il y a des cadeaux prévus pour cette caisse (fichier "gifts.json" dans "data/")
    if (gifts && gifts.length>0) {
    
      let __party = null;
      try {

        // récupération des données de cadeau depuis l'API luckylikes
        __party = await notificationServices.getGift(code);
        let err = '';

        // si le cadeau est bien récupéré
        if ( Object.keys(__party.party).includes('hydra:member') ) {
          const party = __party.party['hydra:member'][0];

          // traitement des données :

          // - restaurant
          if (gifts[0].restau_id!==party.customer.id) {
            err = 'badrestau';
          }
          
          // - validité du cadeau (date de création + délai d'expiration)
          const _partylimite = add(new Date(party.date), {days: party.customer.delayGift});

          if (isBefore(_partylimite, new Date())) {
            console.log('🚧 GIFTS: détection de la validité désactivée.')
            // err = 'expired';
          }
          
          // - correspondance avec le cadeau en base locale
          const gift = gifts.find(g => g.gift_id===party.gift.id);
          if (gift===undefined) {
            err = 'badid';
          }

          // - cadeau déjà utilisé
          if (party.isBurned) {
            err = 'burned';
          }

          // en cas d'erreur
          if (err!=='') {
            Swal.fire({
              title: strings.modules.encaissement.gift.alertes[err].titre,
              text: strings.modules.encaissement.gift.alertes[err].texte,
              showCancelButton: false,
              focusCancel: true,
              focusConfirm: false
            });
            dispatch({type: marketingActionTypes.GET_GIFT_FAILURE, error: strings.modules.encaissement.gift.alertes[err].titre});

          } else {            
            dispatch({type: marketingActionTypes.GET_GIFT_SUCCESS, gift: {...gift, totalMin: party.customer.minimumBuyAmount, partyid: party.id}});
          }
        } else {
          dispatch({type: marketingActionTypes.GET_GIFT_FAILURE, error: 'Party inconnue'});
        }

      }
      catch(err) {
        dispatch({type: marketingActionTypes.GET_GIFT_FAILURE, error: err});
      }

    } else {
      // ERREUR : aucun cadeau activé pour le restau
      // NB : on lance "badid" à la place de "nogift" 
      //      pour ne pas indiquer au client qu'il n'y a aucun cadeau dans le restau
      Swal.fire({
        title: strings.modules.encaissement.gift.alertes.badid.titre,
        text: strings.modules.encaissement.gift.alertes.badid.texte,
        showCancelButton: false,
        focusCancel: true,
        focusConfirm: false
      });
      dispatch({type: marketingActionTypes.GET_GIFT_FAILURE, error: strings.modules.encaissement.gift.alertes.nogift.titre});
    }

  }
}


export const marketingActions = {
  getAvoirsList,
  createAvoir,
  updateAvoir,
  deleteAvoir,
  getReglesPanierList,
  getReglesCatalogueList,
  getGiftsList,
  setAvoirFromSync,
  deleteAvoirFromSync,
  burnGift,
  getGiftById
};