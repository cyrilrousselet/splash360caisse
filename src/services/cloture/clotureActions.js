import { clotureActionTypes } from './clotureActionTypes';
import { clotureServices } from './clotureServices';
import { commandeActions } from '../commande/commandeActions';
import { peripheralActions } from '../peripheral/peripheralActions';

import { differenceInMinutes } from 'date-fns/esm';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import Swal from 'sweetalert2';
import Logger from '../../helpers/Logger';
import { commandeServices } from '../commande/commandeServices';
import { dateBounds } from '../../helpers/toolbox';
const strings = new LocalizedStrings(data);

const logger = new Logger();


function getLast() {
  return dispatch => {
    dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_REQUEST, detail:"last" });

    return clotureServices.getLast()
    .then(
        data => { dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_FAILURE, error: error.toString() }) }
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
      error => { dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_FAILURE, error: error.toString() }) }
    );
  }
}

function getCloturesList(params={}) {

  return (dispatch) => {
    dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_REQUEST, criterias:params });

    return clotureServices.getCloturesList(params)
    .then(
        data => { dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_FAILURE, error: error.toString() }) }
    );
  }
}

function getCurrentPeriode(params={}) {

  return async (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {financier, entreprise} = state.parametresReducer.parametres;


    const { heure_fin } = entreprise;
    const __periode_bounds = dateBounds(new Date(), heure_fin);
    const periode_start = __periode_bounds.debut;


    // récup. cmd non clôturées
    const {commandeslist} = await commandeServices.getCommandesList({
      $and: [
        { archived: {$exists: false} },
        { status: { $ne: "deleted" } },
        { $or: [
          { centre_revenu: {$exists: false} },
          { centre_revenu: 'restaurant' }
        ]}
      ]
    });
    
    // const cmdopen = Object.values(commandeslist).filter(cmd =>
    //   (
    //     (!cmd.hasOwnProperty('archived') || cmd.archived==null) 
    //     && cmd.status!=='deleted' 
    //     && (!cmd.hasOwnProperty('centre_revenu') || cmd.centre_revenu==='restaurant')
    //   )
    // );
    // const cmdopen = Object.values(commandeslist).filter(cmd=>((!cmd.hasOwnProperty('archived') || cmd.archived==null) && cmd.status!=='deleted'));

    // logger.log('nbre cmd non archivées', cmdopen.length, '/', Object.values(commandeslist).length);

    // si les cmd non clôt. proviennent d'une période précédente.
    if (commandeslist.length>0) {
      const pastcmdopen = commandeslist.findIndex(oc=>differenceInMinutes(new Date(oc.updatedAt), periode_start)<0);
      logger.log('commandes provenant d’une période précédente', pastcmdopen);
      if (pastcmdopen>-1) {
        dispatch({ type: clotureActionTypes.PREVIOUS_PERIOD_ERROR });

        Swal.fire({
          title: strings.modules.cloture.alerte.cmdnoncloturees.titre,
          text: strings.modules.cloture.alerte.cmdnoncloturees.texte,
          focusConfirm: true,
          showCancelButton: false,
          customClass: 'differenterror',
          confirmButtonText: 'OK',
          buttonsStyling: false 
        }).then((result)=> {
       //   history.push(paths.CLOTURE);
        });
      }
    }

    const default_params =  {
      user: state.authentication.user,
      caisses: [], //[{id:0, nom: 'caisse 0'}],
      vendeurs: [], //[state.authentication.user],
      fdcaisse: (financier && financier.fonddecaisse_activation) ? Number(financier.fonddecaisse_montant) : 0,
      // debut: periode_start,
      // fin: periode_end,
      extract: 'x'
    };

    params = {...default_params, ...params};


    

    const {periode} = clotureServices.getCurrentPeriode(commandeslist, catalogue, params)
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


    logger.time('ClotureActions.getTodayCa');
    // const {ca, numtickets} = clotureServices.getTodayCa(heure_fin, commandeslist);
    const stats = await clotureServices.getTodayCa(lastperiode_end);
    const {ca, numtickets} = stats;
    logger.timeEnd('ClotureActions.getTodayCa', stats);
    dispatch({type: clotureActionTypes.GET_TODAY_CA, ca, numtickets})

  }
}


function loadCloture(clotureId) {
  
}

function makeCloture(params={}) {
  return async (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {financier} = state.parametresReducer.parametres;

  //  console.log(commandeslist);

    const default_params =  {
      user: state.authentication.user,
      caisses: [],
      vendeurs: [],
      fdcaisse: financier.fonddecaisse_activation ? Number(financier.fonddecaisse_montant) : 0,
      // debut: startOfToday(),
      // fin: endOfToday(),
      extract: 'z'
    };

    // récup. cmd non clôturées
    const {commandeslist} = await commandeServices.getCommandesList({
      $and: [
        { archived: {$exists: false} },
        { status: { $ne: "deleted" } },
        { $or: [
          { centre_revenu: {$exists: false} },
          { centre_revenu: 'restaurant' }
        ]}
      ]
    });


    params = {...default_params, ...params};
    
    const cloture = clotureServices.makeCloture(commandeslist, catalogue, params)

    clotureServices.saveCloture(cloture)
      .then(
        data => {
          dispatch(commandeActions.archiveCommands({cmd:cloture.archivedcommandesid, clotureId:cloture.clotureId}));
          dispatch({ type: clotureActionTypes.MAKE_CLOTURE, cloture });
          dispatch(getLast());
          dispatch(peripheralActions.printCloture(cloture));
        //  dispatch(notificationActions.syncClotures([data]));
        }
      )

  }
}


function setSyncedClotures(payload) {
  return dispatch => {
    dispatch({ type: clotureActionTypes.SETSYNCED_REQUEST });
    logger.log('setSyncedClotures()', payload);
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

export const clotureActions = {
  getLast,
  getCurrentPeriode,
  loadCloture,
  makeCloture,
  getCloturesList,
  getBoundedClotures,
  setSyncedClotures,
  getTodayCa
};