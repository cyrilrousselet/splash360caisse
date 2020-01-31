import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import paths from '../../constants/routes';
import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';
import { Switch, Route, Redirect } from 'react-router-dom';
import { PrivateRoute } from '../common/PrivateRoute';
import Fournisseurs from './Fournisseurs';
import EtatFournisseurs from './EtatFournisseurs';
import Articles from './Articles';
import StocksCommandes from './StocksCommandes';
import Receptions from './Receptions';
import Inventaires from './Inventaires';
import LargeButton from '../common/LargeButton';
import history from '../../helpers/history';

let strings = new LocalizedStrings(data);

class Stocks extends React.Component {

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
    <div className="Stocks container">
      <TopZone />
      <div className="MainZone">          
          <Switch>
            <PrivateRoute exact path={ paths.STOCKS_FOURNISSEURS } component={ Fournisseurs } />
            <PrivateRoute exact path={ paths.STOCKS_ETATFOURNISSEURS } component={ EtatFournisseurs } />
            <PrivateRoute exact path={ paths.STOCKS_ARTICLES } component={ Articles } />
            <PrivateRoute exact path={ paths.STOCKS_COMMANDES } component={ StocksCommandes } />
            <PrivateRoute exact path={ paths.STOCKS_RECEPTIONS } component={ Receptions } />
            <PrivateRoute exact path={ paths.STOCKS_INVENTAIRES } component={ Inventaires } />
            <Route path={ paths.STOCKS }>
              <div className="Stocks-sommaire">
                <div className="titre"><LargeButton identifier='btntitre' elementclass='btntitre' icon={ true } text={ 'Stocks' } onClick={() => void(0) }></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnfournisseurs' elementclass='btnfournisseurs' icon={ false } text={ 'Fournisseurs' } onClick={() => { history.push(paths.STOCKS_FOURNISSEURS) }}></LargeButton></div>
                {/* <div class="sommaire-item"><LargeButton identifier='btnetatfournisseurs' elementclass='btnetatfournisseurs' icon={ false } text={ 'État Fournisseurs' } onClick={() => { history.push(paths.STOCKS_ETATFOURNISSEURS) }}></LargeButton></div> */}
                <div class="sommaire-item"><LargeButton identifier='btnarticles' elementclass='btnarticles' icon={ false } text={ 'Articles' } onClick={() => { history.push(paths.STOCKS_ARTICLES) }}></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btncommandes' elementclass='btncommandes' icon={ false } text={ 'Commandes' } onClick={() => { history.push(paths.STOCKS_COMMANDES) }}></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnreceptions' elementclass='btnreceptions' icon={ false } text={ 'Réceptions' } onClick={() => { history.push(paths.STOCKS_RECEPTIONS) }}></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btninventaires' elementclass='btninventaires' icon={ false } text={ 'Inventaires' } onClick={() => { history.push(paths.STOCKS_INVENTAIRES) }}></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnentrees' elementclass='btnentrees' icon={ false } text={ 'Entrées' } onClick={() => void(0) }></LargeButton></div>
                <div class="sommaire-item"><LargeButton identifier='btnsorties' elementclass='btnsorties' icon={ false } text={ 'Sorties' } onClick={() => void(0) }></LargeButton></div>
              </div>
            </Route>
          </Switch>
        </div>
    </div>
    );
  }
}
export default Stocks;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }