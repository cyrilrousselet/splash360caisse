// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { userReducer } from './userReducer';
import { catalogueReducer } from './catalogueReducer';
import { commandeReducer } from './commandeReducer';
import { commandesListReducer } from './commandesListReducer';
import { authentication } from './authenticationReducer';

export default function createRootReducer(history) {
    return combineReducers({
        router: connectRouter(history),
        userReducer,
        catalogueReducer,
        commandeReducer,
        commandesListReducer,
        authentication
    });
}