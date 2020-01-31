import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import fakesearch from '../../assets/images/fake_searchfield.svg';
import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_etatfournisseurs.svg';

let strings = new LocalizedStrings(data);


class EtatFournisseurs extends React.Component {

  render() {

    return(
      <div className="EtatFournisseurs">
        <div className="zoneBoutons">
        <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.STOCKS_FOURNISSEURS) }} />
            <StdButton identifier="btnnew" elementclass="btnnew" key="btnnew" text="Nouveau" onClick={ () => { return void(0) }} />
          </div>
          <div className="titre">État Fournisseurs</div>
          <div className="search"><img src={ fakesearch } /></div>
        </div>
        <div className="zoneliste">
          <div class="wrapper">
            <img src={ fakeliste } className="fakeliste" />
          </div>
        </div>
      </div>
    );
  }
}

export default EtatFournisseurs;

EtatFournisseurs.propTypes = {
}