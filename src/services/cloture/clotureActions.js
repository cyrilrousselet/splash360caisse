import { clotureActionTypes } from './clotureActionTypes';
import { clotureServices } from './clotureServices';

import { startOfToday, endOfToday } from 'date-fns';



function getCurrentPeriode(params={}) {

  return (dispatch, getState) => {
   
    const state = getState();
    const catalogue = state.catalogueReducer;
    const {commandeslist} = state.commandesListReducer;

    console.log(commandeslist);
    const cloture_params =  {
                                      user: state.authentication.user,
                                      caisses: [{id:0, nom: 'caisse 0'}],
                                      vendeurs: [state.authentication.user],
                                      fdcaisse: 0,
                                      debut: startOfToday(),
                                      fin: endOfToday()
                                    };
    const periode = clotureServices.getCurrentPeriode(commandeslist, catalogue, cloture_params)
    dispatch({ type: clotureActionTypes.GET_CURRENT_PERIODE, periode });
  }
}

export const clotureActions = {
  getCurrentPeriode
};