import React from 'react';
// import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import paths from '../../constants/routes';
import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';
import { Switch, Route, Redirect } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import Plannings from './Plannings';
import LargeButton from '../common/LargeButton';
import history from '../../helpers/history';
import EmployesPointeuseCont from '../../containers/EmployesPointeuseCont';
import EmployesPaiesCont from '../../containers/EmployesPaiesCont';
import EmployesPlanningCont from '../../containers/EmployesPlanningCont';


let strings = new LocalizedStrings(data);

class Employes extends React.Component {

  constructor(props) {
    super(props);
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

  componentDidMount() {
    const { getAllPointages, getAllUsers } = this.props;
    getAllPointages();
    getAllUsers();
  }

 shouldComponentRender() {
 //  const {loading} = this.props;
 //  if(loading===false) return false;
   return true;
 }

 render() {

   const { submodules } = this.props;

  if(!this.shouldComponentRender()) {
    return <LoadingSpinner />
  }

  return (
    <div className="Employes container">
      <TopZone />
      <div className="MainZone">          
          <Switch>
            { submodules.indexOf('planning')!==-1 && <PrivateRoute exact path={ paths.EMPLOYES_PLANNING } component={ EmployesPlanningCont } />}
            <PrivateRoute exact path={ paths.EMPLOYES_POINTEUSE } component={ EmployesPointeuseCont } />
            { submodules.indexOf('paies')!==-1 && <PrivateRoute exact path={ paths.EMPLOYES_PAIES } component={ EmployesPaiesCont } />}
            <Route path={ paths.EMPLOYES }>
              <div className="Employes-sommaire">
                <div className="titre"><LargeButton identifier='btntitre' elementclass='btntitre' icon={ true } text={ 'Employes' } onClick={() => void(0) }></LargeButton></div>
                { submodules.indexOf('planning')!==-1 && <div className="sommaire-item"><LargeButton identifier='btnplanning' elementclass='btnplanning' icon={ false } text={ 'Planning' } onClick={() => { history.push(paths.EMPLOYES_PLANNING) }}></LargeButton></div> }
                <div className="sommaire-item"><LargeButton identifier='btnpointeuse' elementclass='btnpointeuse' icon={ false } text={ strings.modules.employes.pointeuse.titre } onClick={() => { history.push(paths.EMPLOYES_POINTEUSE) }}></LargeButton></div>
                { submodules.indexOf('paies')!==-1 &&  <div className="sommaire-item"><LargeButton identifier='btnpaies' elementclass='btnpaies' icon={ false } text={ 'Paies' } onClick={() => history.push(paths.EMPLOYES_PAIES) }></LargeButton></div> }
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