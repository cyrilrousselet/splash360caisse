import { notificationActionTypes } from './notificationActionTypes';
import { notificationServices } from './notificationServices';
import { commandeActions } from '../commande/commandeActions';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import Swal from 'sweetalert2';
const strings = new LocalizedStrings(data);

function initSSE() {
  return (dispatch, getState) => {
    const { restaurant_id } = getState().parametresReducer.parametres.entreprise;

    if (restaurant_id) {
      notificationServices.initSSE(restaurant_id)
      .then(
        data => dispatch({ type: notificationActionTypes.INIT_SSE }),
        error => dispatch({ type: notificationActionTypes.INIT_SSE_FAILURE, error:error.msg })
      );
    } else {
      console.warn('restaurant_id unknown');
    }
  }
}

function treatment(data) {

  return (dispatch, getState) => {
    

    const {auto_accept_order} = getState().parametresReducer.parametres.commandes;

    if (data.eventType=='orders.notification') {

      dispatch({ type: notificationActionTypes.GET_NOTIFICATION, notif: data.eventType });

      notificationServices.getOrder('uber', data)
      .then(
        reponse => {

          if (auto_accept_order) dispatch(acceptOrder('uber', reponse.order));
          else {

            console.log('ORDER:', reponse.order);
            
            Swal.fire({
              title: strings.notification.accept.uber.titre,
              text: strings.notification.accept.uber.texte+'<br />'+strings.notification.accept.uber.detail+' cmd #'+reponse.order.display_id+' pour '+reponse.order.estimated_ready_for_pickup_at,
              focusConfirm: true,
              showCancelButton: true,
              customClass: 'ubernotification',
              confirmButtonText: strings.general.dialog.accept,
              cancelButtonText: strings.general.dialog.deny,
              buttonsStyling: false 
            }).then((result)=> {
              if (result.value==true) {
                dispatch(acceptOrder('uber', reponse.order));
              } else {
                dispatch(denyOrder('uber', reponse.order));
              }
            });

          }
          
        },
        error => console.log('Token error', error)
      );
    }
  } 
}

function acceptOrder(provider, order) {
  return dispatch => {
    dispatch({ type: notificationActionTypes.ACCEPT_ORDER, id: order.id });
    notificationServices.acceptOrder(provider, order)
                        .then(
                          code => dispatch(commandeActions.setCommandeFromOrder(order)),
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
      error => console.log('ça va pas', error)
    )

  }
}


export const notificationActions = {
  initSSE,
  getToken,
  treatment,
  denyOrder
};