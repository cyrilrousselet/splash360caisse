// @flow
import { connectRouter } from "connected-react-router";
import { combineReducers } from "redux";
import { catalogueReducer } from "./../services/catalogue/catalogueReducer";
import { clientsReducer } from "./../services/clients/clientsReducer";
import { clotureReducer } from "./../services/cloture/clotureReducer";
import { commandeReducer } from "./../services/commande/commandeReducer";
import { commandesListReducer } from "./../services/commande/commandesListReducer";
import { employesReducer } from "./../services/employes/employesReducer";
import { marketingReducer } from "./../services/marketing/marketingReducer";
import { notificationReducer } from "./../services/notification/notificationReducer";
import { parametresReducer } from "./../services/parametres/parametresReducer";
import { peripheralReducer } from "./../services/peripheral/peripheralReducer";
import { tableReducer } from "./../services/table/tableReducer";
import { tresorReducer } from './../services/tresorerie/tresorReducer';
import { userReducer } from "./../services/user/userReducer";
import { signatureReducer } from "./../services/signature/signatureReducer";
import { journalReducer } from "../services/journal/journalReducer";
import { numerotationReducer } from "./../services/signature/numerotationReducer";
import { authentication } from "./authenticationReducer";

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    userReducer,
    catalogueReducer,
    commandeReducer,
    commandesListReducer,
    peripheralReducer,
    parametresReducer,
    clotureReducer,
    employesReducer,
    marketingReducer,
    notificationReducer,
    tableReducer,
    tresorReducer,
    clientsReducer,
    signatureReducer,
    journalReducer,
    numerotationReducer,
    authentication,
  });
}
