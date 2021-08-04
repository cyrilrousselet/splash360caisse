import {emit} from 'eiphop';
import externalParams from '../../constants/externalParams.json';
import { create } from 'simple-oauth2';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';

// const logger = new Logger();

export const notificationServices = {
  getToken,
  denyOrder,
  acceptOrder,
  confirmDispo,
  getOrder,
  setPOS,
  setRestaurantOnline,
  updateProduitUber,
  initSSE,
  connectToPrimary,
  disconnectFromPrimary,
  startSyncPrimary,
  syncDispatch,
  syncPrimary,
  syncConfirm,
  syncConfirmToPrimary,
  sendNumero,
  askNumero,
  getDatabase,
  syncCommandes,
  syncClotures,
  syncCatalogue,
  confirmCommande,
  resync
 };


async function getDatabase(params) {

  const __splashToken = await getSplashToken(params);

  logger.info('notifSrv.getDatabase()',__splashToken);

  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.getdb;
    return emit('getDatabase', {url: __url, access_token: __splashToken.splash_token.access_token});
  }
}

async function syncCommandes(params) {
  logger.info('notifSrv.syncCommandes()','init');
  const __splashToken = await getSplashToken(params);
  
  logger.info('notifSrv.syncCommandes()',__splashToken);
  
  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.syncCommandes;
    return emit('syncCommandesBO', {url: __url, access_token: __splashToken.splash_token.access_token, commandes: params.commandes});
  }
}
async function syncClotures(params) {
  logger.info('notifSrv.syncClotures()','init');
  const __splashToken = await getSplashToken(params);

  logger.info('notifSrv.syncClotures()',__splashToken);

  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.syncClotures;
    return emit('syncCloturesBO', {url: __url, access_token: __splashToken.splash_token.access_token, clotures: params.clotures});
  }
}
async function syncCatalogue(params) {
  logger.info('notifSrv.syncCatalogue()','init');
  const __splashToken = await getSplashToken(params);

  logger.info('notifSrv.syncCatalogue()',__splashToken);

  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.syncCatalogue;
    return emit('syncCatalogueBO', {url: __url, access_token: __splashToken.splash_token.access_token, catalogue: params.catalogue});
  }
}
async function confirmCommande(params) {
  logger.info('notifSrv.confirmCommande()','init');
  const __splashToken = await getSplashToken(params);
  
  logger.info('notifSrv.confirmCommande()',__splashToken);
  
  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.confirmCommande.replace('{ticket_id}', params.ticketId);
    return emit('confirmCommandesBO', {url: __url, access_token: __splashToken.splash_token.access_token, numero: params.numero});
  }
}

async function resync(liste, caisseId) {
  return emit('resync', {liste:liste, caisseId:caisseId});
}


async function getSplashToken(params) {
  const url = externalParams.synchro.oAuth.replace('%ID%', params.id).replace('%PWD%', params.secret);
  return emit('getSplashToken', {params:url});
} 

async function getUberToken(params) {
  logger.info('getUberToken', params);
  // const url = externalParams.uber.oAuth.replace('%ID%', params.id).replace('%PWD%', params.secret).replace('%SCOPE%', params.scope);
  return emit('getUberToken', {params});
} 


 async function getToken(provider, task) {


  return new Promise(async (resolve,reject)=> {
    
    if (provider==='uber') {

      if (!['getorder','acceptorder','denyorder', 'pos', 'restaurant', 'updateitem'].includes(task)) reject(`invalid task '${task}' for Uber API`);

      const credentials = {
        client: {
          id: externalParams.uber.clientid,
          secret: externalParams.uber.secret
        },
        auth: {
          tokenHost: externalParams.uber.oAuth
        }
      };

      logger.info('credentials', credentials);
      
      const tokenConfig = {
        scope: externalParams.uber[task].scope
      };

      logger.info('tokenConfig', tokenConfig);

      const uberOAuth2 = create(credentials);

      try {
        const result = await uberOAuth2.clientCredentials.getToken(tokenConfig);
        const accessToken = uberOAuth2.accessToken.create(result);
        
     //   localStorage.setItem('uber_token', JSON.stringify(accessToken.token));
     
        logger.info('token',accessToken);

        resolve(accessToken.token);
        
      } catch (error) {
        logger.info('Access token error', error.message);
        reject(error.message);
      }
    }
    else {
      reject(false);
    }

  });
} 


function connectToPrimary(url, caisse) {
  logger.info('connectToPrimary()', url, caisse);
  return emit('syncConnectToPrimary', { url, caisse});
}

function disconnectFromPrimary(url, caisse) {
  logger.info('disconnectFromPrimary()');
  return emit('syncDisconnectFromPrimary', {});
}

function startSyncPrimary() {
  logger.info('startSyncPrimary()');
  return emit('syncStartPrimary',{});
}

function syncDispatch(db, data, emitter) {
  return emit('syncDispatchToSecondaries', {db, data, emitter});
}
function syncPrimary(db, data, emitter, url) {
  return emit('syncDispatchToPrimary', {db, data, emitter, url});
}
function syncConfirm(response, data) {
  if (response!==null) {
    return emit('syncConfirm', {response:response, data:data});
  }
}
function syncConfirmToPrimary(url, data) {
  if (url!==null) {
    return emit('syncConfirmToPrimary', {url:url, data:data});
  }
}

