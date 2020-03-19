// main process domain

const electron = require('electron');
const {setupMainHandler} = require('eiphop');

const dbCatalogueApi = require('./dbCatalogueApi.js');
const dbCommandesApi = require('./dbCommandesApi.js');
const dbParametresApi = require('./dbParametresApi.js');
const dbUsersApi = require('./dbUsersApi.js');

const peripheralApi = require('./peripheralApi.js');
const server = require('./server.js');


setupMainHandler(electron, {
                  ...dbCatalogueApi, 
                  ...dbCommandesApi,
                  ...dbParametresApi,
                  ...dbUsersApi,
                  ...peripheralApi,
                  ...server
                }, true);