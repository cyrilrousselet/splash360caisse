import { emit } from 'eiphop';

export const peripheralServices = {
  printTest
};

function printTest() {
  return emit('printTest', {msg:'message de test'});
}