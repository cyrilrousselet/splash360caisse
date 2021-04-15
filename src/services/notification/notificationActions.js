import { notificationActionTypes } from './notificationActionTypes';
import { notificationServices } from './notificationServices';

import { commandeActions } from '../commande/commandeActions';
import { commandeServices } from '../commande/commandeServices';
import { clotureActions } from '../cloture/clotureActions';
import { clotureServices } from '../cloture/clotureServices';

// import LocalizedStrings from 'react-localization';
// import {data} from '../../constants/translations';
import Swal from 'sweetalert2';
import { formatISO, differenceInMilliseconds, parseISO } from 'date-fns';
// import DateFnsUtils from '@date-io/date-fns';
// import frLocale from "date-fns/locale/fr";
 import Logger from '../../helpers/Logger';
import { commandeActionTypes } from '../commande/commandeActionTypes';
// import { catalogueActionTypes } from '../catalogue/catalogueActionTypes';
import { catalogueActions } from '../catalogue/catalogueActions';
import { parametresActions } from '../parametres/parametresActions';
import { parametresActionTypes } from '../parametres/parametresActionTypes';
import { peripheralActions } from '../peripheral/peripheralActions';
// const strings = new LocalizedStrings(data);
 const logger = new Logger();

function initSSE() {
  return (dispatch, getState) => {
    const { restaurant_id } = getState().parametresReducer.parametres.entreprise;

    logger.log('notificationActions.initSSE()');

    if (restaurant_id) {
      notificationServices.initSSE(restaurant_id)
      .then(
        data => dispatch({ type: notificationActionTypes.INIT_SSE, confirm: data.msg }),
        error => dispatch({ type: notificationActionTypes.INIT_SSE_FAILURE, error:error.msg })
      );
    } else {
      logger.log('restaurant_id unknown');
    }
  }
}

function setPOS(value) {
  return (dispatch, getState) => {
    const { store_id, pos_integration_enabled } = getState().parametresReducer.parametres.commandes;

    if (store_id && (undefined!==pos_integration_enabled)) {
      notificationServices.setPOS('uber', {store_id: store_id, integration: value})
                          .then(
                            success => dispatch({type: notificationActionTypes.SET_POS, integration: value}),
                            error => console.log('POS integration error')
                          )
    } else {
      logger.log('store_id unknown');
    }

  }
}

function setRestaurantOnline(value) {
  return (dispatch, getState) => {
    const { store_id, restaurant_online } = getState().parametresReducer.parametres.commandes;


    logger.log('setRestaurantOnline', value, `avant: ${restaurant_online}`);

    if (store_id && (undefined!==restaurant_online)) {
      notificationServices.setRestaurantOnline('uber', {store_id: store_id, online: value})
                          .then(
                            success => dispatch({type: notificationActionTypes.SET_RESTAURANT_ONLINE, online: value}),
                            error => logger.log('Uber Restaurant online error')
                          )
    } else {
      logger.log('store_id unknown');
    }

  }
}

function initSync() {
  return (dispatch, getState) => {
    const { options } = getState().parametresReducer.parametres;

    logger.log('initSync', options);
    logger.log('role', options.role, (options.role==='secondary'));


    if (options.role==='secondary') {
      notificationServices.connectToPrimary(options.primary, options.caisse)
      .then(result => {
        logger.log('initSync secondary', result);
        dispatch({type: notificationActionTypes.CONNECT_TO_PRIMARY});
      })
    } else if (options.role==='primary') {
      notificationServices.startSyncPrimary()
      .then(result => {
        logger.log('initSync primary', result);
        dispatch({type: notificationActionTypes.START_PRIMARY});
      })
    }
  }
}

