import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import paths from './../../constants/routes.json';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem('user')
            ? <Component {...props} />
            : <Redirect to={{ pathname: paths.LOGIN, state: { from: props.location } }} />
    )} />
)