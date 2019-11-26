import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { PrivateRoute } from './components/common/PrivateRoute';
import paths from './constants/routes';

import App from './containers/App';
import DashboardCont from './containers/DashboardCont';
import LoginCont from './containers/LoginCont';
import ParametresCont from './containers/ParametresCont';
import Encaissement from './components/Encaissement';
import MarketingCont from './containers/MarketingCont';
import ClotureCont from './containers/ClotureCont';
import PlanningsCont from './containers/PlanningsCont';
import DepensesCont from './containers/DepensesCont';
import StocksCont from './containers/StocksCont';
import StatistiquesCont from './containers/StatistiquesCont';
import MenuCont from './containers/MenuCont';
import ClientsCont from './containers/ClientsCont';

export default () => (
  <App>
    <Switch>
      <PrivateRoute exact path={ paths.DASHBOARD } component={DashboardCont} />
      <Route path={ paths.LOGIN } component={LoginCont} />
      <PrivateRoute path={ paths.MARKETING } component={MarketingCont} />
      <PrivateRoute path={ paths.ENCAISSEMENT } component={Encaissement} />
      <PrivateRoute path={ paths.PLANNINGS } component={PlanningsCont} />
      <PrivateRoute path={ paths.DEPENSES } component={DepensesCont} />
      <PrivateRoute path={ paths.CLOTURE } component={ClotureCont} />
      <PrivateRoute path={ paths.STOCKS } component={StocksCont} />
      <PrivateRoute path={ paths.STATISTIQUES } component={StatistiquesCont} />
      <PrivateRoute path={ paths.MENU } component={MenuCont} />
      <PrivateRoute path={ paths.CLIENTS } component={ClientsCont} />
      {/* <PrivateRoute path={ paths.COMPTE_UTILISATEUR } component={CompteUtilisateurCont} /> */}
      <PrivateRoute path={ paths.PARAMETRES } component={ParametresCont} />
    </Switch>
  </App>
);