import format from 'date-fns/format';
import {evenements} from '../../constants/evenements';
import { signatureActions } from '../signature/signatureActions';
import { signatureServices } from '../signature/signatureServices';
import { journalServices } from './journalServices';
import { remote } from 'electron';
import { last } from 'lodash';
import { journalActionTypes } from './journalActionTypes';
import { signatureActionTypes } from '../signature/signatureActionTypes';

const { app } = remote;
const fs = require('fs').promises;


function log(code, description="") {
  return async (dispatch, getState) => {

    const { caisse } = getState().parametresReducer.parametres.options;
    const { privateKey, trousseauId } = getState().signatureReducer; 
    const { user } = getState().authentication;
    
    let key = privateKey;
    let keyid = trousseauId;
    
    // let create_trousseau = null;
    if (!privateKey) {
      const trousseau = await signatureServices.checkAndCreateKeys();
      dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, ...trousseau });
      key = trousseau.privateKey;
      keyid = trousseau.trousseauId;
      // create_trousseau = trousseau.create;
    }

    const __ecode = evenements[code];

    const __type = (__ecode.purgeable) ? 'jet' : 'pistedaudit';
    const __evtid = (__ecode.purgeable) ? 'JET' : 'PA';

    let lastSignature = null;
    if (__type==='jet') {
      lastSignature = last(getState().signatureReducer.jet);
    } else {
      lastSignature = last(getState().signatureReducer.pistedaudit);
    }

    if (!lastSignature) {
      lastSignature = await signatureServices.getLastSignature(__type);
    }
    
    const __evtnum = (__ecode.purgeable) ? getState().numerotationReducer.jet : getState().numerotationReducer.pistedaudit;

    dispatch( signatureActions.updateNumerotation(__type, __evtnum+1) );
    
    let __evt;

    if (caisse) {

      __evt = {
        'JET-NID': __evtid + format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + __evtnum.toLocaleString('en-US',{minimumIntegerDigits: 8, useGrouping: false}),
      };
    } else {
      __evt = {
        'JET-X-NID': __evtid + format(new Date(),'yyMM-') + 'cXXX-00000000',
      };
    }

    
    
    __evt = {
      ...__evt,
      'JET-EVT-NUM': code,
      'JET-EVT-LIB': evenements[code].intitule,
      'JET-OPE-NID': user ? user.user_id : 'auto',
      'JET-GDH': format(new Date(), 'yyyyMMddHHmmss'),
      'JET-INF': description,
      'JET-TAG-ID-KEY': keyid,
      'JET-TAG-SIG-PRV': lastSignature,
      'JET-TAG-SIG': null,
      // 'JET-TAG-HMAC': null,
      // 'JET-TAG-ARG': null,
    };

    let signature = '';
    let hmac = '';
    let source = '';
    if (caisse) {
      const js = signatureServices.createJETSignature({...__evt, caisse: caisse}, key, lastSignature);
      signature = js.signature;
      hmac = js.hmac;
      source = js.source;
    }
 
    // console.log(__evtid+' source : ',source);

    __evt['JET-TAG-SIG'] = signature;
    // __evt['JET-TAG-HMAC'] = hmac;
    // __evt['JET-TAG-ARG'] = source;

    if (caisse) {
      dispatch( signatureActions.updateSignature(__type, signature) );
    }


    try {
      await journalServices.write(__evt, __type);

    } catch(e) {
      console.error(e);
    }

    // if (create_trousseau) dispatch(log('450',`nouveau trousseau ${keyid}`));
  }
}

function signPrevious(type) {
  return async (dispatch, getState) => {

    const { privateKey, trousseauId } = getState().signatureReducer;

    console.log('signPrevious', privateKey ? 'ok':'KO');

    let key = privateKey;
    let keyid = trousseauId;
    
    // let create_trousseau = null;
    if (!privateKey) {
      const trousseau = await signatureServices.checkAndCreateKeys();
      dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, ...trousseau });
      key = trousseau.privateKey;
      keyid = trousseau.trousseauId;
      // create_trousseau = trousseau.create;
    }

    const actualfile = await journalServices.getFilename(type);
    const __acj = await fs.readFile(`${app.getPath('userData')}/compta/${actualfile}`);
    const __hh = __acj.toString().includes('"type":"FICHIER PRECEDENT"');

    if (!__hh) {

      const prevFilename = await journalServices.getPreviousFilename(type);
      if (prevFilename) {

        const __cont = await fs.readFile(`${app.getPath('userData')}/compta/${prevFilename}`);
        const { hmac, signature } = await signatureServices.createSignature(__cont.toString(), key); 

        await journalServices.setSignature({
          type: 'FICHIER PRECEDENT',
          filename: prevFilename,
          hmac: hmac,
          keyid: keyid,
          signature: signature
        },
        type);

        dispatch({ type: (type==='jet') ? journalActionTypes.SIGNE_JET : journalActionTypes.SIGNE_PISTEDAUDIT, filename: prevFilename, hmac: hmac });

      }
    } else {
      console.log('previous hash ('+type+') already set');
    }
    // if (create_trousseau) dispatch(log('450',`nouveau trousseau ${keyid}`));
  }
}

