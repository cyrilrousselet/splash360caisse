import { numeroActionTypes } from './numeroActionTypes';
import { numeroServices } from './numeroServices';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';
import { notificationServices } from '../notification/notificationServices';

// const logger = new Logger();




function resetNumero(val) {
  return (dispatch, getState) => {
    const newnumero = numeroServices.setNumero( null, getState().parametresReducer.parametres);
    dispatch({ type: numeroActionTypes.SET_NEW_NUMERO, numero: newnumero });
  }
}


function setNextNumero() {
  return async (dispatch, getState) => {

    const { numero } = getState().commandeReducer;
    const { parametres } = getState().parametresReducer;

    const newnumero = numeroServices.setNumero(numero, parametres);
    dispatch({ type: numeroActionTypes.SET_NEW_NUMERO, numero: newnumero });

  }
}


function getNumeroAPI(response) {

  return async (dispatch, getState) => {

    logger.info('NumeroActions.getNumeroAPI()');

    const {parametres} = getState().parametresReducer;
    const {numero} = getState().commandeReducer;


    const conf_numero = await numeroServices.getNumero(numero, parametres);
      
    // on renvoie le numÃ©ro Ã  la caisse secondary
    dispatch(notificationActions.sendNumero({numero: conf_numero, response}));

    // puis on appelle le numero suivant (Ã  stocker dans le reducer et le localStorage)
    dispatch(setNextNumero());

  }
}



function takeNumero(defaultnumero=false) {
  return async (dispatch, getState) => {
    
    logger.info('numeroActions.takeNumero()',defaultnumero);

    const {parametres} = getState().parametresReducer;
    const {numero} = getState().commandeReducer;


    // si la caisse est une secondary
    if (parametres.options.role==="secondary") {

      // on demande le numero Ã  la caisse primary
      const conf = await notificationServices.askNumero(parametres.options.primary)

      // et on attribue le numÃ©ro Ã  la commande
      dispatch({type: numeroActionTypes.GET_NUMERO, numero: conf.numero});
      
    }
    // si la caisse est une primary
    else {
      // on demande confirmation du numero :
      // - avons-nous changÃ© de jour ?
      // - sommes-nous arrivÃ©s au numÃ©ro maximal ?
      const conf_numero = await numeroServices.getNumero(numero, parametres);
      
      // et on attribue le numÃ©ro Ã  la commande
      dispatch({type: numeroActionTypes.GET_NUMERO, numero: conf_numero});

      // puis on appelle le numero suivant (Ã  stocker dans le reducer et le localStorage)
      dispatch(setNextNumero());
    }

  }
}

export const numeroActions = {
  resetNumero,
  getNumeroAPI,
  takeNumero,
  setNextNumero
}