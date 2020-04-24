import React from 'react';
import TopZone from '../../containers/TopZone';
import Navigation from '../common/Navigation.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import paths from '../../constants/routes';
import { paramSubmodulesList } from '../../constants/modules';

import ParametresEntrepriseCont from './../../containers/ParametresEntrepriseCont';
import ParametresFinancierCont from './../../containers/ParametresFinancierCont';
import ParametresCommandesCont from './../../containers/ParametresCommandesCont';
import Options from './Options';
import ParametresUtilisateursCont from './../../containers/ParametresUtilisateursCont';
import Peripheriques from './Peripheriques';

import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
let strings = new LocalizedStrings(data);


class Parametres extends React.Component {
  render() {
    const { onClickSubModule } = this.props;

    return (
      <div className="Parametres container">
        <TopZone />
        <div className="MainZone">
          <Navigation submodules={ paramSubmodulesList } titre={ strings.modules.parametres.nom } strings={ strings.modules.parametres.submodules } path_prefix={ 'PARAM' } onClickSubmodule={ onClickSubModule } />
          
          <Switch>
            <PrivateRoute exact path={ paths.PARAM_ENTREPRISE } component={ ParametresEntrepriseCont } />
            <PrivateRoute exact path={ paths.PARAM_UTILISATEURS } component={ ParametresUtilisateursCont } />
            <PrivateRoute exact path={ paths.PARAM_FINANCIER } component={ ParametresFinancierCont } />
            <PrivateRoute exact path={ paths.PARAM_PERIPHERIQUES } component={ Peripheriques } />
            <PrivateRoute exact path={ paths.PARAM_COMMANDES } component={ ParametresCommandesCont } />
            <PrivateRoute exact path={ paths.PARAM_OPTIONS } component={ Options } />
            <Route path={ paths.PARAMETRES }>
              <Redirect to={{ pathname: paths.PARAM_ENTREPRISE }} />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
};

export default Parametres;