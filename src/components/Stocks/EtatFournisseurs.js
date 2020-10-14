import React from 'react';

import StdButton from '../common/StdButton';


import fakesearch from '../../assets/images/fake_searchfield.svg';
import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_etatfournisseurs.svg';



class EtatFournisseurs extends React.Component {

  render() {

    return(
      <div className="EtatFournisseurs">
        <div className="zoneBoutons">
        <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.STOCKS_FOURNISSEURS) }} />
          </div>
          <div className="titre">État Fournisseurs</div>
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

export default EtatFournisseurs;

EtatFournisseurs.propTypes = {
}