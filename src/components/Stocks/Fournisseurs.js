import React from 'react';

import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';


import fakesearch from '../../assets/images/fake_searchfield.svg';
import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_fournisseurs.svg';
import fakepopin from '../../assets/images/fake_stocks_fournisseur_popin.svg';



const NewFournisseur = ({open, closePopin}) => (

  <Modal open={open}>
    <div className="NewFournisseur">
      <div className="Modal-container">
        <div className="header">
          <div className="title">Nouveau Fournisseur</div>
        </div>
        <div className="body">
          <img src={ fakepopin } className="contimage" alt="" />
          <StdButton identifier="btnvalider" elementclass="btnvalider" key="btnvalider" text="Valider" onClick={ closePopin } />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);




class Fournisseurs extends React.Component {


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
      <div className="Fournisseurs">
        <div className="zoneBoutons">
          <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.STOCKS) }} />
            <StdButton identifier="btnnew" elementclass="btnnew" key="btnnew" text="Nouveau" onClick={ openPopin } />
            <StdButton identifier="btnetat" elementclass="btnetat" key="btnetat" text="État" onClick={ () => { history.push(paths.STOCKS_ETATFOURNISSEURS) }} />
          </div>
          <div className="titre">Fournisseurs</div>
          <div className="search"><img src={ fakesearch } alt="" /></div>
        </div>
        <div className="zoneliste">
          <div class="wrapper">
            <img src={ fakeliste } className="fakeliste" alt="" />
          </div>
        </div>
        <NewFournisseur open={popinOpen} closePopin={closePopin} />
      </div>
    );
  }
}

export default Fournisseurs;

Fournisseurs.propTypes = {
}