function syncDispatch(db, data, emitter=null) {
  return (dispatch, getState) => {
    const { entreprise, options } = getState().parametresReducer.parametres;

    delete data._id;
    delete data.__v;

    console.log('NAct.syncDispatch()', db, data);
    if (options.role==='primary') {
      notificationServices.syncDispatch(db, data, emitter)
      .then(result => {
        logger.log('syncDispatch (primary)', result);
      });

      // update Produit / Ingredient sur BO
      notificationServices.syncCatalogue({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret, catalogue:{db:db, data:data}})
      .then(
        response => {
          dispatch(catalogueActions.setSyncedCatalogue(response.confirm))
        },
        error => {
          logger.error(error);
        }
      )

    }
    else if (options.role==='secondary') {
      notificationServices.syncPrimary(db, data, options.caisse, options.primary)
      .then(result => {
        logger.log('syncDispatch (secondary)', result);
      })
    }


    // update Produit / Ingredient sur UberEats
    const { store_id } = getState().parametresReducer.parametres.commandes;

    if (store_id && (['ingredient','produit']).includes(db)) {

      let prix = db==='ingredient' ? data.supplement : data.prix;
      let centimes = Math.round(Number(prix)*100);

      const update_data = {store_id: store_id, item_id: data.custom_id, properties: {active: data.active, price: centimes}};

      notificationServices.updateProduitUber('uber', update_data);
      
    }

  }
}

function treatment(data) {

  return (dispatch, getState) => {
    

    const {auto_accept_order} = getState().parametresReducer.parametres.commandes;

    if (data.eventType==='orders.notification') {

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });

      notificationServices.getOrder('uber', data)
      .then(
        reponse => {

          if (auto_accept_order) dispatch(acceptOrder('uber', reponse.order));
          else {

            logger.log('ORDER:', reponse.order);


            dispatch({ type: notificationActionTypes.ADD_TO_STACK, cmdcandidate: reponse.order });

            
            // Swal.fire({
            //   title: strings.notification.accept.uber.titre,
            //   html: strings.notification.accept.uber.texte+'<br />'+strings.notification.accept.uber.detail.replace('%NUMERO%',reponse.order.display_id).replace('%DATEHEURE%', format(new Date(reponse.order.estimated_ready_for_pickup_at), "d MMM yyyy à HH:mm", { locale: frLocale })),
            //   focusConfirm: true,
            //   showCancelButton: true,
            //   customClass: 'ubernotification',
            //   allowOutsideClick: false,
            //   allowEscapeKey: false,
            //   confirmButtonText: strings.general.dialog.accept,
            //   cancelButtonText: strings.general.dialog.deny,
            //   buttonsStyling: false 
            // }).then((result)=> {
            //   if (result.value===true) {
            //     dispatch(acceptOrder('uber', reponse.order));
            //    } else {
            //      dispatch(denyOrder('uber', reponse.order));
            //   }
            // });

          }
          
        },
        error => logger.log('Token error', error)
      );
    }
    else if (data.eventType==='newcommande') {

      const { entreprise } = getState().parametresReducer.parametres; 

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });

      notificationServices.getOrder( 'clickandcollect', {...data, id: entreprise.restaurant_id, secret: entreprise.restaurant_secret} )
      .then(
        response => {
          dispatch(commandeActions.setCommandeFromAPI( {data:{...response, provider:'clickandcollect'}} ))
        }
      //   error => logger.log('C&C getCommande Error')
      )

    }
  } 
}

function acceptOrder(provider, order) {
  logger.log('acceptOrder');
  return dispatch => {
    dispatch({ type: notificationActionTypes.ACCEPT_ORDER, id: order.display_id });
    notificationServices.acceptOrder(provider, order)
                        .then(
                          confirm => {
                            dispatch(commandeActions.setCommandeFromOrder(provider, order));
                            dispatch({ type: notificationActionTypes.REMOVE_FROM_STACK, cmdcandidateid: order.id });
                          },
                          error => dispatch({type: notificationActionTypes.ORDER_ERROR, error: error})
                        )
  }
}
function denyOrder(provider, order) {
  return dispatch => {
    dispatch({ type: notificationActionTypes.DENY_ORDER, id: order.id });
    dispatch({ type: notificationActionTypes.REMOVE_FROM_STACK, cmdcandidateid: order.id });
    notificationServices.denyOrder(provider, order);
  }
}

function confirmCommande(payload) {
  return (dispatch, getState) => {
    const { entreprise } = getState().parametresReducer.parametres; 

    logger.log('notAct.confirmCommande()');

    notificationServices.confirmCommande({
      id: entreprise.restaurant_id,
      secret: entreprise.restaurant_secret,
      ticketId: payload.ticketId,
      numero: payload.numero
    });
  }
}


