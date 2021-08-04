import {emit} from 'eiphop';
import canonicalizeString from '@pelevesque/canonicalize-string';
import LodashId from 'lodash-id';
import logger from '../../helpers/Logger';

export const clientsServices = {
  getClientsList,
  getClient,
  findClient,
  createClient,
  updateClient,
  deleteClient,
  searchSecteurs
};


function getClientsList(params) {
  return emit('dbClientsGetAll', params);
}

function getClient(params) {
  return emit('dbClientsGetClient', params);
}

function findClient(params) {
  return emit('dbClientsFindClient', params);
}
  

function createClient(payload) {
  const client = {
    client_id: _newClientId(),
    prenom: payload.prenom,
    nom: payload.nom,
    email: payload.email,
    telephone: payload.telephone,
    telephone2: payload.telephone2,
    adresse: payload.adresse,
    adresse2: payload.adresse2,
    batiment: payload.batiment,
    etage: payload.etage,
    codepostal: payload.codepostal,
    ville: payload.ville,
    commentaire: payload.commentaire,
    prenom_canonical: canonicalizeString(payload.prenom),
    nom_canonical: canonicalizeString(payload.nom),
    inscription: new Date().getTime(),
    secteur: payload.secteur
  }

  logger.info('CltSv.createClient()', client);

  return emit('dbClientPersist', {client:client});
}

function updateClient(client) {
  return emit('dbClientPersist', {client:{
                                    ...client,
                                    prenom_canonical: canonicalizeString(client.prenom),
                                    nom_canonical: canonicalizeString(client.nom),
                                  }});
}

function deleteClient(client_id) {
  return emit('dbClientDelete', {client_id:client_id});
}



function searchSecteurs(params) {
  return emit('dbSecteursFindZip', params);
}



const _newClientId = () => {
  // let __d = new Date();
  // return 'clt'+__d.getTime().toString();
  return 'clt'+LodashId.createId();
}