import { signatureActionTypes } from './signatureActionTypes';

const initialState = {
  tickets: [],
  notes: [],
  duplicatas: [],
  grandstotaux_jour: [],
  grandstotaux_mois: [],
  grandstotaux_annee: [],
  archivesfiscales: [],
  pistedaudit: [],
  zdecaisse: [],
  jet: [],
  privateKey: null,
  publicKey: null,
  trousseauId: null,
  integrite_error: false,
  sequence_error: false,
}

export function signatureReducer(state = initialState, action) {
  
  let { 
    tickets, 
    notes, 
    duplicatas, 
    grandstotaux_jour, 
    grandstotaux_mois, 
    grandstotaux_annee, 
    archivesfiscales, 
    pistedaudit, 
    zdecaisse, 
    jet 
  } = state;
  
  switch (action.type) {

    case signatureActionTypes.GET_ALL:
      return {
        ...state,
        tickets: action.tickets, 
        notes: action.notes, 
        duplicatas: action.duplicatas, 
        grandstotaux_jour: action.grandstotaux_jour, 
        grandstotaux_mois: action.grandstotaux_mois, 
        grandstotaux_annee: action.grandstotaux_annee, 
        archivesfiscales: action.archivesfiscales, 
        pistedaudit: action.pistedaudit, 
        zdecaisse: action.zdecaisse, 
        jet: action.jet
      }


    case signatureActionTypes.CREATE_SIGNATURE_TICKET:
      return {
        ...state,
        tickets: [...tickets, action.ticket]
      }

    case signatureActionTypes.CREATE_SIGNATURE_NOTE:
      return {
        ...state,
        notes: [...notes, action.note]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_DUPLICATA:
      return {
        ...state,
        duplicatas: [...duplicatas, action.duplicata]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL_JOUR:
      return {
        ...state,
        grandstotaux_jour: [...grandstotaux_jour, action.grandtotal]
      }
    
    case signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL_MOIS:
      return {
        ...state,
        grandstotaux_mois: [...grandstotaux_mois, action.grandtotal]
      }
      
    case signatureActionTypes.CREATE_SIGNATURE_GRANDTOTAL_ANNEE:
      return {
        ...state,
        grandstotaux_annee: [...grandstotaux_annee, action.grandtotal]
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

    case signatureActionTypes.INTEGRITE_ERROR:
      return {
        ...state,
        integrite_error: true
      };

    case signatureActionTypes.SEQUENCE_ERROR:
      return {
        ...state,
        sequence_error: true
      };
        
    default:
      return state;
  }
}