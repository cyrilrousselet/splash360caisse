import {emit} from 'eiphop';

import Logger from '../../helpers/Logger';


const logger = new Logger();


export const tableServices = {
  getNewSalle,
  getSalleById,
  getSallesList,
  getNewTable,
  getTableById,
  // takeTable,
  // freeTable,
  persistSalle,
  deleteSalle,
  persistTable,
  deleteTable,
};

function getNewSalle(params) {
  return {
    salleId: _newSalleId(),
    nom: '',
    weight: 0,
    couleur: null,
    tables: []
  };
}


function getSalleById(id) {
  return emit('dbTableGetSalle', {salleId: id});
}
function deleteSalle(id) {
  return emit('dbTableDeleteSalle', {salleId: id});
}
function getSallesList(params) {
  return emit('dbTableGetAllSalles', params);
}

function persistSalle(salle) {
  logger.log('tabS.persistSalle()', salle);
  return emit('dbTablePersistSalle', {salle:salle});
}


function getNewTable(params) {
  return {
    tableId: _newTableId(),
    nom: '',
    weight: 0,
    couverts: 0,
    ticketId: null,
    salleId: null,
    serveur: null,
    status: 'free'
  };
}

function getTableById(id) {
  return emit('dbTableGetTable', {tableId: id});
}
function deleteTable(id) {
  return emit('dbTableDeleteTable', {tableId: id});
}
function persistTable(table) {
  return emit('dbTablePersistTable', {table:table});
}


const _newSalleId = () => {
  let __d = new Date();
  return __d.getTime().toString();
}
const _newTableId = () => {
  let __d = new Date();
  return __d.getTime().toString();
}