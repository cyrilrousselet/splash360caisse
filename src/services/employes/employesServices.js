import {emit} from 'eiphop';
import LodashId from 'lodash-id';

export const employesServices = {
  getPointagesList,
  getShiftsList,
  getTimeajustsList,
  newPointage,
  updatePointage,
  createShift,
  updateShift,
  deleteShift,
  createTimeadjust,
  updateTimeadjust,
  deleteTimeadjust
}

function getPointagesList(params) {
  return emit('dbPointagesGetAll', params);
}
function getShiftsList(params) {
  return emit('dbShiftsGetAll', params);
}
function getTimeajustsList(params) {
  return emit('dbTimeadjustsGetAll', params);
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


function createShift(params) {

  const shift = {
    shift_id: _newShiftId(),
    employe: params.employe,
    poste: params.poste,
    date: params.date,
    start: params.start,
    end: params.end,
    recurrence: params.recurrence
  }

  return emit('dbShiftPersist', {shift:shift});
}

function updateShift(shift) {
  return emit('dbShiftPersist', {shift:shift});
}

function deleteShift(shift_id) {
  return emit('dbShiftDelete', {shift_id:shift_id});
}


function createTimeadjust(params) {

  const timeadjust = {
    adjust_id: _newTimeadjustId(),
    employe: params.employe,
    user: params.user,
    date: params.date,
    valeur: params.valeur
  }

  return emit('dbTimeadjustPersist', {timeadjust:timeadjust});
}

function updateTimeadjust(timeadjust) {
  return emit('dbTimeadjustPersist', {timeadjust:timeadjust});
}

function deleteTimeadjust(adjust_id) {
  return emit('dbTimeadjustDelete', {adjust_id:adjust_id});
}

const _newPointageId = () => {
  return 'clock'+LodashId.createId();
}
const _newTimeadjustId = () => {
  return 'clockADJ'+LodashId.createId();
}
const _newShiftId = () => {
  return 'shift'+LodashId.createId();
}