import {emit} from 'eiphop';
import {add} from 'date-fns';

export const marketingServices = {
  getAvoirsList,
  getReglesPanierList,
  getReglesCatalogueList,
  createAvoir,
  updateAvoir,
  deleteAvoir
};


function getAvoirsList(params) {
  return emit('dbAvoirGetAll', params);
}
function getReglesPanierList(params) {
  return emit('dbReglePanierGetAll', params);
}
function getReglesCatalogueList(params) {
  return emit('dbRegleCatalogueGetAll', params);
}


function createAvoir(payload) {
  const avoir = {
    avoir_id: _newAvoirId(),
    emission: new Date().getTime(),
    limite: add(new Date(),{month:1}).getTime(),
    operator: payload.operator_id,
    client: payload.client_id,
    valeur: payload.valeur,
    code: new Date().getTime().toString(16)
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
  let __d = new Date();
  return 'avr'+__d.getTime().toString();
}