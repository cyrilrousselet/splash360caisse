import { signatureActionTypes } from "./signatureActionTypes";
import { signatureServices } from "./signatureServices";

function getAll() {
  return async dispatch => {
    try {
      const signatures = await signatureServices.getAllSignatures();
      dispatch({ type: signatureActionTypes.GET_ALL, ...signatures });
    } 
    catch(error) {
      dispatch({ type: signatureActionTypes.GET_ALL_FAILURE, detail: error.message });
    }
  }
}


function storeKeys() {
  return (dispatch, getState) => {

    const {privateKey, publicKey} = getState().signatureReducer;

    if (!publicKey && !privateKey) {
      const keys = signatureServices.checkAndCreateKeys();
      dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, ...keys });
    }

  }
}

function updateSignature(type, signature) {
  return async dispatch => {

    // console.log('updateSignature('+type+', '+signature+')');

    const _sign = await signatureServices.persistSignature(type, signature);


    switch (type) {
      case 'tickets':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_TICKET, ticket: signature });
        break;
      case 'duplicatas':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_DUPLICATA, duplicata: signature });
        break;
      case 'grandstotaux_jour':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL_JOUR, grandtotal: signature });
        break;
      case 'grandstotaux_mois':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL_MOIS, grandtotal: signature });
        break;
      case 'grandstotaux_annee':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL_ANNEE, grandtotal: signature });
        break;
      case 'archivesfiscales':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_ARCHIVEFISCALE, archivefiscale: signature });
        break;
        case 'zdecaisse':
          dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_Z, zdecaisse: signature });
          break;
      case 'pistedaudit':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_PISTEDAUDIT, pistedaudit: signature });
        break;
      case 'jet':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_JET, jet: signature });
        break;
      default:
        return _sign; // selon jest, il faut un 'default' et il faut utiliser la constante '_sign', donc...
    }
  
  }
}

function updateNumerotation(type, numerotation) {
  return async dispatch => {

    signatureServices
      .persistNumerotation(type, numerotation)
      .then(res => 
        dispatch({ type: signatureActionTypes.UPDATE_NUMEROTATION, cle: type, valeur: numerotation })
      );

  }
}

function storeNumerotation() {
  return async (dispatch) => {

    const numerotation = await signatureServices.getAllNumerotation();

    if (numerotation) {
      let num = {};
      numerotation.forEach(n => {
        num[n.cle] = n.valeur;
      });
      
      dispatch({ type: signatureActionTypes.STORE_NUMEROTATION, ...num });
    }
    

  }
}

export const signatureActions = {
  getAll,
  storeKeys,
  storeNumerotation,
  updateSignature,
  updateNumerotation,
};