function getToken(provider, task) {
  return (dispatch, getState) => {
    dispatch({ type: notificationActionTypes.GET_TOKEN, provider:provider });



    notificationServices.getToken(provider, task)
    .then(
      data => dispatch({ type: notificationActionTypes.GET_TOKEN_SUCCESS, data}),
      error => logger.log('ça va pas', error)
    )

  }
}

/**
 * Envoi de confirmation de synchronisation
 * Si la caisse est 'primary', 
 * elle confirme à la caisse 'secondary' qu'elle a reçu une synchro de commande via son API
 * 
 * @param {*} response  identifiant de l'objet response de la requête
 */
function syncConfirm(response, data=null) {
  return (dispatch, getState) => {

    // const { options } = getState().parametresReducer.parametres;
  //  if (options.role==='primary') {      
      notificationServices.syncConfirm(response, data)
      .then(
        confirm => { logger.log('notificationAction','synchro confirm sent')}
      );
   // }
  }
}

function syncConfirmToPrimary(data) {
  return (dispatch, getState) => {
    const { options } = getState().parametresReducer.parametres;
    if (options.role==='secondary') {
      notificationServices.syncConfirmToPrimary(options.primary, data)
      .then(
        confirm => { logger.log('notificationAction','synchro confirm sent to primary')}
      );
    }
  }
}

function sendNumero(payload) {
  return dispatch => {
    const {numero, response} = payload;
    notificationServices.sendNumero(numero, response)
    .then(
      confirm => { logger.log('sendNumero','numero sent') }
    )
  }
}

function getNewNumero() {
  return (dispatch, getState) => {

    const { options } = getState().parametresReducer.parametres;
    notificationServices.askNumero(options.primary)
    .then(conf => {
      console.log('NAct.getNewNumero()', conf.numero);
      dispatch({type: commandeActionTypes.GET_NUMERO, numero: conf.numero});
      dispatch(commandeActions.setNewNumero(conf.numero.value));
    })

  }
}

