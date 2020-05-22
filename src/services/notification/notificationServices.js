import {emit} from 'eiphop';
import externalUrls from '../../constants/externalUrls.json';

export const notificationServices = {
  getToken,
  initSSE
 };

function getToken() {



} 


function initSSE(restaurant_id) {
  return emit('sseInit', {restaurant_id: restaurant_id});
}

// function update(payload) {
//   return emit('dbParametresUpdate', {payload: payload});
// }