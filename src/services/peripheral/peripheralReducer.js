import { peripheralActionTypes } from './peripheralActionTypes';
import { parametresActionTypes } from '../parametres/parametresActionTypes';

const initialState = {
  drawerOpen: false,
  imprimantes: {},
  tickets: {}
}

export function peripheralReducer(state = initialState, action) {

  let { imprimantes, tickets } = state;

  switch (action.type) {
    case peripheralActionTypes.OPEN_DRAWER:
    case peripheralActionTypes.OPEN_DRAWER_FAILURE:
      return {
        ...state,
        drawerOpen: true
      };
    case peripheralActionTypes.CLOSE_DRAWER:
      return {
        ...state,
        drawerOpen: false
      };
    case parametresActionTypes.GETALL_SUCCESS:
      return {
        ...state,
        imprimantes: action.imprimantes,
        tickets: action.tickets
      }
    case peripheralActionTypes.GETALL_IMPRIMANTE_SUCCESS:
      return {
        ...state,
        imprimantes: action.imprimantes
      }
    case peripheralActionTypes.GETALL_TICKET_SUCCESS:
      return {
        ...state,
        tickets: action.tickets
      }
    case peripheralActionTypes.UPDATE_IMPRIMANTE_SUCCESS:
      const paramsprinter = action.imprimante;
      const updated_printer = imprimantes[action.imprimante.printer_id];
      const newprinter = {...updated_printer, ...paramsprinter};
      console.log('newprinter',action.imprimante.printer_id, newprinter);
      return {
        ...state,
        imprimantes: {
          ...imprimantes,
          [action.imprimante.printer_id]: {
            ...newprinter
          } 
        }
      }
    case peripheralActionTypes.UPDATE_TICKET_SUCCESS:
      const paramsticket = action.ticket;
      const updated_ticket = tickets[action.ticket.ticket_id];
      const newticket = {...updated_ticket, ...paramsticket};
      return {
        ...state,
        tickets: {
          ...tickets,
          [action.ticket.ticket_id]: {
            ...newticket
          }
        }
      }
    default:
      return state;
  }
}


export const getTiroirOuvert = state => state.peripheralReducer.drawerOpen;