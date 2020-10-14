import React from 'react';

import StdButton from '../common/StdButton';

import fakesearch from '../../assets/images/fake_searchfield.svg';
import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_inventaire.svg';


class Inventaires extends React.Component {

  render() {

    return(
      <div className="Inventaires">
        <div className="zoneBoutons">
        <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.STOCKS) }} />
            <StdButton identifier="btnnew" elementclass="btnnew" key="btnnew" text="Nouveau" onClick={ () => { return void(0) }} />
          </div>
          <div className="titre">Inventaires</div>
          <div className="search"><img src={ fakesearch } alt="" /></div>
        </div>
        <div className="zoneliste">
        <div class="wrapper">
            <img src={ fakeliste } className="fakeliste" alt="" />
          </div>
        </div>
      </div>
    );
  }
}

export default Inventaires;

Inventaires.propTypes = {
}