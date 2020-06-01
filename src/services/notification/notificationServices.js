import {emit} from 'eiphop';
import externalParams from '../../constants/externalParams.json';
import { isAfter, isBefore } from 'date-fns';
import { create } from 'simple-oauth2';

export const notificationServices = {
  getToken,
  initSSE
 };

async function getToken(provider) {


  const tokenPrm = new Promise(async (resolve,reject)=> {
    
    if (provider==='uber') {

      const __now = new Date();

      const token_json = localStorage.getItem('uber_token');
      const token_obj = token_json ? JSON.parse(token_json) : null;
      if (!token_json || (token_obj && isBefore(token_obj.expires_at, __now))) {

        console.log('pas ou plus de token dans le localStorage, on va en chercher un nouveau');

        const credientials = {
          client: {
            id: externalParams.uber_clientid,
            secret: externalParams.uber_secret
          },
          auth: {
            tokenHost: externalParams.uber_OAuth
          }
        };

        const tokenConfig = {
          scope: 'eats.store'
        };


        const uberOAuth2 = create(credientials);

        try {
          const result = await uberOAuth2.clientCredentials.getToken(tokenConfig);
          const accessToken = uberOAuth2.accessToken.create(result);
          
          localStorage.setItem('uber_token', JSON.stringify(accessToken.token));
          
          resolve('on y est');
          
        } catch (error) {
          console.log('Access token error', error.message);
          reject(error.message);
        }




      } else {
        console.log('token dans le localStorage');
        resolve(token_obj.access_token);
      }

    }
    else {
      reject(false);
    }

  })
  return tokenPrm;
} 


function initSSE(restaurant_id) {
  return emit('sseInit', {restaurant_id: restaurant_id});
}

// function update(payload) {
//   return emit('dbParametresUpdate', {payload: payload});
// }