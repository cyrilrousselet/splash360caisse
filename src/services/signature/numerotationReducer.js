import { signatureActionTypes } from './signatureActionTypes';

const initialState = {
  ticket: 0,
  duplicata: 0,
  grandtotal: 0,
  cloture: 0,
  archivefiscale: 0,
  pistedaudit: 0,
  jet: 0,
}

export function numerotationReducer(state = initialState, action) {
   
  switch (action.type) {
    case signatureActionTypes.STORE_NUMEROTATION:
      return {
        ...state,
        ticket: action.ticket,
        duplicata: action.duplicata,
        grandtotal: action.grandtotal,
        cloture: action.cloture,
        archivefiscale: action.archivefiscale,
        pistedaudit: action.pistedaudit,
        jet: action.jet
      }
    
    case signatureActionTypes.UPDATE_NUMEROTATION:
      return {
        ...state,
        [action.cle]: action.valeur
      }
        
    default:
      return state;
  }
}