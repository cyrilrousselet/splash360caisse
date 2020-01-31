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

import fakeliste from '../../assets/images/fake_stocks_articles.svg';
import fakepopin from '../../assets/images/fake_stocks_article_popin.svg';

let strings = new LocalizedStrings(data);

const NewArticle = ({open, closePopin}) => (

  <Modal open={open}>
    <div className="NewArticle">
      <div className="Modal-container">
        <div className="header">
          <div className="title">Nouvel Article</div>
        </div>
        <div className="body">
          <div className="popin-wrapper">
          <img src={ fakepopin } className="contimage" />
          <StdButton identifier="btnassocier" elementclass="btnassocier" key="btnassocier" text="Associer" onClick={ ()=> void(0) } />
          </div>
        </div>
        <div className="footer">
          <StdButton identifier="btnannuler" elementclass="btnannuler" key="btnannuler" text="Annuler" onClick={ closePopin } />
          <StdButton identifier="btnvalider" elementclass="btnvalider" key="btnvalider" text="Valider" onClick={ closePopin } />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);



class Articles extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      popinOpen: false
    }
  }


  render() {

    const { popinOpen } = this.state;

    const closePopin = () => {
      this.setState({popinOpen:false});
    }
    const openPopin = () => {
      this.setState({popinOpen:true});
    }

    return(
      <div className="Articles">
        <div className="zoneBoutons">
        <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.STOCKS) }} />
            <StdButton identifier="btnnew" elementclass="btnnew" key="btnnew" text="Nouveau" onClick={ openPopin } />
          </div>
          <div className="titre">Articles</div>
          <div className="search"><img src={ fakesearch } /></div>
        </div>
        <div className="zoneliste">
          <div class="wrapper">
            <img src={ fakeliste } className="fakeliste" />
          </div>
        </div>
        <NewArticle open={popinOpen} closePopin={closePopin} />
      </div>
    );
  }
}

export default Articles;

Articles.propTypes = {
}