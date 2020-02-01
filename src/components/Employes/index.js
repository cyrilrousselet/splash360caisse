import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import paths from '../../constants/routes';
import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';
import { Switch, Route, Redirect } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import Plannings from './Plannings';
import Pointeuse from './Pointeuse';
import Paies from './Paies';
import LargeButton from '../common/LargeButton';
import history from '../../helpers/history';

let strings = new LocalizedStrings(data);

class Employes extends React.Component {

  constructor(props) {
    super(props);
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

 componentWillMount() {
  // const { getAllActive } = this.props;
  // getAllActive();
 }

 shouldComponentRender() {
 //  const {loading} = this.props;
 //  if(loading===false) return false;
   return true;
 }

 render() {

 // const { catalogue, error, loading } = this.props;

  if(!this.shouldComponentRender()) {
    return <LoadingSpinner />
  }

  return (
    <div className="Employes container">
      <TopZone />
      <div className="MainZone">          
          <Switch>
            <PrivateRoute exact path={ paths.EMPLOYES_PLANNING } component={ Plannings } />
            <PrivateRoute exact path={ paths.EMPLOYES_POINTEUSE } component={ Pointeuse } />
            {/* <PrivateRoute exact path={ paths.EMPLOYES_PAIES } component={ Paies } /> */}
            <Route path={ paths.EMPLOYES }>
              <div className="Employes-sommaire">
                <div className="titre"><LargeButton identifier='btntitre' elementclass='btntitre' icon={ true } text={ 'Employes' } onClick={() => void(0) }></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnplanning' elementclass='btnplanning' icon={ false } text={ 'Planning' } onClick={() => { history.push(paths.EMPLOYES_PLANNING) }}></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnpointeuse' elementclass='btnpointeuse' icon={ false } text={ 'Pointeuse' } onClick={() => { history.push(paths.EMPLOYES_POINTEUSE) }}></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnpaies' elementclass='btnpaies' icon={ false } text={ 'Paies' } onClick={() => void(0) }></LargeButton></div>
              </div>
            </Route>
          </Switch>
        </div>
    </div>
    );
  }
}
export default Employes;

// Employes.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }