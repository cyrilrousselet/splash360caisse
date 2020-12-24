import {emit} from 'eiphop';

import LodashId from 'lodash-id';
import Logger from '../../helpers/Logger';

const logger = new Logger();

export const tresorServices = {
  createTresor,
  getTresors,
  getLastOuvertureAndAfter,
  getLastClotureAndAfter,
  getLastMouvement,
  persistTresor
};

function createTresor(params) {
  return {
    tresorId: _getTresorId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: params.user,
    caisse: params.caisse,
    origine: params.origine,
    destination: params.destination,
    credit: params.credit,
    debit: params.debit,
    solde: params.solde,
    type: params.type,
    detail: params.detail
  }
}

function getTresors(params) {
  logger.log('getTresors()',params);
  return emit( "dbTresorerieGet", params );
}

/**
 * Retourne la liste de la dernière ouverture et des mouvements suivants
 * ou bien la liste des mouvements du jour si aucune ouverture n'est trouvée
 * pour une caisse donnée
 * 
 * @param {caisseId, createdAt} params 
 */
function getLastOuvertureAndAfter(params) {
  logger.log('getLastOuvertureAndAfter()', params);
  return emit( "dbTresorerieLastOuvertureAndAfter", params );
}

function getLastClotureAndAfter(params) {
  logger.log('getLastClotureAndAfter', params);
  return emit( "dbTresorerieLastClotureAndAfter", params );
}

function getLastMouvement(caisseId) {
  return emit( "dbTresorerieGetLastMouvement", {caisseId: caisseId} );
}

function persistTresor(tresor) {
  return emit( "dbTresoreriePersist", { tresor: tresor } );
}

function _getTresorId() {
  return LodashId.createId();
}