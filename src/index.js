//import './ReactotronConfig';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore } from './store/configureStore';
import history from './helpers/history';
import electron from 'electron';
import {ipcRenderer} from 'electron';

import {setupFrontendListener} from 'eiphop';

import { commandeActions } from './services/commande/commandeActions';
import { numeroActions } from './services/commande/numeroActions';
import { notificationActions } from './services/notification/notificationActions';

//import routes from './Routes';

// import log from 'electron-log';

// import reducer from './reducers';
import './index.scss';
import registerServiceWorker from './registerServiceWorker';
import { clientsActions } from './services/clients/clientsActions';
import Logger from './helpers/Logger';
import { marketingActions } from './services/marketing/marketingActions';
import { userActions } from './services/user/userActions';
import { employesActions } from './services/employes/employesActions';
import { catalogueActions } from './services/catalogue/catalogueActions';
import packageJson from '../package.json';

import * as Sentry from '@sentry/electron';

Sentry.init({ 
  release: "splash360caisse@" + packageJson.version,
  dsn: "https://44cf9ec6a90c43e4a7027cc997b83919@o511169.ingest.sentry.io/5607891" 
});

const logger = new Logger();

//const {store, persistor} = configureStore();
const {store} = configureStore();


//const electron = require('electron');
setupFrontendListener(electron);


console.log(process.env.REACT_APP_PRODUCT_NAME);
console.log(process.env.REACT_APP_PRODUCT_AUTHOR);

// listener sur la réception de commande via '/public/server.js'
ipcRenderer.on('setCommande', (event, commande) => {
  commandeActions.setCommandeFromAPI(commande)(store.dispatch, store.getState);
});

// listener sur la réception de notification (depuis le serveur mercure)
ipcRenderer.on('getNotification', (event, data) => {
  console.log('getNotification()', event, data);
  
  notificationActions.treatment(data)(store.dispatch, store.getState);

});

// listener sur la demande de numero de commande (via '/public/server.js')
ipcRenderer.on('getNumero', (event, data) => {
  logger.log('getNumero()', event, data);
  numeroActions.getNumeroAPI(data)(store.dispatch, store.getState);
})

// ipcRenderer.on('setProductionChrono', (event, data) => {
//   logger.log('setProductionChrono()', event, data);
//   commandeActions.setProductionChrono(data)(store.dispatch, store.getState);
// });


// listener sur la réception de commande via '/public/server.js'
ipcRenderer.on('setCommandeSync', (event, commande) => {
  logger.log('renderer: setCommandeSync', commande);
  commandeActions.setCommandeFromSync(commande)(store.dispatch, store.getState);
});

// listener sur l'archivage de commandes via '/public/server.js'
ipcRenderer.on('archiveCommandesSync', (event, commandes) => {
  logger.log('renderer: archiveCommandesSync', commandes);
  commandeActions.archiveCommandesFromSync(commandes)(store.dispatch, store.getState);
});


ipcRenderer.on('setSynchedCommandesSync', (event, commandes) => {
  logger.log('renderer: setSynchedCommandesSync', commandes);
  commandeActions.setSyncedCommandsFromSync(commandes)(store.dispatch, store.getState);
});


ipcRenderer.on('setClientSync', (event, client) => {
  logger.log('renderer: setClientSync', client);
  clientsActions.setClientFromSync(client)(store.dispatch, store.getState);
});

ipcRenderer.on('setAvoirSync', (event, avoir) => {
  logger.log('renderer: setAvoirSync', avoir);
  marketingActions.setAvoirFromSync(avoir)(store.dispatch, store.getState);
});

ipcRenderer.on('deleteAvoirSync', (event, avoir) => {
  logger.log('renderer: deleteAvoirSync', avoir);
  marketingActions.deleteAvoirFromSync(avoir)(store.dispatch, store.getState);
});

ipcRenderer.on('setTicketRestaurantSync', (event, ticketrestaurant) => {
  logger.log('renderer: setTicketRestaurantSync', ticketrestaurant);
  commandeActions.setTicketRestaurantFromSync(ticketrestaurant)(store.dispatch, store.getState);
});

ipcRenderer.on('setPointageSync', (event, pointage) => {
  logger.log('renderer: setPointageSync', pointage);
  employesActions.setPointageFromSync(pointage)(store.dispatch, store.getState);
});



ipcRenderer.on('setProduitSync', (event, produit) => {
  logger.log('renderer: setProduitSync', produit);
  catalogueActions.setProduitFromSync(produit)(store.dispatch, store.getState);
});
ipcRenderer.on('setGroupeSync', (event, groupe) => {
  logger.log('renderer: setGroupeSync', groupe);
  catalogueActions.setGroupeFromSync(groupe)(store.dispatch, store.getState);
});
ipcRenderer.on('setIngredientSync', (event, ingredient) => {
  logger.log('renderer: setIngredientSync', ingredient);
  catalogueActions.setIngredientFromSync(ingredient)(store.dispatch, store.getState);
});
ipcRenderer.on('setIngredientTypeSync', (event, ingredienttype) => {
  logger.log('renderer: setIngredientTypeSync', ingredienttype);
  catalogueActions.setIngredientTypeFromSync(ingredienttype)(store.dispatch, store.getState);
});


ipcRenderer.on('setTimeadjustSync', (event, timeadjust) => {
  logger.log('renderer: setTimeadjustSync', timeadjust);
 // commandeActions.setTicketRestaurantFromSync(ticketrestaurant)(store.dispatch, store.getState);
});

ipcRenderer.on('setClotureSync', (event, cloture) => {
  logger.log('renderer: setClotureSync', cloture);
 // commandeActions.setTicketRestaurantFromSync(ticketrestaurant)(store.dispatch, store.getState);
});

ipcRenderer.on('setUserSync', (event, user) => {
  logger.log('renderer: setUserSync', user);
  userActions.setUserFromSync(user)(store.dispatch, store.getState);
});

ipcRenderer.on('chrono', (event, commande) => {
  logger.log('renderer: chrono', commande);
  commandeActions.setChrono(commande)(store.dispatch, store.getState);
});

// log.transports.file.level = 'info';
// log.info('arrivée sur le Dashboard');

render(
 <AppContainer>
  {/* <Root store={ store } persistor={ persistor } history={ history } /> */}
  <Root store={ store } history={ history } />
 </AppContainer>,
 document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
registerServiceWorker();