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
  resetSSE,
  ackitNotification,
  checkNotif,
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
  syncTickets,
  syncCatalogue,
  confirmCommande,
  resync,
  getGift,
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
async function syncTickets(params) {
  logger.info('notifSrv.syncTickets()','init');
  const __splashToken = await getSplashToken(params);

  logger.info('notifSrv.syncTickets()',__splashToken);

  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.syncTickets;
    return emit('syncTicketsBO', {url: __url, access_token: __splashToken.splash_token.access_token, tickets: params.tickets});
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

async function getLuckylikesToken(params) {
  logger.info('getLuckylikesToken', params);
  return emit('getLuckylikesToken', {params});
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

  const utok_deny = JSON.parse(localStorage.getItem('utok_deny'));
  let __denyOrdertoken = {access_token:''};

  if (!utok_deny || utok_deny.expiration < new Date().getTime()) {
    __denyOrdertoken = await getUberToken({
      url: externalParams.uber.oAuth,
      id: externalParams[provider].clientid,
      secret: externalParams[provider].secret,
      scope: externalParams[provider].denyorder.scope
    });
    localStorage.setItem('utok_deny', { ...__denyOrdertoken, expiration: new Date().getTime() + (__denyOrdertoken.expires_in * 1000) })
  } else {
    __denyOrdertoken.access_token = utok_deny.access_token;
  }

  logger.info('denyOrder token :',__denyOrdertoken);

  if (__denyOrdertoken.access_token) {
    var __url = externalParams[provider].denyorder.url.replace('{order_id}', order.id);
    return emit('denyUberOrder', {url: __url, access_token: __denyOrdertoken.access_token});
  }
}


async function acceptOrder(provider, order) {

  // const __acceptOrdertoken = await getToken(provider, 'acceptorder');
  const utok_accept = JSON.parse(localStorage.getItem('utok_accept'));
  let __acceptOrdertoken = {access_token:''};
  
  if (!utok_accept || utok_accept.expiration < new Date().getTime()) {

    __acceptOrdertoken = await getUberToken({
      url: externalParams.uber.oAuth,
      id: externalParams[provider].clientid,
      secret: externalParams[provider].secret,
      scope: externalParams[provider].acceptorder.scope
    });
    localStorage.setItem('utok_accept', JSON.stringify({ ...__acceptOrdertoken, expiration: new Date().getTime() + (__acceptOrdertoken.expires_in * 1000) }));
  } else {
    __acceptOrdertoken.access_token = utok_accept.access_token;
  }

  logger.info('acceptOrder token :',__acceptOrdertoken);

  if (__acceptOrdertoken.access_token) {
    var __url = externalParams[provider].acceptorder.url.replace('{order_id}', order.id);
    return emit('acceptUberOrder', {url: __url, access_token: __acceptOrdertoken.access_token});
  }
}

async function ackitNotification(params) {

  const __splashToken = await getSplashToken(params);
  
  logger.dump('notifSrv.ackitNotification()',__splashToken);

  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.ackitNotif;
    return emit('ackitNotification', {url: __url, access_token: __splashToken.splash_token.access_token, uniqid: params.uniqid});
  }
}

async function checkNotif(params) {

  const __splashToken = await getSplashToken(params);
  
  logger.dump('notifSrv.checkNotif()',__splashToken);

  if (__splashToken.splash_token.access_token) {
    var __url = externalParams.synchro.checkNotif.replace('{client_id}', params.id);
    return emit('checkNotif', {url: __url, access_token: __splashToken.splash_token.access_token, token: params.testtoken});
  }
}

async function confirmDispo(provider, data) {

  if(provider === 'clickandcollect') {
    const __splashToken = await getSplashToken(data);

    logger.dump('notifSrv.confirmDispo()',__splashToken);

    if (__splashToken.splash_token.access_token) {
      var __url = data.href;
      return emit('confirmDispo', {url: __url, access_token: __splashToken.splash_token.access_token});
    }
  }
}

async function getOrder(provider, data) {

  logger.info('notifSrv.getOrder()', `provider: ${provider}`, data);

  if ((['clickandcollect', 'deliveroo']).includes(provider)) {

    
    const __splashToken = await getSplashToken(data);

    logger.info('notifSrv.getOrder()',__splashToken);

    if (__splashToken.splash_token.access_token) {
      var __url = data.href;
      return emit('getCommande', {url: __url, access_token: __splashToken.splash_token.access_token});
    } 

  } else if (provider==='uber') {
 
    // const __getOrdertoken = await getToken(provider, 'getorder');
    logger.info('getOrder '+provider);

    const utok_getorder = JSON.parse(localStorage.getItem('utok_getorder'));
    let __getOrdertoken = {access_token:''};
    
    if (!utok_getorder || utok_getorder.expiration < new Date().getTime()) {
      __getOrdertoken = await getUberToken({
        url: externalParams.uber.oAuth,
        id: externalParams[provider].clientid,
        secret: externalParams[provider].secret,
        scope: externalParams[provider].getorder.scope
      });
    
      localStorage.setItem('utok_getorder', JSON.stringify({ ...__getOrdertoken, expiration: new Date().getTime() + (__getOrdertoken.expires_in * 1000) }));
    } else {
      __getOrdertoken.access_token = utok_getorder.access_token;
    }
    logger.info('getOrder token :',__getOrdertoken);
    
    if (__getOrdertoken.access_token) {
      return emit('getUberOrder', {url: data.href, access_token: __getOrdertoken.access_token});
    }
  }
}
  

