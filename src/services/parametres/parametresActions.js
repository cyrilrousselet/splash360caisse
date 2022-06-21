import { parametresActionTypes } from './parametresActionTypes';
import { parametresServices } from './parametresServices';
import { peripheralActions } from '../peripheral/peripheralActions';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import Swal from 'sweetalert2';
import moment from 'moment';
import schedule from 'node-schedule';
import externalParams from '../../constants/externalParams.json';
import { numeroServices } from '../commande/numeroServices';
import { numeroActionTypes } from '../commande/numeroActionTypes';
import { journalActions } from '../journal/journalActions';
import { signatureServices } from '../signature/signatureServices';
import { signatureActions } from '../signature/signatureActions';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
const strings = new LocalizedStrings(data);

// const logger = new Logger();


function replaceDatabase(database) {
  return async (dispatch, getState) => {
    dispatch({type: parametresActionTypes.REPLACE_DATABASE_REQUEST, dd:database.database.parametres});

    try {
      await parametresServices.replaceDatabase(database.database.parametres);


      let entreprise = {};
      database.database.parametres.forEach(obj => {
        if (obj.domaine==="entreprise") {
          entreprise[obj.cle] = obj.valeur;
        }
      });
      console.log('ENTREPRISE', entreprise);

    
      dispatch({type: parametresActionTypes.REPLACE_DATABASE_SUCCESS});
      
      const {dbupdated} = getState().parametresReducer;
      let upd = ['parametres'];
      if (dbupdated) {
        upd = [...dbupdated, ...upd];
      }

      dispatch({type: parametresActionTypes.INSTALL_DATABASE, value:upd});


      if (dbupdated && dbupdated.length>=1) {
        dispatch(parametresActions.update({
          domaine: "options",
          cle: "first_start",
          valeur: false
        }));
      }


      const __memoire = [
        'denomination',
        'adresse',
        'code_postal',
        'ville',
        'pays',
        'siret',
        'rcs',
        'ape',
        'tva'
      ];

      const __memabs = __memoire.filter(e => !Object.keys(entreprise).includes(e));

      console.log('__memabs',__memabs);

      if (__memabs.length<1) {
        try {
          await signatureServices.persistMemoire({
            cle: "memoire",
            valeur: {
              denomination: entreprise.denomination,
              adresse: entreprise.adresse,
              code_postal: entreprise.code_postal,
              ville: entreprise.ville,
              pays: entreprise.pays,
              siret: entreprise.siret,
              rcs: entreprise.rcs,
              ape: entreprise.ape,
              tva: entreprise.tva
            }
          });
        } catch(e) {
          console.error(e);
        }
      }

    }
    catch(error) {
      dispatch({type: parametresActionTypes.REPLACE_DATABASE_FAILURE, error: error});
    }
    
  }
}


function getAll() {
  return async dispatch => {
      try {
        const data = await parametresServices.getAll()
        dispatch({ type: parametresActionTypes.GETALL_SUCCESS, ...data });
        dispatch(checkMandatoryData(data.parametres));
      } 
      catch(error) {
        dispatch({ type: parametresActionTypes.GETALL_FAILURE, error: error.toString() })
      }
  }
};

function checkMandatoryData(data) {
  return dispatch => {

    const {entreprise} = data;

    let liste = [];
    if (!entreprise.hasOwnProperty('denomination') || !entreprise.denomination) {liste.push('denomination');}
    if (!entreprise.hasOwnProperty('enseigne') || !entreprise.enseigne) {liste.push('enseigne');}
    if (!entreprise.hasOwnProperty('adresse') || !entreprise.adresse) {liste.push('adresse');}
    if (!entreprise.hasOwnProperty('code_postal') || !entreprise.code_postal) {liste.push('code_postal');}
    if (!entreprise.hasOwnProperty('ville') || !entreprise.ville) {liste.push('ville');}
    if (!entreprise.hasOwnProperty('pays') || !entreprise.pays) {liste.push('pays');}
    if (!entreprise.hasOwnProperty('siret') || !entreprise.siret) {liste.push('siret');}
    if (!entreprise.hasOwnProperty('rcs') || !entreprise.rcs) {liste.push('rcs');}
    if (!entreprise.hasOwnProperty('ape') || !entreprise.ape) {liste.push('ape');}
    if (!entreprise.hasOwnProperty('tva') || !entreprise.tva) {liste.push('tva');}

    console.log('checkMandatoryData()', liste);

    dispatch({ type: parametresActionTypes.CHECK_MANDATORY, mandatoryerror: liste.length>0 });

  }
}