function askNumero(url) {
  return emit('askNumero',{url});
}

function sendNumero(numero, response) {
  return emit('sendNumeroCommande', {numero, ...response});
}

async function denyOrder(provider, order) {

  // const __denyOrdertoken = await getToken(provider, 'acceptorder');
  const __denyOrdertoken = await getUberToken({
    url: externalParams.uber.oAuth,
    id: externalParams[provider].clientid,
    secret: externalParams[provider].secret,
    scope: externalParams[provider].denyorder.scope
  });

  logger.info('denyOrder token :',__denyOrdertoken);

  if (__denyOrdertoken.access_token) {
    var __url = externalParams[provider].denyorder.url.replace('{order_id}', order.id);
    return emit('denyUberOrder', {url: __url, access_token: __denyOrdertoken.access_token});
  }
}


async function acceptOrder(provider, order) {

  // const __acceptOrdertoken = await getToken(provider, 'acceptorder');
  const __acceptOrdertoken = await getUberToken({
    url: externalParams.uber.oAuth,
    id: externalParams[provider].clientid,
    secret: externalParams[provider].secret,
    scope: externalParams[provider].acceptorder.scope
  });

  logger.info('acceptOrder token :',__acceptOrdertoken);

  if (__acceptOrdertoken.access_token) {
    var __url = externalParams[provider].acceptorder.url.replace('{order_id}', order.id);
    return emit('acceptUberOrder', {url: __url, access_token: __acceptOrdertoken.access_token});
  }
}

async function confirmDispo(provider, data) {

  if(provider === 'clickandcollect') {
    const __splashToken = await getSplashToken(data);

    logger.log('notifSrv.confirmDispo()',__splashToken);

    if (__splashToken.splash_token.access_token) {
      var __url = data.href;
      return emit('confirmDispo', {url: __url, access_token: __splashToken.splash_token.access_token});
    }
  }
}

async function getOrder(provider, data) {

  logger.info('notifSrv.getOrder()', `provider: ${provider}`, data);

  if (provider==='clickandcollect') {

    
    const __splashToken = await getSplashToken(data);

    logger.info('notifSrv.getOrder()',__splashToken);

    if (__splashToken.splash_token.access_token) {
      var __url = data.href;
      return emit('getCommande', {url: __url, access_token: __splashToken.splash_token.access_token});
    } 

  } else {
 
    // const __getOrdertoken = await getToken(provider, 'getorder');
    logger.info('getOrder '+provider);

    const __getOrdertoken = await getUberToken({
      url: externalParams.uber.oAuth,
      id: externalParams[provider].clientid,
      secret: externalParams[provider].secret,
      scope: externalParams[provider].getorder.scope
    });
  
    logger.info('getOrder token :',__getOrdertoken);
    
    if (__getOrdertoken.access_token) {
      return emit('getUberOrder', {url: data.href, access_token: __getOrdertoken.access_token});
    }
  }
}
  

async function setPOS(provider, data) {

  // const __updatePOStoken = await getToken(provider, 'pos');
  const __updatePOStoken = await getUberToken({
    url: externalParams.uber.oAuth,
    id: externalParams[provider].clientid,
    secret: externalParams[provider].secret,
    scope: externalParams[provider].pos.scope
  });

  logger.info('setPOS token :',__updatePOStoken);

  if (__updatePOStoken.access_token) {
    var __url = externalParams[provider].pos.url.replace('{store_id}', data.store_id);
    return emit('updateUberPOS', {url: __url, access_token: __updatePOStoken.access_token, integration: data.integration});
  }
}
  

async function setRestaurantOnline(provider, data) {

  logger.info('NSrv.setRestaurantOnline()');
  // const __updateRestaurantToken = await getToken(provider, 'restaurant');

  const __updateRestaurantToken = await getUberToken({
    url: externalParams.uber.oAuth,
    id: externalParams[provider].clientid,
    secret: externalParams[provider].secret,
    scope: externalParams[provider].restaurant.scope
  });

  logger.info('setRestaurantOnline token :',__updateRestaurantToken);

  if (__updateRestaurantToken.access_token) {
    var __url = externalParams[provider].restaurant.url.replace('{store_id}', data.store_id);
    return emit('updateUberRestaurant', {url: __url, access_token: __updateRestaurantToken.access_token, online: data.online});
  }
}

async function updateProduitUber(provider, data) {
  logger.info('NSrv.updateProduitUber()');
  // const __updateProduitToken = await getToken(provider, 'updateitem');

  const __updateProduitToken = await getUberToken({
    url: externalParams.uber.oAuth,
    id: externalParams[provider].clientid,
    secret: externalParams[provider].secret,
    scope: externalParams[provider].updateitem.scope
  });

  logger.info('updateProduitUber token :',__updateProduitToken);

  if (__updateProduitToken.access_token) {
    var __url = externalParams[provider].updateitem.url.replace('{store_id}', data.store_id).replace('{item_id}', data.item_id);
    return emit('updateUberItem', {url: __url, access_token: __updateProduitToken.access_token, properties: data.properties});
  }
}


function initSSE(restaurant_id) {
  return emit('sseInit', {restaurant_id: restaurant_id});
}
