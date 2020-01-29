import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';

import contimage from '../../assets/images/fake_contenu_cloture.svg';
import comptageimage from '../../assets/images/fake_contenu_cloturecomptage.svg';
import comptcaisseimage from '../../assets/images/fake_contenu_cloturecomptcaisse.svg';
import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';

let strings = new LocalizedStrings(data);


const ClotureComptage = ({open, closeComptage, openComptcaisse}) => (

    <Modal open={open}>
      <div className="ClotureComptage">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.encaissement.reglement.titre }</div>
          </div>
          <div className="body">
            <img src={ comptageimage } className="contimage" />
            <div className="btncomptcaisse" onClick={ openComptcaisse}></div>
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeComptage }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
);

const ClotureComptcaisse = ({open, closeComptcaisse}) => (

  <Modal open={open}>
    <div className="ClotureComptcaisse">
      <div className="Modal-container">
        <div className="header">
          <div className="title">{ strings.modules.encaissement.reglement.titre }</div>
        </div>
        <div className="body">
          <img src={ comptcaisseimage } className="contimage" />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closeComptcaisse }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);


class Cloture extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      comptageOpen:false,
      comptcaisseOpen:false
    }
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
    this.openComptage = this.openComptage.bind(this);
    this.closeComptage = this.closeComptage.bind(this);
    this.openComptcaisse = this.openComptcaisse.bind(this);
    this.closeComptcaisse = this.closeComptcaisse.bind(this);
  }

 componentDidMount() {
  // const { getAllActive } = this.props;
  // getAllActive();
 }

 shouldComponentRender() {
 //  const {loading} = this.props;
 //  if(loading===false) return false;
   return true;
 }

 openComptage() {
  this.setState({comptageOpen:true, comptcaisseOpen:false});
}
 closeComptage() {
   this.setState({comptageOpen:false});
 }

 openComptcaisse() {
  this.setState({comptageOpen:false, comptcaisseOpen:true});
}
closeComptcaisse() {
   this.setState({comptcaisseOpen:false, comptageOpen:true});
 }

 render() {

 // const { catalogue, error, loading } = this.props;

 const { comptageOpen, comptcaisseOpen} = this.state;

  if(!this.shouldComponentRender()) {
    return <LoadingSpinner />
  }

  return (
    <div className="Cloture container">
      <TopZone />
      <div className="MainZone">
        <img src={ contimage } className="contimage" />
        <div className="btncomptage" onClick={this.openComptage}></div>
      </div>
      <ClotureComptage open={comptageOpen} closeComptage={this.closeComptage} openComptcaisse={this.openComptcaisse} />
      <ClotureComptcaisse open={comptcaisseOpen} closeComptcaisse={this.closeComptcaisse} />
    </div>
    );
  }
}
export default Cloture;

Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
}