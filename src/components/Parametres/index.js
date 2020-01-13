import React from 'react';
import TopZone from '../../containers/TopZone';
import Navigation from '../common/Navigation.js';
import { Switch } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import paths from '../../constants/routes';
import { paramSubmodulesList } from '../../constants/modules';

import Commandes from './Commandes';
import Entreprise from './Entreprise';
import Financier from './Financier';
import Options from './Options';
import Utilisateurs from './Utilisateurs';
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
            <PrivateRoute exact path={ paths.PARAM_ENTREPRISE } component={ Entreprise } />
            <PrivateRoute exact path={ paths.PARAM_UTILISATEURS } component={ Utilisateurs } />
            <PrivateRoute exact path={ paths.PARAM_FINANCIER } component={ Financier } />
            <PrivateRoute exact path={ paths.PARAM_PERIPHERIQUES } component={ Peripheriques } />
            <PrivateRoute exact path={ paths.PARAM_COMMANDES } component={ Commandes } />
            <PrivateRoute exact path={ paths.PARAM_OPTIONS } component={ Options } />
          </Switch>
        </div>
      </div>
    );
  }
};

export default Parametres;