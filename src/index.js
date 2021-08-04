//import './ReactotronConfig';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './components/Root';
import { configureStore } from './store/configureStore';
import history from './helpers/history';
import electron from 'electron';
import {ipcRenderer} from 'electron';
import isDev from 'electron-is-dev';

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
// import Logger from './helpers/Logger';
import logger from './helpers/Logger';
import { marketingActions } from './services/marketing/marketingActions';
import { userActions } from './services/user/userActions';
import { employesActions } from './services/employes/employesActions';
import { catalogueActions } from './services/catalogue/catalogueActions';
import { clotureActions } from './services/cloture/clotureActions';
import { tresorActions } from './services/tresorerie/tresorActions';
import packageJson from '../package.json';

import * as Sentry from '@sentry/react';
import { peripheralActions } from './services/peripheral/peripheralActions';

if (!isDev) {
  Sentry.init({ 
    release: "splash360caisse@" + packageJson.version,
    dsn: "https://44cf9ec6a90c43e4a7027cc997b83919@o511169.ingest.sentry.io/5607891" 
  });
} else {
  logger.info('mode DEV')
}


//const {store, persistor} = configureStore();
const {store} = configureStore();


//const electron = require('electron');
setupFrontendListener(electron);


logger.info(process.env.REACT_APP_PRODUCT_NAME);
logger.info(process.env.REACT_APP_PRODUCT_AUTHOR);

// listener sur la réception de commande via '/public/server.js'
ipcRenderer.on('setCommande', (event, commande) => {
  logger.info('ipc: setCommande()');
  commandeActions.setCommandeFromAPI(commande)(store.dispatch, store.getState);
});

// listener sur la réception de notification (depuis le serveur mercure)
ipcRenderer.on('getNotification', (event, data) => {
  logger.info('ipc: getNotification()', event, data);
  
  notificationActions.treatment(data)(store.dispatch, store.getState);

});

// listener sur la demande de numero de commande (via '/public/server.js')
ipcRenderer.on('getNumero', (event, data) => {
  logger.info('ipc: getNumero()', event, data);
  numeroActions.getNumeroAPI(data)(store.dispatch, store.getState);
})

// ipcRenderer.on('setProductionChrono', (event, data) => {
//   logger.info('setProductionChrono()', event, data);
//   commandeActions.setProductionChrono(data)(store.dispatch, store.getState);
// });


// listener sur la réception de commande via '/public/server.js'
ipcRenderer.on('setCommandeSync', (event, commande) => {
  logger.info('ipc: setCommandeSync', commande);
  commandeActions.setCommandeFromSync(commande)(store.dispatch, store.getState);
});

// listener sur l'archivage de commandes via '/public/server.js'
ipcRenderer.on('archiveCommandesSync', (event, commandes) => {
  logger.info('ipc: archiveCommandesSync', commandes);
  commandeActions.archiveCommandesFromSync(commandes)(store.dispatch, store.getState);
});


ipcRenderer.on('setSynchedCommandesSync', (event, commandes) => {
  logger.info('ipc: setSynchedCommandesSync', commandes);
  commandeActions.setSyncedCommandsFromSync(commandes)(store.dispatch, store.getState);
});


ipcRenderer.on('setClientSync', (event, client) => {
  logger.info('ipc: setClientSync', client);
  clientsActions.setClientFromSync(client)(store.dispatch, store.getState);
});

ipcRenderer.on('setAvoirSync', (event, avoir) => {
  logger.info('ipc: setAvoirSync', avoir);
  marketingActions.setAvoirFromSync(avoir)(store.dispatch, store.getState);
});

ipcRenderer.on('deleteAvoirSync', (event, avoir) => {
  logger.info('ipc: deleteAvoirSync', avoir);
  marketingActions.deleteAvoirFromSync(avoir)(store.dispatch, store.getState);
});

ipcRenderer.on('setTicketRestaurantSync', (event, ticketrestaurant) => {
  logger.info('ipc: setTicketRestaurantSync', ticketrestaurant);
  commandeActions.setTicketRestaurantFromSync(ticketrestaurant)(store.dispatch, store.getState);
});

ipcRenderer.on('setPointageSync', (event, pointage) => {
  logger.info('ipc: setPointageSync', pointage);
  employesActions.setPointageFromSync(pointage)(store.dispatch, store.getState);
});



ipcRenderer.on('setProduitSync', (event, produit) => {
  logger.info('ipc: setProduitSync', produit);
  catalogueActions.setProduitFromSync(produit)(store.dispatch, store.getState);
});
ipcRenderer.on('setGroupeSync', (event, groupe) => {
  logger.info('ipc: setGroupeSync', groupe);
  catalogueActions.setGroupeFromSync(groupe)(store.dispatch, store.getState);
});
ipcRenderer.on('setIngredientSync', (event, ingredient) => {
  logger.info('ipc: setIngredientSync', ingredient);
  catalogueActions.setIngredientFromSync(ingredient)(store.dispatch, store.getState);
});
ipcRenderer.on('setIngredientTypeSync', (event, ingredienttype) => {
  logger.info('ipc: setIngredientTypeSync', ingredienttype);
  catalogueActions.setIngredientTypeFromSync(ingredienttype)(store.dispatch, store.getState);
});
ipcRenderer.on('setProduitsSync', (event, produits) => {
  logger.info('ipc: setProduitsSync', produits);
  catalogueActions.setProduitsFromSync(produits)(store.dispatch, store.getState);
});
ipcRenderer.on('setIngredientsSync', (event, ingredients) => {
  logger.info('ipc: setIngredientsSync', ingredients);
  catalogueActions.setIngredientsFromSync(ingredients)(store.dispatch, store.getState);
});


ipcRenderer.on('setTimeadjustSync', (event, timeadjust) => {
  logger.info('ipc: setTimeadjustSync', timeadjust);
 // commandeActions.setTicketRestaurantFromSync(ticketrestaurant)(store.dispatch, store.getState);
});

ipcRenderer.on('setClotureSync', (event, cloture) => {
  logger.info('ipc: setClotureSync', cloture);
  clotureActions.setClotureFromSync(cloture)(store.dispatch, store.getState);
});

ipcRenderer.on('setTresorSync', (event, tresor) => {
  logger.info('ipc: setTresorSync', tresor);
  tresorActions.setTresorFromSync(tresor)(store.dispatch, store.getState);
});

ipcRenderer.on('setUserSync', (event, user) => {
  logger.info('ipc: setUserSync', user);
  userActions.setUserFromSync(user)(store.dispatch, store.getState);
});

ipcRenderer.on('chrono', (event, commande) => {
  logger.info('ipc: chrono', commande);
  logger.info('⚠️ setChrono désactivé')
  //  commandeActions.setChrono(commande)(store.dispatch, store.getState);
});

ipcRenderer.on('printticket', (event, print) => {
  logger.info('ipc: printticket', print);
  peripheralActions.printTicketFromAPI(print)(store.dispatch, store.getState);
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