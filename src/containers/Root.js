// @flow
import React from 'react';
import { Provider, ReactReduxContext } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import type { Store } from '../reducers/types';
import Routes from '../Routes';
import LoadingSpinner from '../components/common/LoadingSpinner';


type Props = {
  store: Store,
  persistor: any,
  history: {}
};

const Root = ({ store, persistor, history }: Props) => (
  <Provider store={store} context={ReactReduxContext}>
    <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
      <ConnectedRouter history={history} context={ReactReduxContext}>
        <Routes />
      </ConnectedRouter>
    </PersistGate>
  </Provider>
);

export default hot(Root);
