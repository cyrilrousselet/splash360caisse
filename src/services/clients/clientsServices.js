import {emit} from 'eiphop';
import {add} from 'date-fns';
import canonicalizeString from '@pelevesque/canonicalize-string';

export const clientsServices = {
  getClientsList,
  createClient,
  updateClient,
  deleteClient
};


function getClientsList(params) {
  return emit('dbClientsGetAll', params);
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
    inscription: new Date().getTime()
  }

  console.log('CltSv.createClient()', client);

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



const _newClientId = () => {
  let __d = new Date();
  return 'clt'+__d.getTime().toString();
}