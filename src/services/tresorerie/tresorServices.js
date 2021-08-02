import {emit} from 'eiphop';

import LodashId from 'lodash-id';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';

// const logger = new Logger();

export const tresorServices = {
  createTresor,
  getTresors,
  getLastOuvertureAndAfter,
  getLastClotureAndAfter,
  getServiceMouvements,
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
  logger.info('getTresors()',params);
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
  logger.info('getLastOuvertureAndAfter()', params);
  return emit( "dbTresorerieLastOuvertureAndAfter", params );
}

function getLastClotureAndAfter(params) {
  logger.info('getLastClotureAndAfter', params);
  return emit( "dbTresorerieLastClotureAndAfter", params );
}

function getServiceMouvements(params) {
  logger.info('getServiceMouvements', params);
  return emit( "dbTresorerieGetServiceMouvements", params );
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