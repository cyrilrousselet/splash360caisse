import {emit} from 'eiphop';
import externalParams from '../../constants/externalParams.json';

export const parametresServices = {
  update,
  getAll,
  replaceDatabase,
  installStation
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

// requestInstallStation()
// emit (dbParametreInstallStation)
function installStation(uniqid) {
  var __url = externalParams.synchro.installStation;
  console.log('installStation', uniqid);
  return emit('installStation', {url: __url, uniqid: uniqid});
}