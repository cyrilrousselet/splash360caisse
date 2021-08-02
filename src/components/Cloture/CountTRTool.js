import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import { devise } from './../../helpers/toolbox';
import Swal from 'sweetalert2';
import { decodetable } from '../../constants/decodetable';
import logger from '../../helpers/Logger';

let strings = new LocalizedStrings(data);


class CountTRTool extends React.Component {

  initialState = {
    liste: [],
    counttotal: 0
  }

  constructor(props) {
    super(props);
    this.state = this.initialState;

    this.trHandler = this.trHandler.bind(this);
    this.decodeQRCode = this.decodeQRCode.bind(this);
    this.parseTR = this.parseTR.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
  }

  interval = 0;


  trHandler(event) {
    if (event.keyCode===13) {
      logger.info(event.target.value);
      this.decodeQRCode(event.target.value);
      event.target.value = '';
    }
  }


  decodeQRCode(value) {

    // let decode_table = {
    //   win: {
    //     'à': 0,
    //     '&': 1,
    //     'é': 2,
    //     '"': 3,
    //     "'" : 4,
    //     '(' : 5,
    //     '-' : 6,
    //     'è' : 7,
    //     '_' : 8,
    //     'ç' : 9
    //   },
    //   darwin: {
    //     'à': 0,
    //     '&': 1,
    //     'é': 2,
    //     '"': 3,
    //     "'" : 4,
    //     '(' : 5,
    //     '§' : 6,
    //     'è' : 7,
    //     '!' : 8,
    //     'ç' : 9
    //   }
    // };
    // if (!isNaN(parseInt(value))) {
    //   this.parseTR(value);
    //   return;
    // }

    const platform = process.platform==='darwin' ? 'darwin' : 'win';

    let decoded = '';
    for (let caractere of value) {
      if (!decodetable[platform].hasOwnProperty(caractere)) {
        continue;
      }
      decoded += decodetable[platform][caractere];
    }
    // if (!isNaN(parseInt(decoded))) {
    //   this.parseTR(decoded);
    // }
    if (String(decoded).length>0) {
      this.parseTR(decoded);
    }
    return false;
  }


  parseTR(value) {
    const { liste, counttotal } = this.state;
    let error = '';

    logger.info('parseTR()', value);

    const __value = String(value);
    let __trValid, __trValue;

    if (__value.length!==24) {
      error = "format";
    }
    else {

      __trValue = Number(__value.substr(11,5)) / 100;
      __trValid = Number(__value.substr(16,2));
      
      if (liste.find(tr=>tr.id===__value)) error = 'yet';
    }
      
 // on supprime le test de valididé (certains TR n'ont pas de date limite)
 //   if (__trValid<__now) error = 'deprecated';

    if (error==='') {
      this.setState({ 
        liste: [...liste, {id:__value, valeur:__trValue}], 
        counttotal: counttotal+__trValue  
      });
      if (this.refs.listeBody) this.refs.listeBody.scrollTop = this.refs.listeBody.scrollHeight;

    } else {
      // if (error==='deprecated') {
        Swal.fire({
          type: 'warning',
          title: strings.modules.cloture.comptage.counttrtool.erreur[error].titre,
          html: strings.modules.cloture.comptage.counttrtool.erreur[error].texte,
          showCancelButton: false,
          focusCancel: false,
          focusConfirm: true
        });
      // }
    }

    logger.info('tr', __trValue, __trValid);

  }


  resetPopin() {
    this.setState(this.initialState);
  }


  render() {
    const {open, onValidate, closeHandler} = this.props;

    const { liste, counttotal } = this.state;


    // gestion du focus sur le champ de recherche (scan QR code)
    clearInterval(this.interval);
    
    const self = this;
    if (open) {      
      this.interval = setInterval(() => {
        if (self.refs.trInput) self.refs.trInput.focus();
       },500);
    } else {
      clearInterval(this.interval);
      this.interval = 0;
    }

 
    return (
      <Modal open={open}>
        <div className="CountTRTool">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.cloture.comptage.counttrtool.titre }</div>
            </div>
            <div className="body">
              <input className="tr-input" ref="trInput" onKeyUp={this.trHandler} /> 
              <div className="liste">
                <div className="liste-head">
                  <div className="head-id">{ strings.modules.cloture.comptage.counttrtool.id }</div>
                  <div className="prix">{ strings.modules.cloture.comptage.counttrtool.montant }</div>
                </div>
                <div className="liste-body" ref="listeBody">
                  <div className="liste-wrapper">
                {liste && liste.map(tr => (
                  <div className="liste-row">
                    <div className="body-id">{ tr.id }</div>
                    <div className="prix">{ `${devise(tr.valeur)} €` }</div>
                  </div>
                  ))}
                  </div>
                </div>
                <div className="liste-footer">
                    <div className="footer-id">{ strings.modules.cloture.comptage.counttrtool.total }</div>
                    <div className="prix">{ `${devise(counttotal)} €` }</div>
                </div>
              </div>
            </div>
            <div className="footer">
              <StdButton identifier="btnvalidcounttrtool" elementclass="btnvalidcounttrtool" key="btnvalidcounttrtool" disabled={ false } text={ strings.modules.cloture.comptage.counttrtool.bouton } onClick={ () => { onValidate(counttotal); this.resetPopin() } } />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ () => { closeHandler(); this.resetPopin() } }>
            <CloseIcon />
          </Fab>
        </div>
        
      </Modal>
    )
  }

}

export default CountTRTool;