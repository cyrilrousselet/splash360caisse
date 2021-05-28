import { parametresActionTypes } from './parametresActionTypes';
import { parametresServices } from './parametresServices';
import { commandeActions } from './../commande/commandeActions';
import { peripheralActions } from '../peripheral/peripheralActions';
import Logger from '../../helpers/Logger';
import Swal from 'sweetalert2';
import moment from 'moment';
import schedule from 'node-schedule';
import externalParams from '../../constants/externalParams.json';


const logger = new Logger();


function replaceDatabase(database) {
  return (dispatch, getState) => {
    dispatch({type: parametresActionTypes.REPLACE_DATABASE_REQUEST, dd:database.database.parametres});

    parametresServices.replaceDatabase(database.database.parametres)
    .then(
      conf => {
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
      },
      error => dispatch({type: parametresActionTypes.REPLACE_DATABASE_SUCCESS})

    )
  }
}


function getAll() {
  return dispatch => {
   //   dispatch({ type: parametresActionTypes.GETALL_REQUEST });

      parametresServices.getAll()
          .then(
              data => dispatch({ type: parametresActionTypes.GETALL_SUCCESS, ...data }),
              error => dispatch({ type: parametresActionTypes.GETALL_FAILURE, error: error.toString() })
          );
  }
};


function update(payload) {
  return (dispatch, getState) => {
  //    dispatch({ type: parametresActionTypes.UPDATE_REQUEST });

      logger.log('ParametresActions.update', payload);

      parametresServices.update(payload)
          .then(
              data => {
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
                const { numerotation_start } = getState().parametresReducer.parametres.commandes;
                if (in_numerotation) dispatch(commandeActions.setNewNumero(numerotation_start));

              },
              error => dispatch({ type: parametresActionTypes.UPDATE_FAILURE, error: error.toString() })
          );
  }
};

function installStation() {
  return async (dispatch) => {

    const result = await Swal.fire({
      title: 'Installation de la caisse',
      text:'Veuillez renseigner l\'uniqid du restaurant',
      input:'text',
      confirmButtonText: 'Valider',
      showLoaderOnConfirm: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    
    if(null !== result.value) {
      parametresServices.installStation(result.value)
      .then(
        data => {
          console.log("DATA", data);
          const {client_id, client_secret} = data;
          console.log("CLIENT ID SECRET", client_id, client_secret);
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

          parametresServices.update(payload)
            .then(
              data => {
                dispatch({ type: parametresActionTypes.INSTALL_STATION_SUCCESS, ...data});
              }
            );

          // dispatch(update(payload));
          
        }, 
        error => dispatch({ type: parametresActionTypes.INSTALL_STATION_FAILURE, error: error.toString() })
      );
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
            console.log("GETSTATUS DATA", data);
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

    if(condition === 'online') {
      fetch(externalParams.synchro.ping, {
        mode: 'no-cors',
      })
      .then(() => {
        // Internet
        console.log("test co : internet");
        dispatch({type: parametresActionTypes.CONNECTION_TESTED, value: 'on'});
        // dispatch(checkStatusAndConnection());
        dispatch(checkConnection());
      }).catch(()=> {
        // Pas internet
        console.log("test co : pas internet");
        dispatch({type: parametresActionTypes.CONNECTION_TESTED, value: 'off'});
        // dispatch(checkStatusAndConnection());
        dispatch(checkConnection());
      })
    }
    else {
      // Pas internet
      console.log("test co : pas internet");
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
        var _blockstation_job = schedule.scheduleJob("blockstationJob", date.toDate(), () => {
          blockStation();
        });
        console.log("blockstationJob scheduled", _blockstation_job);
      }
    }
    else if(online === 'on') {
      if(localStorage.getItem("expireDate") != null) {
        localStorage.removeItem("expireDate");
        // Annuler le blockstationJob si existant
        if(typeof schedule.scheduledJobs["blockstationJob"] != 'undefined' ) {
          console.log("GONNA CANCEL JOB BLOCK");
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
//         console.log("blockstationJob scheduled", _blockstation_job);
//       }
//     }
//     else if(status === "authorized" && online ==='on') { // if authorized and online
//       if(localStorage.getItem("expireDate") != null) {
//         localStorage.removeItem("expireDate");
//         // Annuler le blockstationJob si existant
//         if(typeof schedule.scheduledJobs["blockstationJob"] != 'undefined' ) {
//           console.log("GONNA CANCEL JOB BLOCK");
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
  installStation,
  getStatus,
  checkStatus,
  testConnection,
  checkConnection,
  blockStation
};