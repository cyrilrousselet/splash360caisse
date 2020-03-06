import { emit } from 'eiphop';

export const peripheralServices = {
  printTest,
  printTicket,
  openDrawer
};

function printTest() {
  return emit('printTest', {msg:'message de test'});
}

function printTicket(imprimante, template, contenu) {
  return emit('printTicket', {imprimante, template, contenu});
}

function openDrawer(imprimante) {
  return emit('openDrawer', {imprimante});
}