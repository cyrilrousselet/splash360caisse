import React from 'react';
import TopZone from '../../containers/TopZone';
import Navigation from '../common/Navigation.js';
import { Switch } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import paths from '../../constants/routes';
import { marketSubmodulesList } from '../../constants/modules';

import Promotions from './Promotions';
import Newsletter from './Newsletter';
import Sms from './Sms';

import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
let strings = new LocalizedStrings(data);


class Marketing extends React.Component {
  render() {
    const { onClickSubModule } = this.props;

    return (
      <div className="Marketing container">
        <TopZone />
        <div className="MainZone">
          <Navigation submodules={ marketSubmodulesList } titre={ strings.modules.marketing.nom } strings={ strings.modules.marketing.submodules } path_prefix={ 'MARKET' } onClickSubmodule={ onClickSubModule } />
          
          <Switch>
            <PrivateRoute exact path={ paths.MARKET_PROMOTIONS } component={ Promotions } />
            <PrivateRoute exact path={ paths.MARKET_NEWSLETTER } component={ Newsletter } />
            <PrivateRoute exact path={ paths.MARKET_SMS } component={ Sms } />
          </Switch>
        </div>
      </div>
    );
  }
};

export default Marketing;