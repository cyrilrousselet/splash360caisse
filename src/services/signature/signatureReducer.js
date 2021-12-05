import { signatureActionTypes } from './signatureActionTypes';

const initialState = {
  tickets: [],
  duplicatas: [],
  grandstotaux: [],
  archivesfiscales: [],
  pistedaudit: [],
  zdecaisse: [],
  jet: [],
  privateKey: null,
  publicKey: null,
  trousseauId: null
}

export function signatureReducer(state = initialState, action) {
  
  let { tickets, duplicatas, grandstotaux, archivesfiscales, pistedaudit, zdecaisse, jet } = state;
  
  switch (action.type) {
    case signatureActionTypes.CREATE_SIGNATURE_TICKET:
      return {
        ...state,
        tickets: [...tickets, action.ticket]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_DUPLICATA:
      return {
        ...state,
        duplicatas: [...duplicatas, action.duplicata]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL:
      return {
        ...state,
        grandstotaux: [...grandstotaux, action.grandtotal]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_ARCHIVEFISCALE:
      return {
        ...state,
        archivesfiscales: [...archivesfiscales, action.archivefiscale]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_PISTEDAUDIT:
      return {
        ...state,
        pistedaudit: [...pistedaudit, action.pistedaudit]
      }

    case signatureActionTypes.CREATE_SIGNATURE_JET:
      return {
        ...state,
        jet: [...jet, action.jet]
      }

      case signatureActionTypes.CREATE_SIGNATURE_Z:
        return {
          ...state,
          zdecaisse: [...zdecaisse, action.zdecaisse]
        }
    
    case signatureActionTypes.STORE_KEYS_SUCCESS:
      return {
        ...state,
        privateKey: action.privateKey,
        publicKey: action.publicKey,
        trousseauId: action.trousseauId
      }
        
    default:
      return state;
  }
}