function getDatabase() {
  return (dispatch, getState) => {


    logger.log('getDatabase()');

    dispatch({type: notificationActionTypes.GET_DATABASE_REQUEST});
    const { entreprise } = getState().parametresReducer.parametres; 

    if (entreprise.restaurant_id==='' || entreprise.restaurant_secret==='') {
      Swal.fire({
        type: 'warning',
        title: 'Configuration incomplète',
        text: 'Vous devez renseigner les identifiants de restaurant pour pouvoir initialiser la caisse',
        showCancelButton: false,
        focusConfirm: true,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((result)=> {
        if (result.value) {
          dispatch(peripheralActions.quitApp());
        }
      });
    } else {


      notificationServices.getDatabase({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret})
      .then(database => {
        dispatch({type: notificationActionTypes.GET_DATABASE_SUCCESS});
        dispatch({type: parametresActionTypes.INSTALL_DATABASE, value:[]});
        dispatch(catalogueActions.replaceDatabase(database));
        dispatch(parametresActions.replaceDatabase(database));
      },
      error => {
        dispatch({type: notificationActionTypes.GET_DATABASE_FAILURE, error: error});
      });
    }
  }
}

function initSyncCommandes() {
  return (dispatch, getState) => {


    const { options } = getState().parametresReducer.parametres;

    if (options.role!=="secondary") {
      
      commandeServices.getCommandesToSync(100)
      .then(
        results => {
          const {commandes, chronos} = results;

          logger.log('initSyncCommandes chronos', chronos);
          logger.log('initSyncCommandes', commandes.length);
          if (commandes.length>0) {

            logger.log('preparation des commandes à envoyer au backo');

            const chrcommandes = commandes.map(c => {
              const chr = chronos ? chronos.find(h=>h.ticketId===c.ticketId) : undefined;
              if (chr!==undefined) {
                return {...c,
                        chrono: c.chrono || 0,
                        createdAt: formatISO(c.createdAt),
                        updatedAt: formatISO(c.updatedAt),
                        endTime: formatISO(chr.endTime),
                        careTime: chr.careTime.hasOwnProperty('firstCare') ? formatISO(chr.careTime.firstCare) : 0,
                        productionTime: chr.careTime.hasOwnProperty('firstCare') ? Math.round(differenceInMilliseconds(chr.endTime, chr.careTime.firstCare)/10)/100 : null,
                        waitTime: chr.careTime.hasOwnProperty('firstCare') ? Math.round(differenceInMilliseconds(chr.careTime.firstCare, parseISO(c.end))/10)/100 : null,
                      };
              } else {
                return {...c,
                  chrono: c.chrono || 0,
                  createdAt: formatISO(c.createdAt),
                  updatedAt: formatISO(c.updatedAt)
                };
              }
            });

            dispatch(syncCommandes(chrcommandes));
          }
        },
        error => {
          dispatch({type: notificationActionTypes.INIT_SYNC_COMMANDES_ERROR, error:error});
        }
      )
    } else {
      logger.log('role secondary : pas de synchro commandes');
    }
  };
}

function syncCommandes(commandes) {
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres; 

    const { options } = getState().parametresReducer.parametres;

    if (options.role!=="secondary") {

      notificationServices.syncCommandes({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret, commandes:commandes})
      .then(
        response => {
          dispatch(commandeActions.setSyncedCommands(response.confirm))
        },
        error => {
          logger.error(error);
        }
      )
    } else {
      logger.log('role secondary : pas de synchro commandes');
    }
  }
}

function resync(liste) {
  return (dispatch, getState) => {

    const {caisse} = getState().parametresReducer.parametres.options;

    notificationServices.resync(liste, caisse.uniqid)
    .then(
      response => { logger.log('resync', response) }
    )
  }
}


function checkStation() {
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres; 

    notificationServices.checkStation({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret})
    .then(
      response => {

        logger.log('station status', response);

        // si la réponse est négative
        if (response.status==='error') {


          // on laisse le compteur tourner

          Swal.fire({
            type: 'warning',
            title: 'Erreur d’activation',
            html: response.message.join('<br />'),
            showCancelButton: false,
            focusConfirm: true,
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then((result)=> {
            if (result.value) {
              dispatch(peripheralActions.quitApp());
            }
          });
        } else {

          // reset du compteur

        }
      },
      error => {
        logger.error(error);
      }
    )

  }
}



function initSyncClotures() {
  return (dispatch, getState) => {


    const { options } = getState().parametresReducer.parametres;

    if (options.role!=="secondary") {
      
      clotureServices.getCloturesToSync(50)
      .then(
        results => {
          const {clotures} = results;

          logger.log('initSyncClotures', clotures.length);
          if (clotures.length>0) {

            logger.log('preparation des clotures à envoyer au backo');

            const cloturesWOcmdtoarchive = clotures.map(c => {
                return {...c,
                  cmdtoarchive: []
                };
              
            });

            dispatch(syncClotures(cloturesWOcmdtoarchive));
          }
        },
        error => {
          dispatch({type: notificationActionTypes.INIT_SYNC_CLOTURES_ERROR, error:error});
        }
      )
    } else {
      logger.log('role secondary : pas de synchro clotures');
    }
  };
}

function syncClotures(clotures) {
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres; 

    const { options } = getState().parametresReducer.parametres;

    if (options.role!=="secondary") {

      notificationServices.syncClotures({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret, clotures:clotures})
      .then(
        response => {
          dispatch(clotureActions.setSyncedClotures(response.confirm))
        },
        error => {
          logger.error(error);
        }
      )
    } else {
      logger.log('role secondary : pas de synchro clotures');
    }
  }
}




export const notificationActions = {
  initSSE,
  setPOS,
  setRestaurantOnline,
  getToken,
  treatment,
  denyOrder,
  acceptOrder,
  initSync,
  syncDispatch,
  syncConfirm,
  syncConfirmToPrimary,
  sendNumero,
  getNewNumero,
  getDatabase,
  confirmCommande,
  initSyncCommandes,
  syncCommandes,
  initSyncClotures,
  syncClotures,
  checkStation,
  resync
};