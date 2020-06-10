import { createStore, applyMiddleware, compose } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware, routerActions } from 'connected-react-router';
//import Reactotron from '../ReactotronConfig';

// import { persistStore, persistReducer } from 'redux-persist';
// import createElectronStorage from 'redux-persist-electron-storage';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import createRootReducer from '../reducers';
import * as generalActions from '../actions';
import history from '../helpers/history';


const rootReducer = createRootReducer(history);

// const persistConfig = {
//     key: 'root',
//     storage: createElectronStorage(),
//     blacklist: ['catalogueReducer', 'commandeReducer', 'commandesListReducer']
// }

// const persistedReducer = persistReducer(persistConfig, rootReducer);

export function configureStore() {

    // Redux configuration
    const middleware = [];
    const enhancers = [];

    // Logging Middleware
    const logger = createLogger({
        level: 'info',
        collapsed: true
    });

    middleware.push(logger);

    middleware.push(thunkMiddleware);

    // Router Middleware
    const router = routerMiddleware(history);
    middleware.push(router);

    // Redux Devtools Configuration
    const actionCreators = {
        ...generalActions,
        ...routerActions
    };

    // If Redux DevTools Extension is installed use it, otherwise use Redux compose
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Options: http://extension.remotedev.io/docs/API/Arguments.html
            actionCreators
        }) :
        compose;

    enhancers.push(applyMiddleware(...middleware));
    const enhancer = composeEnhancers(...enhancers);

    //    const store = createStore(persistedReducer, {}, enhancer);
    //    const persistor = persistStore(store);
   // const store = createStore(rootReducer, {}, compose(enhancer, Reactotron.createEnhancer()));
    const store = createStore(rootReducer, {}, enhancer);

//    return { store, persistor };
    return { store };
};