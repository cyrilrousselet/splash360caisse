// main process domain

const electron = require('electron');
const {setupMainHandler} = require('eiphop');

const dbCatalogueApi = require('./dbCatalogueApi.js');
const dbCommandesApi = require('./dbCommandesApi.js');

setupMainHandler(electron, {...dbCatalogueApi, ...dbCommandesApi}, true);