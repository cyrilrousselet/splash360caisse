import {emit} from 'eiphop';

export const employesServices = {
  getPointagesList,
  newPointage,
  updatePointage
}

function getPointagesList(params) {
  return emit('dbPointagesGetAll', params);
}

function newPointage(params) {

  const pointage = {
    pointage_id: _newPointageId(),
    employe: params.user_id,
    clockin: params.time,
    clockout: null,
    status: 'opened'
  }

  return emit('dbPointagesPersist', {pointage:pointage});
}


function updatePointage(pointage) {
  return emit('dbPointagesPersist', {pointage:pointage});
}

const _newPointageId = () => {
  let __d = new Date();
  return 'clock'+__d.getTime().toString();
}