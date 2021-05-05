import {emit} from 'eiphop';
import externalParams from '../../constants/externalParams.json';

export const parametresServices = {
  update,
  getAll,
  replaceDatabase,
  installStation,
  getStatus,
  getSplashToken
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

async function getStatus(params) {  //get station status
  const __splashToken = await getSplashToken(params);
  console.log('checkStatus');
  var __url = externalParams.synchro.getStatus;
  return emit('getStatus', {url: __url, access_token: __splashToken.splash_token.access_token});
}

async function getSplashToken(params) {
  const url = externalParams.synchro.oAuth.replace('%ID%', params.id).replace('%PWD%', params.secret);
  return emit('getSplashToken', {params:url});
} 