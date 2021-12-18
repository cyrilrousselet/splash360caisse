import format from 'date-fns/format';
import {evenements} from '../../constants/evenements';
import { signatureActions } from '../signature/signatureActions';
import { signatureServices } from '../signature/signatureServices';
import { journalServices } from './journalServices';


function log(code, description="") {
  return async (dispatch, getState) => {

    const { caisse } = getState().parametresReducer.parametres.options;
    const { privateKey } = getState().signatureReducer; 
    const { user } = getState().authentication;

    const __ecode = evenements[code];

    const __type = (__ecode.purgeable) ? 'jet' : 'pistedaudit';
    const __evtnum = (__ecode.purgeable) ? getState().numerotationReducer.jet : getState().numerotationReducer.pistedaudit;
    const __evtid = (__ecode.purgeable) ? 'JET' : 'PA';
    
    let __evt = {
      'JET-NID': __evtid + format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + __evtnum.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false}),
      'JET-EVT-NUM': code,
      'JET-EVT-LIB': evenements[code].intitule,
      'JET-OPE-NID': user ? user.user_id : 'auto',
      'JET-GDH': format(new Date(), 'yyyyMMddHHmmss'),
      'JET-INF': description,
      'JET-TAG-SIG': null
    };

    const lastSignature = await signatureServices.getLastSignature(__type);
    const {source, signature} = signatureServices.createJETSignature({...__evt, caisse: caisse}, privateKey, lastSignature);
 
    console.log(__evtid+' source : ',source);

    __evt['JET-TAG-SIG'] = signature;

    try {
      await journalServices.write(__evt, __type);

      dispatch( signatureActions.updateSignature(__type, signature) );
      dispatch( signatureActions.updateNumerotation(__type, __evtnum+1) );

    } catch(e) {
      console.error(e);
    }


  }
}


export const journalActions = {
  log
};