function sign(filename, type) {
  return async (dispatch, getState) => {

    const { privateKey, trousseauId } = getState().signatureReducer;

    console.log('signPrevious', privateKey ? 'ok':'KO');
    let key = privateKey;
    let keyid = trousseauId;
    
    // let create_trousseau = null;
    if (!privateKey) {
      const trousseau = await signatureServices.checkAndCreateKeys();
      dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, ...trousseau });
      // create_trousseau = trousseau.create;
      key = trousseau.privateKey;
      keyid = trousseau.trousseauId;
    }

    const __filename = last(filename.split('/'));
  
    const __jetcont = await fs.readFile(`${app.getPath('userData')}/compta/${__filename}`);
    const { hmac, signature } = await signatureServices.createSignature(__jetcont.toString(), key); 
  
    await journalServices.setSignature({
      type: 'FICHIER PRECEDENT',
      filename: __filename,
      hmac: hmac,
      keyid: keyid,
      signature: signature
    },
    type);

    dispatch({ type: (type==='jet') ? journalActionTypes.SIGNE_JET : journalActionTypes.SIGNE_PISTEDAUDIT, filename: __filename, hmac: hmac });
    // if (create_trousseau) dispatch(log('450',`nouveau trousseau ${keyid}`));
  }
}

function check(type) {
  return async (dispatch, getState) => {

    const { privateKey } = getState().signatureReducer;
    const { caisse } = getState().parametresReducer.parametres.options;

    if (caisse) {
      const journal = type==='jet' ? 'JET' : 'PA';

      console.log('signPrevious', privateKey ? 'ok':'KO');
      let key = privateKey;
      // let keyid = trousseauId;
      
      // let create_trousseau = null;
      if (!privateKey) {
        const trousseau = await signatureServices.checkAndCreateKeys();
        dispatch({ type: signatureActionTypes.STORE_KEYS_SUCCESS, ...trousseau });
        // create_trousseau = trousseau.create;
        key = trousseau.privateKey;
        // keyid = trousseau.trousseauId;
      }

      // on récupère le nom du dernier fichier du type
      const filename = await journalServices.getFilename(type);
      console.log('JOURNAL CHECK', filename);

      if (!filename) return console.warn(`aucun journal (${journal})`);

      // on récupère le fichier
      const __cont = await fs.readFile(`${app.getPath('userData')}/compta/${filename}`);

      if (!__cont) return console.warn(`aucun fichier journal (${journal}) trouvé`);

      // on le formate en bon JSON
      const json_string = '['+__cont.toString().split('\n').join(',').slice(0,-1)+']';
      
      // console.log('json_string', json_string);
      
      // et on le parse
      const json = JSON.parse(json_string);

      // on supprime les entrées "non-JET"
      const evenements = json.filter(evt => evt.hasOwnProperty('JET-NID'));

      console.log(`EVENEMENTS ${journal} (${filename}`, evenements);

      let integ_error = false;
      let seq_error = false;
      let prevNIDnum = null;
      let prevId = null;
      let prevSign = null;
      let prevTrousseau = null;
      let integ_detection = [];
      let seq_detection = [];
      evenements.forEach(evt => {
        if (prevSign) {

          // on teste l'intégrité uniquement si les deux événements ont la même clé de chiffrement
          if (prevTrousseau === evt['JET-TAG-ID-KEY']) {
            
            const { source, hmac, signature } = signatureServices.createJETSignature({...evt, caisse: caisse}, key, prevSign); 
            if (signature !== evt['JET-TAG-SIG']) {
              integ_error = true;
              console.log("EVT SRC",source)

              integ_detection = [...integ_detection, prevId+" avec "+evt['JET-NID']];
            }

          }
          const NIDnum = parseInt(evt['JET-NID'].split('-')[2]);
          
          // console.log('SEQU CHECK '+journal, NIDnum, prevNIDnum);
          if (NIDnum !== (prevNIDnum + 1)) {
            // console.log('SEQU ERROR : '+journal, NIDnum, prevNIDnum);
            seq_error = true;
            seq_detection = [...seq_detection, prevId+" avec "+evt['JET-NID']];
          }
        }
        prevSign = evt['JET-TAG-SIG'];
        prevId = evt['JET-NID'];
        prevNIDnum = parseInt(evt['JET-NID'].split('-')[2]);
        prevTrousseau = evt['JET-TAG-ID-KEY'];
      });

      if (integ_error) {
        dispatch({ type: signatureActionTypes.INTEGRITE_ERROR, detail: journal });
        dispatch(log('90', `détecté dans ${journal} (${filename}) : ${integ_detection.join(', ')}`));
      }
      if (seq_error) {
        dispatch({ type: signatureActionTypes.SEQUENCE_ERROR, detail: journal });
        dispatch(log('95', `détecté dans ${journal} (${filename}) : ${seq_detection.join(', ')}`));
      }

      // // on récupère la signature du fichier précédent :
      // const filesign_obj = json.find(evt => !evt.hasOwnProperty('JET-NID') && !evt.hasOwnProperty('JET-X-NID'));
      // console.log('JOURNAL CHECK filesign', filesign_obj);

      // if (!filesign_obj) return console.warn(`aucune signature du fichier précédent détéctée dans le ${journal} courant`);

      // // on récupère le fichier précédent
      // const __prevcont = await fs.readFile(`${app.getPath('userData')}/compta/${filesign_obj.filename}`);
      // const { signature } = signatureServices.createSignature(__prevcont.toString(), key)
      
      // if (signature !== filesign_obj.signature) {
      //   dispatch(log('90', `détecté dans ${journal} ${filesign_obj.filename} (fichier entier)`));
      // }
        
    }


  }
}


export const journalActions = {
  log,
  signPrevious,
  sign,
  check,
};