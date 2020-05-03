// main process domain

const electron = require('electron');
const {setupMainHandler} = require('eiphop');

const dbCatalogueApi = require('./dbCatalogueApi.js');
const dbCommandesApi = require('./dbCommandesApi.js');
const dbCloturesApi = require('./dbCloturesApi.js');
const dbParametresApi = require('./dbParametresApi.js');
const dbEmployesApi = require('./dbEmployesApi');
const dbUsersApi = require('./dbUsersApi.js');

const peripheralApi = require('./peripheralApi.js');
const server = require('./server.js');


setupMainHandler(electron, {
                  ...dbCatalogueApi, 
                  ...dbCommandesApi,
                  ...dbCloturesApi,
                  ...dbParametresApi,
                  ...dbEmployesApi,
                  ...dbUsersApi,
                  ...peripheralApi,
                  ...server
                }, true);