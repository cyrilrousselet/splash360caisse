// main process domain

const electron = require('electron');
const {setupMainHandler} = require('eiphop');

const dbCatalogueApi = require('./dbCatalogueApi.js');
const dbCommandesApi = require('./dbCommandesApi.js');
const dbCloturesApi = require('./dbCloturesApi.js');
const dbParametresApi = require('./dbParametresApi.js');
const dbEmployesApi = require('./dbEmployesApi.js');
const dbMarketingApi = require('./dbMarketingApi.js');
const dbUsersApi = require('./dbUsersApi.js');
const dbClientsApi = require('./dbClientsApi.js');

const peripheralApi = require('./peripheralApi.js');
const server = require('./server.js');
const sse = require('./sseApi.js');
// const kds = require('./kitchenDisplayServer.js');
const kds = require('./kdsEmitter.js');


setupMainHandler(electron, {
                  ...dbCatalogueApi, 
                  ...dbCommandesApi,
                  ...dbCloturesApi,
                  ...dbParametresApi,
                  ...dbEmployesApi,
                  ...dbMarketingApi,
                  ...dbUsersApi,
                  ...dbClientsApi,
                  ...peripheralApi,
                  ...server,
                  ...sse,
                  ...kds
                }, true);