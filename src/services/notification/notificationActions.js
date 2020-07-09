import { notificationActionTypes } from './notificationActionTypes';
import { notificationServices } from './notificationServices';
import { commandeActions } from '../commande/commandeActions';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
// import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import Logger from '../../helpers/Logger';
const strings = new LocalizedStrings(data);
const logger = new Logger();

function initSSE() {
  return (dispatch, getState) => {
    const { restaurant_id } = getState().parametresReducer.parametres.entreprise;

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

function setPOS() {
  return (dispatch, getState) => {
    const { store_id, pos_integration_enabled } = getState().parametresReducer.parametres.commandes;

    if (store_id && (undefined!==pos_integration_enabled)) {
      notificationServices.setPOS('uber', {store_id: store_id, integration: pos_integration_enabled})
                          .then(
                            success => dispatch({type: notificationActionTypes.SET_POS, integration: pos_integration_enabled}),
                            error => console.log('POS integration error')
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

function syncDispatch(db,data) {
  return (dispatch, getState) => {
    const { options } = getState().parametresReducer.parametres;
    if (options.role==='primary') {
      notificationServices.syncDispatch(db, data)
      .then(result => {
        logger.log('syncDispatch (primary)', result);
      })
    }
    else if (options.role==='secondary') {
      notificationServices.syncPrimary(db, data, options.primary)
      .then(result => {
        logger.log('syncDispatch (secondary)', result);
      })
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
            
            Swal.fire({
              title: strings.notification.accept.uber.titre,
              html: strings.notification.accept.uber.texte+'<br />'+strings.notification.accept.uber.detail.replace('%NUMERO%',reponse.order.display_id).replace('%DATEHEURE%', format(new Date(reponse.order.estimated_ready_for_pickup_at), "d MMM yyyy à HH:mm", { locale: frLocale })),
              focusConfirm: true,
              showCancelButton: false,
              customClass: 'ubernotification',
              allowOutsideClick: false,
              allowEscapeKey: false,
              confirmButtonText: strings.general.dialog.accept,
              // cancelButtonText: strings.general.dialog.deny,
              buttonsStyling: false 
            }).then((result)=> {
              if (result.value===true) {
                dispatch(acceptOrder('uber', reponse.order));
              // } else {
              //   dispatch(denyOrder('uber', reponse.order));
              }
            });

          }
          
        },
        error => logger.log('Token error', error)
      );
    }
  } 
}

function acceptOrder(provider, order) {
  logger.log('acceptOrder');
  return dispatch => {
    dispatch({ type: notificationActionTypes.ACCEPT_ORDER, id: order.display_id });
    notificationServices.acceptOrder(provider, order)
                        .then(
                          confirm => dispatch(commandeActions.setCommandeFromOrder(provider, order)),
                          error => dispatch({type: notificationActionTypes.ORDER_ERROR, error: error})
                        )
  }
}
function denyOrder(provider, order) {
  return dispatch => {
    dispatch({ type: notificationActionTypes.DENY_ORDER, id: order.id });
    notificationServices.denyOrder(provider, order);
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


function syncConfirm(response) {
  return dispatch => {
    notificationServices.syncConfirm(response)
    .then(
      confirm => { logger.log('notificationAction','synchro confirm sent')}
    );
  }
}

export const notificationActions = {
  initSSE,
  setPOS,
  getToken,
  treatment,
  denyOrder,
  initSync,
  syncDispatch,
  syncConfirm
};