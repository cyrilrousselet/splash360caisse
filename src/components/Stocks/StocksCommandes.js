import React from 'react';

import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import fakesearch from '../../assets/images/fake_searchfield.svg';
import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_etatfournisseurs.svg';
import fakepopin from '../../assets/images/fake_stocks_commande_popin.svg';


const NewCommande = ({open, closePopin}) => (

  <Modal open={open}>
    <div className="NewCommande">
      <div className="Modal-container">
        <div className="header">
          <div className="title">Nouvelle Commande</div>
        </div>
        <div className="body">
          <div className="popin-wrapper">
          <img src={ fakepopin } className="contimage" alt="" />
          <StdButton identifier="btnajouter" elementclass="btnajouter" key="btnajouter" text="Ajouter" onClick={ ()=> void(0) } />
          </div>
        </div>
        <div className="footer">
          <StdButton identifier="btnannuler" elementclass="btnannuler" key="btnannuler" text="Annuler" onClick={ closePopin } />
          <StdButton identifier="btnvalider" elementclass="btnvalider" key="btnvalider" text="Envoyer" onClick={ closePopin } />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);


class StocksCommandes extends React.Component {

  
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
      <div className="StocksCommandes">
        <div className="zoneBoutons">
        <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.STOCKS) }} />
            <StdButton identifier="btnnew" elementclass="btnnew" key="btnnew" text="Nouvelle" onClick={ openPopin } />
          </div>
          <div className="titre">Commandes Stock</div>
          <div className="search"><img src={ fakesearch } alt="" /></div>
        </div>
        <div className="zoneliste">
          <div class="wrapper">
            <img src={ fakeliste } className="fakeliste" alt="" />
          </div>
        </div>
        <NewCommande open={popinOpen} closePopin={closePopin} />
      </div>
    );
  }
}

export default StocksCommandes;

StocksCommandes.propTypes = {
}