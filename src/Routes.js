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
import ClotureHomeCont from './containers/ClotureHomeCont';
import ListeCloturesCont from './containers/ListeCloturesCont';
import EmployesCont from './containers/EmployesCont';
import DepensesCont from './containers/DepensesCont';
import ListeCommandesCont from './containers/ListeCommandesCont';
import StocksCont from './containers/StocksCont';
import StatistiquesCont from './containers/StatistiquesCont';
import MenuCont from './containers/MenuCont';
import ClientsCont from './containers/ClientsCont';
import MainLoaderCont from './containers/MainLoaderCont';
import TresorerieCont from './containers/TresorerieCont';

export default () => (
  <App>
    <Switch>
      <PrivateRoute exact path={ paths.MAIN_LOADER } component={MainLoaderCont} />
      <PrivateRoute exact path={ paths.DASHBOARD } component={DashboardCont} />
      <Route path={ paths.LOGIN } component={LoginCont} />
      <PrivateRoute path={ paths.MARKETING } component={MarketingCont} />
      <PrivateRoute path={ paths.ENCAISSEMENT } component={Encaissement} />
      <PrivateRoute path={ paths.EMPLOYES } component={EmployesCont} />
      <PrivateRoute path={ paths.DEPENSES } component={DepensesCont} />
      <PrivateRoute path={ paths.LISTECOMMANDES } component={ListeCommandesCont} />
      <PrivateRoute path={ paths.CLOTURE } component={ClotureHomeCont} />
      <PrivateRoute path={ paths.LISTECLOTURES } component={ListeCloturesCont} />
      <PrivateRoute exact path={ paths.CLOTURE_TRESOR } component={TresorerieCont} />
      <PrivateRoute path={ paths.STOCKS } component={StocksCont} />
      <PrivateRoute path={ paths.STATISTIQUES } component={StatistiquesCont} />
      <PrivateRoute path={ paths.MENU } component={MenuCont} />
      <PrivateRoute path={ paths.CLIENTS } component={ClientsCont} />
      {/* <PrivateRoute path={ paths.COMPTE_UTILISATEUR } component={CompteUtilisateurCont} /> */}
      <PrivateRoute path={ paths.PARAMETRES } component={ParametresCont} />
    </Switch>
  </App>
);