import {emit} from 'eiphop';
import {add} from 'date-fns';
import LodashId from 'lodash-id';

export const marketingServices = {
  getAvoirsList,
  getAvoirs,
  getReglesPanierList,
  getReglesCatalogueList,
  getGiftsList,
  createAvoir,
  updateAvoir,
  deleteAvoir
};


function getAvoirsList() {
  return emit('dbAvoirGetAll', {});
}
function getAvoirs(params) {
  return emit('dbAvoirGetAvoirs', params);
}
function getReglesPanierList(params) {
  return emit('dbReglePanierGetAll', params);
}
function getReglesCatalogueList(params) {
  return emit('dbRegleCatalogueGetAll', params);
}
function getGiftsList(params) {
  return emit('dbGiftsGetAll', params);
}


function createAvoir(payload) {
  const avoir = {
    avoir_id: _newAvoirId(),
    emission: new Date().getTime(),
    limite: add(new Date(),{months:1}).getTime(),
    operator: payload.operator_id,
    client: payload.client_id,
    commande: payload.ticket_id,
    valeur: payload.valeur,
    code: `cdt${new Date().getTime().toString(16)}`
  }

  return emit('dbAvoirPersist', {avoir:avoir});
}

function updateAvoir(avoir) {
  return emit('dbAvoirPersist', {avoir:avoir});
}

function deleteAvoir(avoir_id) {
  return emit('dbAvoirDelete', {avoir_id:avoir_id});
}



const _newAvoirId = () => {
  return 'avr'+LodashId.createId();
}