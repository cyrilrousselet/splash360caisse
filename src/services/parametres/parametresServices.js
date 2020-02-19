import {emit} from 'eiphop';

export const parametresServices = {
  update,
  getAll
 };

function getAll() {
  return emit('dbParametresGetAll', {from: 'services/parametresService'});
} 


function update(payload) {
  return emit('dbParametresUpdate', {payload: payload});
}