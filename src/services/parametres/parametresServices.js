import {emit} from 'eiphop';

export const parametresServices = {
  update,
  getAll,
  replaceDatabase
 };

function getAll() {
  return emit('dbParametresGetAll', {from: 'services/parametresService'});
} 


function update(payload) {
  return emit('dbParametresUpdate', {payload: payload});
}
function replaceDatabase(parametres) {
  console.log('replaceDatabase', parametres);
  return emit('dbParametresCompleteDB', {data:parametres});
}