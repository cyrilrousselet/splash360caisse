import {emit} from 'eiphop';

import LodashId from 'lodash-id';
import Logger from '../../helpers/Logger';

const logger = new Logger();

export const tresorServices = {
  createTresor,
  getTresors,
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
    type: params.type,
    detail: params.detail
  }
}

function getTresors(params) {
  logger.log('getTresors()',params);
  return emit( "dbTresorerieGetTresor", params );
}

function persistTresor(tresor) {
  return emit( "dbTresoreriePersistTresor", { tresor: tresor } );
}

function _getTresorId() {
  return LodashId.createId();
}