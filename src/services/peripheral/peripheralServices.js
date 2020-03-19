import { emit } from 'eiphop';

export const peripheralServices = {
  printTest,
  printTicket,
  openDrawer
};

function printTest() {
  return emit('printTest', {msg:'message de test'});
}

function printTicket(tickets, defaultprinter) {
  return emit('printTicket', {tickets, defaultprinter});
}

function openDrawer(imprimante) {
  return emit('openDrawer', {imprimante});
}