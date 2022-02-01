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
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
// import { commandeActionTypes } from '../commande/commandeActionTypes';
// import { catalogueActionTypes } from '../catalogue/catalogueActionTypes';
import { catalogueActions } from '../catalogue/catalogueActions';
import { parametresActions } from '../parametres/parametresActions';
import { parametresActionTypes } from '../parametres/parametresActionTypes';
import { peripheralActions } from '../peripheral/peripheralActions';
import LodashId from 'lodash-id';
import { journalActions } from '../journal/journalActions';
// const strings = new LocalizedStrings(data);
//  const logger = new Logger();

function initSSE() {
  return (dispatch, getState) => {
    const { restaurant_id } = getState().parametresReducer.parametres.entreprise;

    logger.info('notificationActions.initSSE()');

    if (restaurant_id) {
      notificationServices.initSSE(restaurant_id)
      .then(
        data => {
          dispatch({ type: notificationActionTypes.INIT_SSE, confirm: data.msg });
          if (data.msg==="ca_va_pas") {
            dispatch(initSSE());
          }
        },
        error => dispatch({ type: notificationActionTypes.INIT_SSE_FAILURE, error:error.msg })
      );
    } else {
      logger.info('restaurant_id unknown');
    }
  }
}

function checkNotif() {
  return (dispatch, getState) => {
    const { testtoken } = getState().notificationReducer;
    const {restaurant_id, restaurant_secret} = getState().parametresReducer.parametres.entreprise;

    // si le token n'est pas null, c'est qu'un test est en cours mais sans réponse
    if (testtoken) {
      // on demande donc le redémarrage du SSE
      dispatch({ type: notificationActionTypes.TEST_NOTIF_FAILURE });
      notificationServices.resetSSE(restaurant_id);
    } 
    //
    else {
      const newtesttoken = 'tt_'+LodashId.createId();
      dispatch({ type: notificationActionTypes.TEST_NOTIF_REQUEST, testtoken: newtesttoken });
      notificationServices.checkNotif({ id: restaurant_id, secret: restaurant_secret, testtoken: newtesttoken });
      
      // on attend 3 sec. pour voir si le serveur à répondu en envoyant une notif
      setTimeout(()=>{
        // si le serveur n'a pas répondu, on demande le redémarrage du SSE
        if (getState().notificationReducer.testtoken !== null) {
          dispatch({ type: notificationActionTypes.TEST_NOTIF_FAILURE });
          notificationServices.resetSSE(restaurant_id);
        }
      }, 4500);
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
                            error => logger.info('POS integration error')
                          )
    } else {
      logger.info('store_id unknown');
    }

  }
}

function setRestaurantOnline(value) {
  return (dispatch, getState) => {
    const { store_id, restaurant_online } = getState().parametresReducer.parametres.commandes;


    logger.info('setRestaurantOnline', value, `avant: ${restaurant_online}`);

    if (store_id && (undefined!==restaurant_online)) {
      notificationServices.setRestaurantOnline('uber', {store_id: store_id, online: value})
                          .then(
                            success => dispatch({type: notificationActionTypes.SET_RESTAURANT_ONLINE, online: value}),
                            error => logger.info('Uber Restaurant online error')
                          )
    } else {
      logger.info('store_id unknown');
    }

  }
}

