import {emit} from 'eiphop';
import externalParams from '../../constants/externalParams.json';
import { isAfter, isBefore } from 'date-fns';
import { create } from 'simple-oauth2';
import devOrder from '../../constants/_devOrder.json';

export const notificationServices = {
  getToken,
  denyOrder,
  acceptOrder,
  getOrder,
  setPOS,
  initSSE,
  connectToMaster,
  disconnectFromMaster,
  startSyncMaster,
  syncDispatch,
  syncMaster,
  syncConfirm
 };




 async function getToken(provider, task) {


  return new Promise(async (resolve,reject)=> {
    
    if (provider==='uber') {

      if (!['getorder','acceptorder','denyorder', 'pos'].includes(task)) reject(`invalid task '${task}' for Uber API`);

      const credentials = {
        client: {
          id: externalParams.uber.clientid,
          secret: externalParams.uber.secret
        },
        auth: {
          tokenHost: externalParams.uber.oAuth
        }
      };

      console.log('credentials', credentials);
      
      const tokenConfig = {
        scope: externalParams.uber[task].scope
      };

      console.log('tokenConfig', tokenConfig);

      const uberOAuth2 = create(credentials);

      try {
        const result = await uberOAuth2.clientCredentials.getToken(tokenConfig);
        const accessToken = uberOAuth2.accessToken.create(result);
        
     //   localStorage.setItem('uber_token', JSON.stringify(accessToken.token));
     
        console.log('token',accessToken);

        resolve(accessToken.token);
        
      } catch (error) {
        console.log('Access token error', error.message);
        reject(error.message);
      }
    }
    else {
      reject(false);
    }

  });
} 


function connectToMaster(url, caisse) {
  return emit('syncConnectToMaster', { url, caisse});
}

function disconnectFromMaster(url, caisse) {
  return emit('syncDisconnectFromMaster', {});
}

function startSyncMaster() {
  return emit('syncStartMaster',{});
}

function syncDispatch(db, data) {
  return emit('syncDispatchToSlaves', {db, data});
}
function syncMaster(db, data, url) {
  return emit('syncDispatchToMaster', {db, data, url});
}
function syncConfirm(response) {
  return emit('syncConfirm', {response});
}

async function denyOrder(provider, order) {

  const __denyOrdertoken = await getToken(provider, 'acceptorder');

  if (__denyOrdertoken.access_token) {
    var __url = externalParams[provider].denyorder.url.replace('{order_id}', order.id);
    return emit('denyUberOrder', {url: __url, access_token: __denyOrdertoken.access_token});
  }
}


async function acceptOrder(provider, order) {

  const __acceptOrdertoken = await getToken(provider, 'acceptorder');

  if (__acceptOrdertoken.access_token) {
    var __url = externalParams[provider].acceptorder.url.replace('{order_id}', order.id);
    return emit('acceptUberOrder', {url: __url, access_token: __acceptOrdertoken.access_token});
  }
}

async function getOrder(provider, data) {

  const __getOrdertoken = await getToken(provider, 'getorder');

  if (__getOrdertoken.access_token) {
    return emit('getUberOrder', {url: data.href, access_token: __getOrdertoken.access_token});
  }
}
  

async function setPOS(provider, data) {

  const __updatePOStoken = await getToken(provider, 'pos');

  if (__updatePOStoken.access_token) {
    var __url = externalParams[provider].pos.url.replace('{store_id}', data.store_id);
    return emit('updateUberPOS', {url: __url, access_token: __updatePOStoken.access_token, integration: data.integration});
  }
}


function initSSE(restaurant_id) {
  return emit('sseInit', {restaurant_id: restaurant_id});
}