function checkEntrepriseChange() {
  return async (dispatch, getState) => {
    const {entreprise} = getState().parametresReducer.parametres;

    const memoire = await signatureServices.getMemoire();


    console.log("checkEntrepriseChange", memoire);

    let __changed = false;
    let __cles = [];
    if (memoire.length>0) {
 
      Object.entries(memoire[0].valeur).forEach(([cle, valeur]) => {
        if (entreprise[cle] !== valeur) {
          __changed = true;
          __cles = [...__cles, cle];
        }
      });
      
    }
    if (__changed) {
      console.log('checkEntrepriseChange CHANGÉ', __cles.join(', '));
      dispatch(journalActions.log('410', 'Changement dans '+__cles.join(', ')));
    }

  }
}


function update(payload) {
  return (dispatch, getState) => {
  //    dispatch({ type: parametresActionTypes.UPDATE_REQUEST });

      logger.info('ParametresActions.update', payload);

      parametresServices.update(payload)
          .then(
              async data => {
                dispatch({ type: parametresActionTypes.UPDATE_SUCCESS, ...data });
                
                // si dans le payload on traite de la numérotation des commandes
                // parametres.commandes.numerotation_[start|hex|max]
                // on lance la mise à jour des numéros
                let in_numerotation = false;
                const __numkeys = ['numerotation_start', 'numerotation_hex', 'numerotation_max'];
                if (Array.isArray(payload)) {
                  in_numerotation =  payload.findIndex( obj => (obj.domaine==="commandes" && __numkeys.indexOf(obj.cle)>-1) ) > -1;
                }
                else {
                  in_numerotation = (payload.domaine==="commandes" && __numkeys.indexOf(payload.cle)>-1);
                }
                if (in_numerotation) {
                  // on vérifie que le numéro du reducer est en accord avec les nouveaux params
                  const {parametres} = getState().parametresReducer;
                  const {numero} = getState().commandeReducer;

                  const conf_numero = await numeroServices.getNumero(numero, parametres);
                  dispatch({ type: numeroActionTypes.SET_NEW_NUMERO, numero: conf_numero });
                  localStorage.setItem('numero', JSON.stringify(conf_numero));

                }

              },
              error => dispatch({ type: parametresActionTypes.UPDATE_FAILURE, error: error.toString() })
          );
  }
};

function installStation() {
  return async (dispatch) => {

    const choice = await Swal.fire({
      title: strings.installation.choice.titre,
      html: strings.installation.choice.texte,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: strings.installation.choice.confirm,
      denyButtonText: strings.installation.choice.deny,
      cancelButtonText: strings.installation.choice.cancel,
      showLoaderOnConfirm: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    });

    console.log('installStation()', choice);
    
    const newstation = choice.isConfirmed===true;

    if (choice.isDismissed && choice.dismiss==='cancel') {
      dispatch(peripheralActions.quitApp());
    }

    const result = await Swal.fire({
      title: newstation ? strings.installation.install.titre : strings.installation.reinstall.titre,
      text: newstation ?  strings.installation.install.texte : strings.installation.reinstall.texte,
      input:'text',
      confirmButtonText: strings.general.dialog.ok,
      showLoaderOnConfirm: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    });

    
    if(null !== result.value) {

      try {

        const data = await parametresServices.installStation(result.value, newstation);
        
        logger.info("DATA", data);
        const {client_id, client_secret, trousseau_id, private_key, public_key} = data;
        logger.info("CLIENT ID SECRET", client_id, client_secret);

        const payload = [{
          "domaine": "entreprise",
          "cle": "restaurant_id",
          "valeur": client_id
        },
        {
          "domaine": "entreprise",
          "cle": "restaurant_secret",
          "valeur": client_secret
        }];

        const trousseau = {
          trousseauId: trousseau_id,
          privateKey: private_key,
          publicKey: public_key
        };
        
        dispatch(journalActions.log('260', 'installation de la station'));
        
        dispatch(signatureActions.updateKeys(trousseau));

        const updatedata = await parametresServices.update(payload)
        dispatch({ type: parametresActionTypes.INSTALL_STATION_SUCCESS, ...updatedata}); 
        
      } 
      catch(error) {
        dispatch({ type: parametresActionTypes.INSTALL_STATION_FAILURE, error: error.toString() });
      }
    }
  }
}

function getStatus() {  // récupére le status de la station auprès du bo puis checkStatus
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres;

    if (entreprise.restaurant_id==='' || entreprise.restaurant_secret==='') {
      //dispatch fail
      dispatch({ type: parametresActionTypes.GET_STATUS_FAILURE, error: "NO ID SECRET"});
    }
    else {
      parametresServices.getStatus({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret})
        .then(
          data => {
            logger.info("GETSTATUS DATA", data);
            localStorage.setItem("status", data.status);
            // dispatch(checkStatusAndConnection());
            dispatch({type: parametresActionTypes.GETALL_SUCCESS}); 
            dispatch(checkStatus());           
          },
          error => {
            dispatch({ type: parametresActionTypes.GET_STATUS_FAILURE, error: "error"});
            dispatch(checkStatus()); 
          }
        );
    }
  }
}

