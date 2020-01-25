import { emit } from 'eiphop';

export const peripheralServices = {
  printTest,
  printTicketCommande
};

function printTest() {
  return emit('printTest', {msg:'message de test'});
}

function printTicketCommande(imprimante, template, contenu) {
  return emit('printTicket', {imprimante, template, contenu});
}