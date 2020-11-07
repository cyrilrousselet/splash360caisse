import { numeroActionTypes } from './numeroActionTypes';
import { numeroServices } from './numeroServices';
import Logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';
import { notificationServices } from '../notification/notificationServices';

const logger = new Logger();




function resetNumero(val) {
  return (dispatch, getState) => {
    const {commande} = getState().commandeReducer;
    const { numerotation_start } = getState().parametresReducer.parametres.commandes;
    dispatch(setNewNumero(numerotation_start));
    if (commande.hasOwnProperty('ticketId')) {
      dispatch(takeNumero());
    }
  }
}


function setNewNumero(defaultValue=null) {

  return (dispatch, getState) => {

    logger.log('NumeroActions.setNewNumero',defaultValue);

    const numero = defaultValue!==null ? {value: defaultValue-1, updated: new Date()} : getState().commandeReducer.numero; 

    const newnumero = numeroServices.setNumero( getState().parametresReducer.parametres, numero);
    dispatch({ type: numeroActionTypes.SET_NEW_NUMERO, newnumero });

  }
}



function loadNumero() {
  return (dispatch, getState) => {
    const {numero} = getState().commandeReducer;

    if (null!==numero) dispatch(takeNumero());
  }
}


function getNumeroAPI(response) {

  return (dispatch, getState) => {

    logger.log('NumeroActions.getNumeroAPI()');

    const numero = getState().commandeReducer.numero;
    const {commande} = getState().commandeReducer;

    dispatch(notificationActions.sendNumero({numero, response}));

    if (commande.hasOwnProperty('ticketId')) {
      dispatch(takeNumero());
    } else {
      dispatch(setNewNumero());
    }



  }
}



function takeNumero() {
  return async (dispatch, getState) => {
    
    logger.log('numeroActions.takeNumero()');

    const {parametres} = getState().parametresReducer;
    const {numero} = getState().commandeReducer;

    const newnumero = await _getNumero(parametres, numero);

    dispatch({type: numeroActionTypes.GET_NUMERO, numero: newnumero});
    if (parametres.options.role==="secondary") {
      dispatch(setNewNumero(newnumero.value));
    } else {  
      dispatch(setNewNumero());
    }

  }
}



async function _getNumero(parametres, numero) {

  logger.log('NumeroActions._getNumero', numero);

  if (parametres.options.role==="secondary") {
    logger.log('NumeroActions._getNumero() from primary');
    const conf = await notificationServices.askNumero(parametres.options.primary)
    return conf.numero;
  }
  else {
    const nnumero = numeroServices.setNumero( parametres, numero);
    // const nnumero = commandeServices.getNewNumero( parametres, null);
    logger.log('NumeroActions._getNumero() from primary', nnumero);
    return nnumero;
  }

}

export const numeroActions = {
  setNewNumero,
  resetNumero,
  getNumeroAPI,
  takeNumero,
  _getNumero,
  loadNumero
}