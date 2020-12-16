import React from 'react';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import paths from '../../constants/routes';
import TopZone from '../../containers/TopZone';
import { Switch, Route } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import LargeButton from '../common/LargeButton';
import history from '../../helpers/history';

import ClotureCont from '../../containers/ClotureCont';


let strings = new LocalizedStrings(data);


class CloturesHome extends React.Component {


  render() {

    const { submodules } = this.props;

    return (
      <div className="CloturesHome container">
        <TopZone />
        <div className="MainZone">          
            <Switch>
              { submodules.indexOf('cloture')!==-1 && <PrivateRoute exact path={ paths.CLOTURE_SELECTEUR } component={ ClotureCont } />}
              <Route path={ paths.CLOTURE }>
                <div className="CloturesHome-sommaire">
                  <div className="titre"><LargeButton identifier='btntitre' elementclass='btntitre' icon={ true } text={ strings.modules.cloture.nom } onClick={() => void(0) }></LargeButton></div>
                  { submodules.indexOf('cloture')!==-1 && <div className="sommaire-item"><LargeButton identifier='btncloture' elementclass='btncloture' icon={ false } text={ strings.modules.cloture.nom } onClick={() => { history.push(paths.CLOTURE_SELECTEUR) }}></LargeButton></div> }
                  { submodules.indexOf('cloture')!==-1 && <div className="sommaire-item"><LargeButton identifier='btnliste' elementclass='btnliste' icon={ false } text={ strings.modules.listeclotures.nom } onClick={() => { history.push(paths.LISTECLOTURES) }}></LargeButton></div> }
                  { submodules.indexOf('tresor')!==-1 &&  <div className="sommaire-item"><LargeButton identifier='btnpaies' elementclass='btnpaies' icon={ false } text={ strings.modules.tresor.nom } onClick={() => history.push(paths.CLOTURE_TRESOR) }></LargeButton></div> }
                </div>
              </Route>
            </Switch>
          </div>
      </div>
      );
  }


}
export default CloturesHome;