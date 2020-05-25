import React from 'react';
import TopZone from '../../containers/TopZone';
import Navigation from '../common/Navigation.js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import paths from '../../constants/routes';
import { marketSubmodulesList } from '../../constants/modules';

import MarketingAvoirsCont from './../../containers/MarketingAvoirsCont';
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
            <PrivateRoute path={ paths.MARKET_AVOIRS } component={ MarketingAvoirsCont } />
            {/* <PrivateRoute exact path={ paths.MARKET_NEWSLETTER } component={ Newsletter } />
            <PrivateRoute path={ paths.MARKET_PROMOTIONS } component={ Promotions } />
            <PrivateRoute exact path={ paths.MARKET_SMS } component={ Sms } /> */}
            <Route path={ paths.MARKETING }>
              {/* <Redirect to={{ pathname: paths.MARKET_PROMOTIONS }} /> */}
              <Redirect to={{ pathname: paths.MARKET_PROMOTIONS }} />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
};

export default Marketing;