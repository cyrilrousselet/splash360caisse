// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { userReducer } from './../services/user/userReducer';
import { catalogueReducer } from './../services/catalogue/catalogueReducer';
import { commandeReducer } from './../services/commande/commandeReducer';
import { commandesListReducer } from './../services/commande/commandesListReducer';
import { peripheralReducer } from './../services/peripheral/peripheralReducer';
import { parametresReducer } from './../services/parametres/parametresReducer';
import { clotureReducer } from './../services/cloture/clotureReducer';
import { authentication } from './authenticationReducer';

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
        authentication
    });
}