function initSync() {
  return (dispatch, getState) => {
    const { options } = getState().parametresReducer.parametres;

    logger.info('initSync', options);
    logger.info('role', options.role, (options.role==='secondary'));


    if (options.role==='secondary') {
      notificationServices.connectToPrimary(options.primary, options.caisse)
      .then(result => {
        logger.info('initSync secondary', result);
        dispatch({type: notificationActionTypes.CONNECT_TO_PRIMARY});
      })
    } else if (options.role==='primary') {
      notificationServices.startSyncPrimary()
      .then(result => {
        logger.info('initSync primary', result);
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

    logger.info('NAct.syncDispatch()', db, data);
    if (options.role==='primary') {
      notificationServices.syncDispatch(db, data, emitter)
      .then(result => {
        logger.info('syncDispatch (primary)', result);
      });

      if ((['ingredient','produit']).includes(db)) {
        // update Produit / Ingredient sur BO

        // si le prixArray / supplementArray a des valeurs sous forme de chaîne, c'est qu'on est en euros.
        // on doit donc créer un prixArray_c / supplementArray_c en centimes à partir de ces valeurs.

        if (db === "produit") {
          let prixArray_c = data.prixArray;
          if (typeof data.prixArray[0].ttc === 'string') {
            prixArray_c = data.prixArray.map(prix => (
              {
                ttc: Math.round(Number(prix.ttc) * 100),
                ht: Math.round(Number(prix.ht) * 100),
                tva: Math.round(Number(prix.ttc) * 100) - Math.round(Number(prix.ht) * 100)
              }
            ));
          }
          data = {...data, prixArray_c};
        }
        else if (db === "ingredient") {
          let supplementArray_c = data.supplementArray;
          if (typeof data.supplementArray[0].ttc === 'string') {
            supplementArray_c = data.supplementArray.map(supp => (
              {
                ttc: Math.round(Number(supp.ttc) * 100),
                ht: Math.round(Number(supp.ht) * 100),
                tva: Math.round(Number(supp.ttc) * 100) - Math.round(Number(supp.ht) * 100)
              }
            ));
          }
          data = {...data, supplementArray_c};
        }


        dispatch(journalActions.log('110', 'synchronisation catalogue backend'));

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

    }
    else if (options.role==='secondary') {
      notificationServices.syncPrimary(db, data, options.caisse, options.primary)
      .then(result => {
        logger.info('syncDispatch (secondary)', result);
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

      const {restaurant_id, restaurant_secret} = getState().parametresReducer.parametres.entreprise;

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });
      notificationServices.ackitNotification({id: restaurant_id, secret: restaurant_secret, uniqid: data.uniqid});
      
      if (data.provider==='uber') {
        notificationServices.getOrder('uber', data)
        .then(
          reponse => {

            if (auto_accept_order) dispatch(acceptOrder('uber', reponse.order));
            else {

              logger.info('ORDER:', reponse.order);

              dispatch({ type: notificationActionTypes.ADD_TO_STACK, cmdcandidate: reponse.order });

            }
            
          },
          error => logger.info('Token error', error)
        );
      }
    }
    else if (data.eventType==='newcommande') {
      const { entreprise } = getState().parametresReducer.parametres;

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });

      notificationServices.confirmDispo( 'clickandcollect', {...data, id: entreprise.restaurant_id, secret: entreprise.restaurant_secret});

    }
    
    else if (data.eventType==='commandeready') {

      const { entreprise } = getState().parametresReducer.parametres; 

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });

      notificationServices.getOrder( 'clickandcollect', {...data, id: entreprise.restaurant_id, secret: entreprise.restaurant_secret} )
      .then(
        response => {
          dispatch(commandeActions.setCommandeFromAPI( {data:{...response, provider:'clickandcollect'}} ))
        }
      )
    }
    else if (data.eventType==="statuschange") {
      // parametre status dans parametres, par défaut null ?

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });

      localStorage.setItem("status", data.status);
      dispatch(parametresActions.checkStatus());

    }
    else if (data.eventType==="check.notification") {

      const { testtoken } = getState().notificationReducer;
      if (data.token===testtoken) {
        dispatch({ type: notificationActionTypes.TEST_NOTIF_SUCCESS });
      } else {
        console.log('check.notification: bad token', data.token, testtoken);
      }

    }
  } 
}

function acceptOrder(provider, order) {
  logger.info('acceptOrder');
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

    logger.info('notAct.confirmCommande()');

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
      error => logger.info('ça va pas', error)
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
        confirm => { logger.info('notificationAction','synchro confirm sent')}
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
        confirm => { logger.info('notificationAction','synchro confirm sent to primary')}
      );
    }
  }
}

function sendNumero(payload) {
  return dispatch => {
    const {numero, response} = payload;
    notificationServices.sendNumero(numero, response)
    .then(
      confirm => { logger.info('sendNumero','numero sent') }
    )
  }
}

// function getNewNumero() {
//   return (dispatch, getState) => {