function checkStatus() {
  return (dispatch, getState) => {
    const status = localStorage.getItem("status");

    console.log("checking status : ", status);
    if (status === "blocked") {
      dispatch(blockStation());
    }
    dispatch({type: parametresActionTypes.STATUS_CHECKED});
  }
}

function testConnection() {
  return (dispatch, getState) => {
    const condition = navigator.onLine ? 'online' : 'offline';

    const {online} = getState().parametresReducer;

    if(condition === 'online') {
      fetch(externalParams.synchro.ping, {
        mode: 'no-cors',
      })
      .then(() => {
        // Internet
        // logger.info("test co : internet");
        if (online==='off') {
          dispatch(journalActions.log('120', 'connexion active'));
        }
        dispatch({type: parametresActionTypes.CONNECTION_TESTED, value: 'on'});
        dispatch(checkConnection());
      }).catch((err) => {
        // Pas internet
        logger.info("test co : pas internet");
        logger.error(err);
        dispatch(journalActions.log('70','hors connexion'));
        dispatch({type: parametresActionTypes.CONNECTION_TESTED, value: 'off'});
        // dispatch(checkStatusAndConnection());
        dispatch(checkConnection());
      })
    }
    else {
      // Pas internet
      logger.info("test co : pas internet");
      dispatch(journalActions.log('70','hors connexion'));
      dispatch({type: parametresActionTypes.CONNECTION_TESTED, value: 'off'});
      // dispatch(checkStatusAndConnection());
      dispatch(checkConnection());
    }
  }
}

function checkConnection() {
  return (dispatch, getState) => {
    const {online} = getState().parametresReducer;

    if(online !== 'on') {
      if(localStorage.getItem("expireDate") === null) {
        let date = moment().add(7, 'd'); // expiredate = now + 1 week
        localStorage.setItem("expireDate", date); 
        //Schedule blockstationJob
        schedule.scheduleJob("blockstationJob", date.toDate(), () => {
          blockStation();
        });
        // var _blockstation_job = schedule.scheduleJob("blockstationJob", date.toDate(), () => {
        //   blockStation();
        // });
        // logger.info("blockstationJob scheduled", _blockstation_job);
      }
    }
    else if(online === 'on') {
      if(localStorage.getItem("expireDate") != null) {
        localStorage.removeItem("expireDate");
        // Annuler le blockstationJob si existant
        if(typeof schedule.scheduledJobs["blockstationJob"] != 'undefined' ) {
          logger.info("GONNA CANCEL JOB BLOCK");
          var job = schedule.scheduledJobs["blockstationJob"];
          job.cancel();
        }
      }
    }
  }
}

// function checkStatusAndConnection() { //checkStatus&internet ?   gère la planification du blocage en foction du status actuel
//   return (dispatch, getState) => {
//     const {online} = getState().parametresReducer;
//     const status = localStorage.getItem("status");

//     if (status != "authorized" || online === 'off') { // if blocked or no connection
//       if(localStorage.getItem("expireDate") === null) { // if expiredate == null
//         let date = moment().add(7, 'd'); // expiredate = now + 1 week
//         localStorage.setItem("expireDate", date); 
//         //Schedule blockstationJob
//         var _blockstation_job = schedule.scheduleJob("blockstationJob", date.toDate(), () => {
//           blockStation();
//         });
//         logger.info("blockstationJob scheduled", _blockstation_job);
//       }
//     }
//     else if(status === "authorized" && online ==='on') { // if authorized and online
//       if(localStorage.getItem("expireDate") != null) {
//         localStorage.removeItem("expireDate");
//         // Annuler le blockstationJob si existant
//         if(typeof schedule.scheduledJobs["blockstationJob"] != 'undefined' ) {
//           logger.info("GONNA CANCEL JOB BLOCK");
//           var job = schedule.scheduledJobs["blockstationJob"];
//           job.cancel();

//         }
//       }
//     }
//     dispatch({type: parametresActionTypes.CHECK_STATUS_AND_CONNECTION_SUCCESS});
//   }
// }

function blockStation() {
  return (dispatch, getState) => {
    Swal.fire({
      title: 'Station bloquée',
      text:'Cette station a été bloquée.',
      confirmButtonText: 'Eteindre la station',
      showLoaderOnConfirm: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((result) => {
        if (result.value) {
          dispatch(peripheralActions.quitApp());
        }
      }
    );
  }
}

export const parametresActions = {
  getAll,
  update,
  replaceDatabase,
  checkEntrepriseChange,
  installStation,
  getStatus,
  checkStatus,
  testConnection,
  checkConnection,
  blockStation
};