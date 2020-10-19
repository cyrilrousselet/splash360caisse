import { clotureActionTypes } from './clotureActionTypes';
import { clotureServices } from './clotureServices';
import { commandeActions } from '../commande/commandeActions';
import { peripheralActions } from '../peripheral/peripheralActions';

import { startOfToday, endOfToday, add, sub } from 'date-fns';
import { differenceInMinutes } from 'date-fns/esm';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import Swal from 'sweetalert2';
import Logger from '../../helpers/Logger';
const strings = new LocalizedStrings(data);

const logger = new Logger();

function getCloturesList(params={}) {

  return dispatch => {
    dispatch({ type: clotureActionTypes.GET_CLOTURES_LIST_REQUEST });

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

  return (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {commandeslist} = state.commandesListReducer;
    const {financier, entreprise} = state.parametresReducer.parametres;

  //  console.log(params);

    const { heure_fin } = entreprise;
    const hfin_ar = heure_fin.split(':');

    logger.log('heure_fin',heure_fin);

    // début / fin de la période :
    let periode_start = startOfToday();
    let periode_end = endOfToday();
    // si l'heure de fin définie est différente de minuit
    if (heure_fin!=="00:00") {
      // si l'heure actuelle est < à l'heure de fin de service, le début était hier
      if (differenceInMinutes(new Date(), new Date().setHours(hfin_ar[0],hfin_ar[1]))<0) {
        periode_start = sub(new Date(), {hours: 24}).setHours(hfin_ar[0],hfin_ar[1]);
        periode_end = new Date().setHours(hfin_ar[0],hfin_ar[1]);
      }
      // si l'heure actuelle est > à l'heure de fin, le début était ce aujourd'hui
      else {
        periode_start = new Date().setHours(hfin_ar[0],hfin_ar[1]);
        periode_end = add(new Date(), {hours: 24}).setHours(hfin_ar[0],hfin_ar[1]);
      }
    }
    
    // récup. cmd non clôturées
    const cmdopen = Object.values(commandeslist).filter(cmd=>((!cmd.hasOwnProperty('archived') || cmd.archived==null) && cmd.status!=='deleted' && (!cmd.hasOwnProperty('centre_revenu') || cmd.centre_revenu==='restaurant')));
    // const cmdopen = Object.values(commandeslist).filter(cmd=>((!cmd.hasOwnProperty('archived') || cmd.archived==null) && cmd.status!=='deleted'));

    logger.log('nbre cmd non archivées', cmdopen.length, '/', Object.values(commandeslist).length);

    // si les cmd non clôt. proviennent d'une période précédente.
    if (cmdopen.length>0) {
      const pastcmdopen = cmdopen.findIndex(oc=>differenceInMinutes(new Date(oc.updatedAt), periode_start)<0);
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
      debut: periode_start,
      fin: periode_end,
      extract: 'x'
    };

    params = {...default_params, ...params};
    

    const {periode} = clotureServices.getCurrentPeriode(commandeslist, catalogue, params)
    dispatch({ type: clotureActionTypes.GET_CURRENT_PERIODE, periode });
  }
}

function loadCloture(clotureId) {
  
}

function makeCloture(params={}) {
  return (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {commandeslist} = state.commandesListReducer;
    const {financier} = state.parametresReducer.parametres;

  //  console.log(commandeslist);

    const default_params =  {
      user: state.authentication.user,
      caisses: [],
      vendeurs: [],
      fdcaisse: financier.fonddecaisse_activation ? Number(financier.fonddecaisse_montant) : 0,
      debut: startOfToday(),
      fin: endOfToday(),
      extract: 'z'
    };

    params = {...default_params, ...params};
    
    const cloture = clotureServices.makeCloture(commandeslist, catalogue, params)

    clotureServices.saveCloture(cloture)
      .then(
        data => {
          dispatch(commandeActions.archiveCommands({cmd:cloture.archivedcommandesid, clotureId:cloture.clotureId}));
          dispatch({ type: clotureActionTypes.MAKE_CLOTURE, cloture });
          dispatch(getCloturesList());
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
  getCurrentPeriode,
  loadCloture,
  makeCloture,
  getCloturesList,
  setSyncedClotures
};