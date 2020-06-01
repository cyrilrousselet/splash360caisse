import { notificationActionTypes } from './notificationActionTypes';
import { notificationServices } from './notificationServices';


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


function getToken(provider) {
  return (dispatch, getState) => {
    dispatch({ type: notificationActionTypes.GET_TOKEN, provider:provider });



    notificationServices.getToken(provider)
    .then(
      data => dispatch({ type: notificationActionTypes.GET_TOKEN_SUCCESS, data}),
      error => console.log('ça va pas', error)
    )

  }
}


export const notificationActions = {
  initSSE,
  getToken
};