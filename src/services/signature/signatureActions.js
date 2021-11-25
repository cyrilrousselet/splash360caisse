import { signatureActionTypes } from "./signatureActionTypes";
import { signatureServices } from "./signatureServices";

function getAll() {
  return async dispatch => {
    try {
      const signatures = await signatureServices.getAll();
      dispatch({ type: signatureActionTypes.GET_ALL, signatures });
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
      const {cleprivee, clepublique} = signatureServices.checkAndCreateKeys();
      dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, privateKey: cleprivee, publicKey: clepublique });
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
      case 'grandstotaux':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL, grandtotal: signature });
        break;
      case 'archivesfiscales':
        dispatch({ type: signatureActionTypes.CREATE_SIGNATURE_ARCHIVEFISCALE, archivefiscale: signature });
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