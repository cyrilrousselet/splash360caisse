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
import { notificationActions } from './services/notification/notificationActions';

//import routes from './Routes';

// import log from 'electron-log';

import paths from './constants/routes';

// import reducer from './reducers';
import './index.scss';
import registerServiceWorker from './registerServiceWorker';

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

  if (data.type=='orders.notification') {
    // vérifie si LocalStorage contient un token et s'il est toujours valide
    //const _token = notificationActions.get


  }


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