import { emit } from 'eiphop';
import logger from '../../helpers/Logger';

export const peripheralServices = {
  printTest,
  printTicket,
  openDrawer,
  updateImprimante,
  deleteImprimante,
  getAllImprimantes,
  updateTicket,
  deleteTicket,
  getAllTickets,
  setCommandeToKDS,
  quitApp
};

function quitApp() {
  return emit('quitApp', {});
}

function printTest() {
  return emit('printTest', {msg:'message de test'});
}

function printTicket(imprimante, template, contenu) {

  logger.info('printTicket imprimante', imprimante);

  return emit('printTicket', {imprimante, template, contenu});
}

function openDrawer(imprimante) {
  return emit('openDrawer', {imprimante});
}

function updateImprimante(imprimante) {
  return emit('dbParametresUpdateImprimante', {imprimante: imprimante});
}

function deleteImprimante(printer_id) {
  return emit('dbParametresDeleteImprimante', {printer_id: printer_id});
}

function getAllImprimantes() {
  return emit('dbParametresGetallImprimantes',{});
}

function updateTicket(ticket) {
  return emit('dbParametresUpdateTicket', {ticket: ticket});
}

function deleteTicket(ticket_id) {
  return emit('dbParametresDeleteTicket', {ticket_id: ticket_id});
}

function getAllTickets() {
  return emit('dbParametresGetallTickets',{});
}

function setCommandeToKDS(commande, url) {
  return emit('setOrderToKDS', {order:commande, url:url});
}
