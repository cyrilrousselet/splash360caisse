import { clotureActionTypes } from './clotureActionTypes';
import { clotureServices } from './clotureServices';
import { commandeActions } from '../commande/commandeActions';
import { peripheralActions } from '../peripheral/peripheralActions';

import { startOfToday, endOfToday } from 'date-fns';


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

    console.log(params);

    const default_params =  {
      user: state.authentication.user,
      caisses: [], //[{id:0, nom: 'caisse 0'}],
      vendeurs: [], //[state.authentication.user],
      fdcaisse: (financier && financier.fonddecaisse_activation) ? Number(financier.fonddecaisse_montant) : 0,
      debut: startOfToday(),
      fin: endOfToday(),
      extract: 'x'
    };

    params = {...default_params, ...params};
    

    const {periode} = clotureServices.getCurrentPeriode(commandeslist, catalogue, params)
    dispatch({ type: clotureActionTypes.GET_CURRENT_PERIODE, periode });
  }
}

function makeCloture(params={}) {
  return (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {commandeslist} = state.commandesListReducer;
    const {financier, entreprise} = state.parametresReducer.parametres;

    console.log(commandeslist);

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
  //        dispatch(peripheralActions.printCloture());
        }
      )

  }
}

export const clotureActions = {
  getCurrentPeriode,
  makeCloture
};