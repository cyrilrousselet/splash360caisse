import { numeroActionTypes } from './numeroActionTypes';
import { numeroServices } from './numeroServices';
import logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';
import { notificationServices } from '../notification/notificationServices';





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

    logger.info('NumeroActions.setNewNumero',defaultValue);

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

  return async (dispatch, getState) => {

    logger.info('NumeroActions.getNumeroAPI()');

    const {parametres} = getState().parametresReducer;
    const {numero} = getState().commandeReducer;

    const newnumero = await _getNumero(parametres, numero);

  //  dispatch({type: numeroActionTypes.GET_NUMERO, numero: newnumero});
    // const {commande} = getState().commandeReducer;

    dispatch(notificationActions.sendNumero({numero: newnumero, response}));
    // if (parametres.options.role==="secondary") {
    //   dispatch(setNewNumero(newnumero.value));
    // } else {  
      dispatch(setNewNumero());
    // }

    // if (commande.hasOwnProperty('ticketId')) {
    //   dispatch(takeNumero());
    // } else {
    //   dispatch(setNewNumero());
    // }



  }
}



function takeNumero() {
  return async (dispatch, getState) => {
    
    logger.info('numeroActions.takeNumero()');

    const {parametres} = getState().parametresReducer;
    const {numero} = getState().commandeReducer;

    _getNumero(parametres, numero)
    .then(newnumero => {

      dispatch({type: numeroActionTypes.GET_NUMERO, numero: newnumero});
      if (parametres.options.role==="secondary") {
        dispatch(setNewNumero(newnumero.value));
      } else {  
        dispatch(setNewNumero());
      }
      
    });
  }
}



async function _getNumero(parametres, numero) {

  logger.info('NumeroActions._getNumero', numero);

  if (parametres.options.role==="secondary") {
    logger.info('NumeroActions._getNumero() from primary');
    const conf = await notificationServices.askNumero(parametres.options.primary)
    return conf.numero;
  }
  else {
    const nnumero = numeroServices.setNumero( parametres, numero);
    // const nnumero = commandeServices.getNewNumero( parametres, null);
    logger.info('NumeroActions._getNumero() from primary', nnumero);
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