//     const { options } = getState().parametresReducer.parametres;
//     notificationServices.askNumero(options.primary)
//     .then(conf => {
//       logger.info('NAct.getNewNumero()', conf.numero);
//       dispatch({type: commandeActionTypes.GET_NUMERO, numero: conf.numero});
//       dispatch(commandeActions.setNewNumero(conf.numero.value));
//     })

//   }
// }

function getDatabase() {
  return async (dispatch, getState) => {


    logger.info('getDatabase()');

    dispatch({type: notificationActionTypes.GET_DATABASE_REQUEST, msg:'NAct.getDatabase()'});
    const { entreprise } = getState().parametresReducer.parametres; 

    if (entreprise.restaurant_id!=='' && entreprise.restaurant_secret!=='') {

      try {

        const database = await notificationServices.getDatabase({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret})
        
        dispatch({type: notificationActionTypes.GET_DATABASE_SUCCESS, msg:'NAct.getDatabase()'});
        dispatch({type: parametresActionTypes.INSTALL_DATABASE, value:[], msg:'NAct.getDatabase()'});
      
        dispatch(catalogueActions.replaceDatabase(database));
        dispatch(parametresActions.replaceDatabase(database));
        

        dispatch(journalActions.log('140', 'importation database'));
        
      } catch(error) {
        dispatch({type: notificationActionTypes.GET_DATABASE_FAILURE, error: error});
      }
    }
  }
}

function replaceCatalogueDatabase() {

  return (dispatch, getState) => {
    logger.info('replaceCatalogueDatabase()');

    dispatch({type: notificationActionTypes.GET_DATABASE_REQUEST, msg:'NAct.replaceCatalogueDatabase()'});
    const { entreprise } = getState().parametresReducer.parametres; 

    if (entreprise.restaurant_id!=='' && entreprise.restaurant_secret!=='') {

     
      notificationServices.getDatabase({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret})
      .then(database => {
        dispatch({type: notificationActionTypes.GET_DATABASE_SUCCESS, msg:'NAct.replaceCatalogueDatabase()'});
        dispatch({type: parametresActionTypes.INSTALL_DATABASE, value:[]});
        dispatch(catalogueActions.replaceDatabase(database));
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

          logger.info('initSyncCommandes chronos', chronos);
          logger.info('initSyncCommandes', commandes ? commandes.length : 'rien');
          if (commandes.length>0) {

            logger.info('preparation des commandes à envoyer au backo');

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
      logger.info('role secondary : pas de synchro commandes');
    }
  };
}

function syncCommandes(commandes) {
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres; 

    const { options } = getState().parametresReducer.parametres;

    if (options.role!=="secondary") {

      dispatch(journalActions.log('110', 'synchronisation commandes backend'));

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
      logger.info('role secondary : pas de synchro commandes');
    }
  }
}

function resync(liste) {
  return (dispatch, getState) => {

    const {caisse} = getState().parametresReducer.parametres.options;

    notificationServices.resync(liste, caisse.uniqid)
    .then(
      response => { logger.info('resync', response) }
    )
  }
}


function checkStation() {
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres; 

    notificationServices.checkStation({id: entreprise.restaurant_id, secret: entreprise.restaurant_secret})
    .then(
      response => {

        logger.info('station status', response);

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

          logger.info('initSyncClotures', clotures ? clotures.length : 'rien');
          if (clotures.length>0) {

            logger.info('preparation des clotures à envoyer au backo');

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
      logger.info('role secondary : pas de synchro clotures');
    }
  };
}

function syncClotures(clotures) {
  return (dispatch, getState) => {

    const { entreprise } = getState().parametresReducer.parametres; 

    const { options } = getState().parametresReducer.parametres;

    if (options.role!=="secondary") {

      dispatch(journalActions.log('110', 'synchronisation clotures backend'));

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
      logger.info('role secondary : pas de synchro clotures');
    }
  }
}




export const notificationActions = {
  initSSE,
  checkNotif,
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
  // getNewNumero,
  getDatabase,
  replaceCatalogueDatabase,
  confirmCommande,
  initSyncCommandes,
  syncCommandes,
  initSyncClotures,
  syncClotures,
  checkStation,
  resync
};