async function setPOS(provider, data) {

  // const __updatePOStoken = await getToken(provider, 'pos');
  const utok_updpos = JSON.parse(localStorage.getItem('utok_updpos'));
  let __updatePOStoken = {access_token:''};
  
  if (!utok_updpos || utok_updpos.expiration < new Date().getTime()) {
    __updatePOStoken = await getUberToken({
      url: externalParams.uber.oAuth,
      id: externalParams[provider].clientid,
      secret: externalParams[provider].secret,
      scope: externalParams[provider].pos.scope
    });
    localStorage.setItem('utok_updpos', JSON.stringify({ ...__updatePOStoken, expiration: new Date().getTime() + (__updatePOStoken.expires_in * 1000) }));
  } else {
    __updatePOStoken.access_token = utok_updpos.access_token;
  }

  logger.info('setPOS token :',__updatePOStoken);

  if (__updatePOStoken.access_token) {
    var __url = externalParams[provider].pos.url.replace('{store_id}', data.store_id);
    return emit('updateUberPOS', {url: __url, access_token: __updatePOStoken.access_token, integration: data.integration});
  }
}
  

async function setRestaurantOnline(provider, data) {

  logger.info('NSrv.setRestaurantOnline()');
  // const __updateRestaurantToken = await getToken(provider, 'restaurant');

  const utok_updres = JSON.parse(localStorage.getItem('utok_updres'));
  let __updateRestaurantToken = {access_token:''};
  
  if (!utok_updres || utok_updres.expiration < new Date().getTime()) {
    __updateRestaurantToken = await getUberToken({
      url: externalParams.uber.oAuth,
      id: externalParams[provider].clientid,
      secret: externalParams[provider].secret,
      scope: externalParams[provider].restaurant.scope
    });
    localStorage.setItem('utok_updres', JSON.stringify({ ...__updateRestaurantToken, expiration: new Date().getTime() + (__updateRestaurantToken.expires_in * 1000) }));
  } else {
    __updateRestaurantToken.access_token = utok_updres.access_token;
  }

  logger.info('setRestaurantOnline token :',__updateRestaurantToken);

  if (__updateRestaurantToken.access_token) {
    var __url = externalParams[provider].restaurant.url.replace('{store_id}', data.store_id);
    return emit('updateUberRestaurant', {url: __url, access_token: __updateRestaurantToken.access_token, online: data.online});
  }
}

async function updateProduitUber(provider, data) {
  logger.info('NSrv.updateProduitUber()');
  // const __updateProduitToken = await getToken(provider, 'updateitem');

  const utok_updprd = JSON.parse(localStorage.getItem('utok_updprd'));
  let __updateProduitToken = {access_token:''};
  
  if (!utok_updprd || utok_updprd.expiration < new Date().getTime()) {
    __updateProduitToken = await getUberToken({
      url: externalParams.uber.oAuth,
      id: externalParams[provider].clientid,
      secret: externalParams[provider].secret,
      scope: externalParams[provider].updateitem.scope
    });
    localStorage.setItem('utok_updprd', JSON.stringify({ ...__updateProduitToken, expiration: new Date().getTime() + (__updateProduitToken.expires_in * 1000) }));
  } else {
    __updateProduitToken.access_token = utok_updprd.access_token;
  }

  logger.info('updateProduitUber token :',__updateProduitToken);

  if (__updateProduitToken.access_token) {
    var __url = externalParams[provider].updateitem.url.replace('{store_id}', data.store_id).replace('{item_id}', data.item_id);
    return emit('updateUberItem', {url: __url, access_token: __updateProduitToken.access_token, properties: data.properties});
  }
}

async function getGift(id) {
  const luckylikes_token = JSON.parse(localStorage.getItem('luckylikes_token'));
  let __updateLuckylikesToken = {token:''};

  if (!luckylikes_token || luckylikes_token.expiration < new Date().getTime()) {
    __updateLuckylikesToken = await getLuckylikesToken({
      url: externalParams.gift.gettoken.url,
      username: externalParams.gift.gettoken.username,
      password: externalParams.gift.gettoken.password
    });
    if (__updateLuckylikesToken.hasOwnProperty('token')) {
      localStorage.setItem('luckylikes_token', JSON.stringify({...__updateLuckylikesToken, expiration: new Date().getTime() + 604800}));
    } else {
      throw new Error('Token error');
    }
  } else {
    __updateLuckylikesToken.token = luckylikes_token.token;
  }

  logger.info('getGift token : ',__updateLuckylikesToken);

  if (__updateLuckylikesToken.token) {
    var __url = externalParams.gift.getparty.replace('{id}', id);
    return emit('getLuckylikesGift', {url: __url, token: __updateLuckylikesToken.token});
  }
}


function initSSE(restaurant_id) {
  return emit('sseInit', {restaurant_id: restaurant_id});
}

function resetSSE(restaurant_id) {
  return emit('sseInit', {restaurant_id: restaurant_id});
}