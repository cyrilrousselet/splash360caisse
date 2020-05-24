import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import { Modal, Fab, FormControl, Select, MenuItem, List, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableFooter } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import InfoIcon from '@material-ui/icons/Info';
import StdButton from '../common/StdButton';
import { devise, htmlentities } from './../../helpers/toolbox';
import LabelledField from '../common/LabelledField';
import NumberKeyboard from '../common/NumberKeyboard';
import Swal from 'sweetalert2';
import { useState } from 'react';

let strings = new LocalizedStrings(data);


class CountTRTool extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      liste: [],
      counttotal: 0
    }
    this.trHandler = this.trHandler.bind(this);
    this.decodeQRCode = this.decodeQRCode.bind(this);
    this.parseTR = this.parseTR.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
  }

  interval = 0;


  trHandler(event) {
    if (event.keyCode==13) {
      console.log(event.target.value);
      this.decodeQRCode(event.target.value);
      event.target.value = '';
    }
  }


  decodeQRCode(value) {

    let decode_table = {
      win: {
        'à': 0,
        '&': 1,
        'é': 2,
        '"': 3,
        "'" : 4,
        '(' : 5,
        '-' : 6,
        'è' : 7,
        '_' : 8,
        'ç' : 9
      },
      darwin: {
        'à': 0,
        '&': 1,
        'é': 2,
        '"': 3,
        "'" : 4,
        '(' : 5,
        '§' : 6,
        'è' : 7,
        '!' : 8,
        'ç' : 9
      }
    };
    if (!isNaN(parseInt(value))) {
      this.parseTR(value);
      return;
    }

    const platform = process.platform=='darwin' ? 'darwin' : 'win';

    let decoded = '';
    for (let caractere of value) {
      if (!decode_table[platform].hasOwnProperty(caractere)) {
        continue;
      }
      decoded += decode_table[platform][caractere];
    }
    if (!isNaN(parseInt(decoded))) {
      this.parseTR(decoded);
    }
    return false;
  }


  parseTR(value) {
    const { liste, counttotal } = this.state;
    let error = '';

    const __value = String(value);

    const __trValue = Number(__value.substr(11,5)) / 100;
    const __trValid = Number(__value.substr(16,2));

    const __now = new Date().getFullYear() - 2000;
    if (liste.find(tr=>tr.id==__value)) error = 'yet';
    if (__trValid<__now) error = 'deprecated';

    if (error==='') {
      this.setState({ 
        liste: [...liste, {id:__value, valeur:__trValue}], 
        counttotal: counttotal+__trValue  
      });
      if (this.refs.listeBody) this.refs.listeBody.scrollTop = this.refs.listeBody.scrollHeight;

    } else {
      if (error=='deprecated') {
        Swal.fire({
          type: 'warning',
          title: strings.modules.cloture.comptage.counttrtool.erreur[error].titre,
          html: strings.modules.cloture.comptage.counttrtool.erreur[error].texte,
          showCancelButton: false,
          focusCancel: false,
          focusConfirm: true
        });
      }
    }

    console.log('tr', __trValue, __trValid);

  }


  resetPopin() {

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
      <div className={ `CountTRTool${(open?' counttrtool-open':'')}` }>
        <div className="tete">
          <div className="titre">{ strings.modules.cloture.comptage.counttrtool.titre }</div>
        </div>
        <div className="corps">
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
        <div className="pied">
          <StdButton identifier="btnvalidcounttrtool" elementclass="btnvalidcounttrtool" key="btnvalidcounttrtool" disabled={ false } text={ strings.modules.cloture.comptage.counttrtool.bouton } onClick={ () => { onValidate(counttotal); this.resetPopin() } } />
        </div>
      </div>
    )
  }

}







const CountTool = ({open, onValidate, startSaisie, closeHandler, counttotal, monnaie}) => {

 return (
  <div className={ `CountTool${(open?' counttool-open':'')}` }>
    <div className="tete">
      <div className="titre">{ strings.modules.cloture.comptage.counttool.titre }</div>
    </div>
    <div className="corps">
      <div className="colonne">
        <div className={ `champ${(monnaie.eur2>0?' filled':'')}` } key="ctf2">
          <div className="nom">2 €</div>
          <div className="field" onClick={() => {startSaisie('eur2', true)}}>{ monnaie.eur2 }</div>
          <div className="subtotal">{ `${devise(monnaie.eur2*2)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.eur1>0?' filled':'')}` } key="ctf1">
          <div className="nom">1 €</div>
          <div className="field" onClick={() => {startSaisie('eur1', true)}}>{ monnaie.eur1 }</div>
          <div className="subtotal">{ `${devise(monnaie.eur1)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.cent50>0?' filled':'')}` } key="ctf05">
          <div className="nom">50 cents</div>
          <div className="field" onClick={() => {startSaisie('cent50', true)}}>{ monnaie.cent50 }</div>
          <div className="subtotal">{ `${devise(monnaie.cent50*.5)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.cent20>0?' filled':'')}` } key="ctf02">
          <div className="nom">20 cents</div>
          <div className="field" onClick={() => {startSaisie('cent20', true)}}>{ monnaie.cent20 }</div>
          <div className="subtotal">{ `${devise(monnaie.cent20*.2)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.cent10>0?' filled':'')}` } key="ctf01">
          <div className="nom">10 cents</div>
          <div className="field" onClick={() => {startSaisie('cent10', true)}}>{ monnaie.cent10 }</div>
          <div className="subtotal">{ `${devise(monnaie.cent10*.1)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.cent5>0?' filled':'')}` } key="ctf005">
          <div className="nom">5 cents</div>
          <div className="field" onClick={() => {startSaisie('cent5', true)}}>{ monnaie.cent5 }</div>
          <div className="subtotal">{ `${devise(monnaie.cent5*.05)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.cent2>0?' filled':'')}` } key="ctf002">
          <div className="nom">2 cents</div>
          <div className="field" onClick={() => {startSaisie('cent2', true)}}>{ monnaie.cent1 }</div>
          <div className="subtotal">{ `${devise(monnaie.cent2*.02)} €` }</div>
        </div>
        <div className={ `champ${(monnaie.cent1>0?' filled':'')}` } key="ctf001">
          <div className="nom">1 cent</div>
          <div className="field" onClick={() => {startSaisie('cent1', true)}}>{ monnaie.cent1 }</div>
          <div className="subtotal">{ `${devise(monnaie.cent1*.01)} €` }</div>
        </div>
      </div>
      <div className="colonne">
        <div className="champliste">
          <div className={ `champ${(monnaie.eur200>0?' filled':'')}` } key="ctf200">
            <div className="nom">200 €</div>
            <div className="field" onClick={() => {startSaisie('eur200', true)}}>{ monnaie.eur200 }</div>
            <div className="subtotal">{ `${devise(monnaie.eur200*200)} €` }</div>
          </div>
          <div className={ `champ${(monnaie.eur100>0?' filled':'')}` } key="ctf100">
            <div className="nom">100 €</div>
            <div className="field" onClick={() => {startSaisie('eur100', true)}}>{ monnaie.eur100 }</div>
            <div className="subtotal">{ `${devise(monnaie.eur100*100)} €` }</div>
          </div>
          <div className={ `champ${(monnaie.eur50>0?' filled':'')}` } key="ctf50">
            <div className="nom">50 €</div>
            <div className="field" onClick={() => {startSaisie('eur50', true)}}>{ monnaie.eur50 }</div>
            <div className="subtotal">{ `${devise(monnaie.eur50*50)} €` }</div>
          </div>
          <div className={ `champ${(monnaie.eur20>0?' filled':'')}` } key="ctf20">
            <div className="nom">20 €</div>
            <div className="field" onClick={() => {startSaisie('eur20', true)}}>{ monnaie.eur20 }</div>
            <div className="subtotal">{ `${devise(monnaie.eur20*20)} €` }</div>
          </div>
          <div className={ `champ${(monnaie.eur10>0?' filled':'')}` } key="ctf10">
            <div className="nom">10 €</div>
            <div className="field" onClick={() => {startSaisie('eur10', true)}}>{ monnaie.eur10 }</div>
            <div className="subtotal">{ `${devise(monnaie.eur10*10)} €` }</div>
          </div>
          <div className={ `champ${(monnaie.eur5>0?' filled':'')}` } key="ctf5">
            <div className="nom">5 €</div>
            <div className="field" onClick={() => {startSaisie('eur5', true)}}>{ monnaie.eur5 }</div>
            <div className="subtotal">{ `${devise(monnaie.eur5*5)} €` }</div>
          </div>
        </div>
        <div className="counttotal">
          <div className="ttl">{ strings.modules.cloture.comptage.counttool.total }</div>
          <div className="val">{ `${devise(counttotal)} €` }</div>
        </div>
      </div>
    </div>
    <div className="pied">
     <StdButton identifier="btnvalidcounttool" elementclass="btnvalidcounttool" key="btnvalidcounttool" disabled={ false } text={ strings.modules.cloture.comptage.counttool.bouton } onClick={ () => { onValidate(counttotal) } } />
    </div>
  </div>
)};


class Comptage extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      saisie_carte: '0',
      saisie_ticket: '0',
      saisie_cheque: '0',
      saisie_especes: '0',
      error_carte: false,
      error_ticket: false,
      error_cheque: false,
      error_especes: false,
      counttoolOpen: false,
      counttrtoolOpen: false,
      keyboardOpen: false,
      numbersOnly: false,
      fieldval: '',
      activeField: null,
      cent1:0,cent2:0,cent5:0,
      cent10:0,cent20:0,cent50:0,
      eur1:0,eur2:0,eur5:0,
      eur10:0,eur20:0,eur50:0,
      eur100:0,eur200:0
    }
    this.startSaisie = this.startSaisie.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
    this.getVentilation = this.getVentilation.bind(this);
    this.checkComptage = this.checkComptage.bind(this);
    this.checkComptageBeforeValidation = this.checkComptageBeforeValidation.bind(this);
    this.openCountTool = this.openCountTool.bind(this);
    this.closeCountTool = this.closeCountTool.bind(this);
    this.validateCountTool = this.validateCountTool.bind(this);
    this.openCountTRTool = this.openCountTRTool.bind(this);
    this.closeCountTRTool = this.closeCountTRTool.bind(this);
    this.validateCountTRTool = this.validateCountTRTool.bind(this);
  }



  startSaisie(field, numbersOnly=false) {
    console.log('startSaisie',field);
    this.setState({keyboardOpen: true, numbersOnly: numbersOnly, fieldval:this.state[field], activeField: field});
  }

  // action on buttons (fill in passphrase)
  keyboardButtonHandler(text) {
    const { fieldval } = this.state;
    if (text!=='c') {
      this.setState({fieldval: String(fieldval)+text});
    } else {
      this.setState({fieldval: String(fieldval).slice(0,-1)});
    }
  }

  closeKeyboard() {
    const { fieldval, activeField } = this.state;
    const newval = ['saisie_carte','saisie_ticket','saisie_cheque','saisie_especes'].indexOf(activeField)==-1 ? Number(fieldval) : fieldval.replace(',','.');
    this.setState({keyboardOpen: false, [activeField]:newval});
    setTimeout(()=> {
      this.checkComptage()
    },500);
  }


  checkComptage() {

    const { periode } = this.props;
    const { saisie_carte, saisie_ticket, saisie_cheque, saisie_especes } = this.state;
    const { especes, carte, ticket, cheque } = this.getVentilation();


    console.log(carte.toFixed(2), Number(saisie_carte).toFixed(2));
    console.log(ticket.toFixed(2), Number(saisie_ticket).toFixed(2));
    console.log(cheque.toFixed(2), Number(saisie_cheque).toFixed(2));
    console.log((especes+Number(periode.fdcaisse)).toFixed(2), Number(saisie_especes).toFixed(2));


    let errors = {};
    let valid = true;
    //check cb
    if (Number(saisie_carte).toFixed(2) != carte.toFixed(2)) {
      errors['error_carte'] = true;
      valid = false;
    } else {
      errors['error_carte'] = false;
    }

    //check tickets
    if (Number(saisie_ticket).toFixed(2) != ticket.toFixed(2)) {
      errors['error_ticket'] = true;
      valid = false;
    } else {
      errors['error_ticket'] = false;
    }

    //check chèques
    if (Number(saisie_cheque).toFixed(2) != cheque.toFixed(2)) {
      errors['error_cheque'] = true;
      valid = false;
    } else {
      errors['error_cheque'] = false;
    }

    //check espèces
    if (Number(saisie_especes).toFixed(2) != (especes+Number(periode.fdcaisse)).toFixed(2)) {
      errors['error_especes'] = true;
      valid = false;
    } else {
      errors['error_especes'] = false;
    }

    console.log('checkComptageBeforeValidation()',errors);

    this.setState(errors);
    return valid;
  }


  checkComptageBeforeValidation() {


    const { validComptage, closeComptage } = this.props;
    const { saisie_carte, saisie_ticket, saisie_cheque, saisie_especes } = this.state;

    const valid = this.checkComptage();

    if (valid) { 
      let comptage = {
        especes: Number(saisie_especes),
        carte: Number(saisie_carte),
        ticket: Number(saisie_ticket),
        cheque: Number(saisie_cheque)
      };
      const totalcomptage = Object.values(comptage).reduce((a,b)=>a+b,0);
      validComptage({...comptage, total:totalcomptage});
      closeComptage();
    } else {

      Swal.fire({
        title: strings.modules.cloture.alerte.different.titre,
        text: strings.modules.cloture.alerte.different.texte,
        focusConfirm: true,
        showCancelButton: false,
        customClass: 'differenterror',
        confirmButtonText: 'OK',
        buttonsStyling: false 
      }).then((result)=> {
      });
    }
  }

  getVentilation() {

    const { ventilation } = this.props.periode;

    let especes = 0,
        carte = 0,
        ticket = 0,
        cheque = 0;
    if (ventilation && ventilation.moyen) {
      const esp = ventilation.moyen.find(moy=>moy.moyen=='especes');
      if (esp) especes = esp.valeur;
      const cb = ventilation.moyen.find(moy=>moy.moyen=='carte');
      if (cb) carte = cb.valeur;
      const tr = ventilation.moyen.find(moy=>moy.moyen=='ticket');
      if (tr) ticket = tr.valeur;
      const chq = ventilation.moyen.find(moy=>moy.moyen=='cheque');
      if (chq) cheque = chq.valeur;
    }

    return {especes, carte, ticket, cheque};
  }

  openCountTool() {
    this.setState({counttoolOpen:true});
  }
  closeCountTool() {
    this.setState({counttoolOpen:false});
  }
  validateCountTool(valeur) {
    this.setState({saisie_especes: valeur, counttoolOpen:false});
  }
  openCountTRTool() {
    this.setState({counttrtoolOpen:true});
  }
  closeCountTRTool() {
    this.setState({counttrtoolOpen:false});
  }
  validateCountTRTool(valeur) {
    this.setState({saisie_ticket: valeur, counttrtoolOpen:false});
  }

  render() {

    const { open, closeComptage, openCommandesListe, caisses, operators, selection_operator, selection_caisse, periode, commandes, validComptage } = this.props;


    const { 
      saisie_carte, 
      saisie_ticket, 
      saisie_cheque, 
      saisie_especes, 
      keyboardOpen, 
      numbersOnly,
      fieldval, 
      activeField,
      error_carte,
      error_especes,
      error_cheque,
      error_ticket,
      counttoolOpen,
      counttrtoolOpen,
      cent1,cent2,cent5,
      cent10,cent20,cent50,
      eur1,eur2,eur5,
      eur10,eur20,eur50,
      eur100,eur200 } = this.state;


    let saisie_carte_fv = activeField=='saisie_carte' ? String(fieldval).replace(',','.') : saisie_carte;
    let saisie_ticket_fv = activeField=='saisie_ticket' ? String(fieldval).replace(',','.') : saisie_ticket;
    let saisie_cheque_fv = activeField=='saisie_cheque' ? String(fieldval).replace(',','.') : saisie_cheque;
    let saisie_especes_fv = activeField=='saisie_especes' ? String(fieldval).replace(',','.') : saisie_especes;


    const { especes, carte, ticket, cheque } = this.getVentilation();

    let mtcaisse = Number(periode.fdcaisse) + especes - Number(periode.depenses) - Number(periode.remboursements);

    const monnaie = {
      cent1: activeField=='cent1' ? Number(fieldval) : cent1,
      cent2: activeField=='cent2' ? Number(fieldval) : cent2,
      cent5: activeField=='cent5' ? Number(fieldval) : cent5,
      cent10: activeField=='cent10' ? Number(fieldval) : cent10,
      cent20: activeField=='cent20' ? Number(fieldval) : cent20,
      cent50: activeField=='cent50' ? Number(fieldval) : cent50,
      eur1: activeField=='eur1' ? Number(fieldval) : eur1,
      eur2: activeField=='eur2' ? Number(fieldval) : eur2,
      eur5: activeField=='eur5' ? Number(fieldval) : eur5,
      eur10: activeField=='eur10' ? Number(fieldval) : eur10,
      eur20: activeField=='eur20' ? Number(fieldval) : eur20,
      eur50: activeField=='eur50' ? Number(fieldval) : eur50,
      eur100: activeField=='eur100' ? Number(fieldval) : eur100,
      eur200: activeField=='eur200' ? Number(fieldval) : eur200
    }
    const counttotal = (monnaie.cent1*.01) + 
                       (monnaie.cent2*.02) + 
                       (monnaie.cent5*.05) + 
                       (monnaie.cent10*.1) + 
                       (monnaie.cent20*.2) + 
                       (monnaie.cent50*.5) + 
                       (monnaie.eur1) + 
                       (monnaie.eur2*2) + 
                       (monnaie.eur5*5) + 
                       (monnaie.eur10*10) + 
                       (monnaie.eur20*20) + 
                       (monnaie.eur50*50) + 
                       (monnaie.eur100*100) + 
                       (monnaie.eur200*200); 


    return(
      <Modal open={open}>
      <div className="ClotureComptage">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.cloture.comptage.titre }</div>
          </div>
          <div className="body">
            {/* <div className="selecteur">
               <div className="label">{ strings.modules.cloture.selection.caisse }</div>
              <FormControl variant="outlined" className="selecteur-cnt selecteur-caisse">
                <Select value={selection_caisse} onChange={this.selectCaisse} className="selecteur-sel selecteur-caisse-select">
                  {Object.values(caisses).map(cash => (
                    <MenuItem key={ `cashitm${cash.id}`} value={cash.id}>{cash.nom}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <div className="label">{ strings.modules.cloture.selection.vendeur }</div>
              <FormControl variant="outlined" className="selecteur-cnt selecteur-vendeur">
                <Select value={selection_operator} onChange={this.selectVendeur} className="selecteur-sel selecteur-vendeur-select">
                  {Object.values(operators).map(ope => (
                    <MenuItem key={ `opeitm${ope.id}`} value={ope.id}>{ope.nom}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div> */}
            <div className="bloc bloc-especes">
              <div className="bloctitre">{ htmlentities(strings.modules.cloture.comptage.especes.titre) }</div>
              <div className="cptitems-liste">
                <div className="cptitem cptitem-fdc">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_fdcaisse }</div>
                  <div className="valeur">{ `${devise(periode.fdcaisse)} €` }</div>
                </div>
                <div className="cptitem cptitem-esp">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_especes }</div>
                  <div className="valeur">{ `${devise(especes)} €` }<Fab className="btn" size="small" onClick={ openCommandesListe }>
                    <InfoIcon />
                  </Fab></div>
                </div>
                <div className="cptitem cptitem-dep">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_depenses }</div>
                  <div className="valeur">{ `${devise(periode.depenses)} €` }</div>
                </div>
                <div className="cptitem cptitem-remb">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_rembourse }</div>
                  <div className="valeur">{ `${devise(periode.remboursements)} €` }</div>
                </div>
                <div className="cptitem cptitem-mnt">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_montant }</div>
                  <div className="valeur">{ `${devise(mtcaisse)} €` }</div>
                </div>
              </div>
            </div>
            <div className="bloc bloc-toutes">
              <div className="bloctitre">{ htmlentities(strings.modules.cloture.comptage.toutes.titre) }</div>
              <div className="cptitems-liste">
                <div className="cptitem cptitem-cb">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.carte }</div>
                  <div className="valeur">{ `${devise(carte)} €` }
                    <Fab className="btn" size="small" onClick={ openCommandesListe }>
                      <InfoIcon />
                    </Fab>
                  </div>
                </div>
                <div className="cptitem cptitem-tr">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.ticket }</div>
                  <div className="valeur">{ `${devise(ticket)} €` }
                    <Fab className="btn" size="small" onClick={ openCommandesListe }>
                      <InfoIcon />
                    </Fab>
                  </div>
                </div>
                <div className="cptitem cptitem-chq">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.cheque }</div>
                  <div className="valeur">{ `${devise(cheque)} €` }
                    <Fab className="btn" size="small" onClick={ openCommandesListe }>
                      <InfoIcon />
                    </Fab>
                  </div>
                </div>
                <div className="cptitem cptitem-total">
                  <div className="label">{ strings.modules.cloture.comptage.toutes.total }</div>
                  <div className="valeur">{ `${devise(carte+ticket+cheque)} €` }</div>
                </div>
                <div className="cptitem cptitem-esp">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.especes }</div>
                  <div className="valeur">{ `${devise(mtcaisse)} €` }</div>
                </div>
                <div className="cptitem cptitem-rec">
                  <div className="label">{ strings.modules.cloture.comptage.toutes.total_recu }</div>
                  <div className="valeur">{ `${devise(carte+ticket+cheque+mtcaisse)} €` }</div>
                </div>
              </div>
            </div>
            <div className="bloc bloc-saisie">
              <div className="bloccont">
                <div className="bloctitre">{ htmlentities(strings.modules.cloture.comptage.saisie.titre) }</div>
                <div className="cptitems-liste">
                  <div className={ `cptitem cptitem-cb${(error_carte?' cptitem-error':'')}` }>
                    <div className="label">{ strings.modules.cloture.comptage.moyens.carte }</div>
                    <div className="valeur" onClick={()=>{ this.startSaisie('saisie_carte') }}>{ `${(saisie_carte_fv ? devise(saisie_carte_fv)+' €' : '')}` }</div>
                  </div>
                  <div className={ `cptitem cptitem-tr${(error_ticket?' cptitem-error':'')}` }>
                    <div className="label">{ strings.modules.cloture.comptage.moyens.ticket }</div>
                    <div className="valeur" onClick={() => { this.startSaisie('saisie_ticket') }}>{ `${(saisie_ticket_fv ? devise(saisie_ticket_fv)+' €' : '')}` }</div>
                  </div>
                  <div className={ `cptitem cptitem-chq${(error_cheque?' cptitem-error':'')}` }>
                    <div className="label">{ strings.modules.cloture.comptage.moyens.cheque }</div>
                    <div className="valeur" onClick={() => { this.startSaisie('saisie_cheque') }}>{ `${(saisie_cheque_fv ? devise(saisie_cheque_fv)+' €' : '')}` }</div>
                  </div>
                  <div className={ `cptitem cptitem-esp${(error_especes?' cptitem-error':'')}` }>
                    <div className="label">{ strings.modules.cloture.comptage.moyens.especes }</div>
                    <div className="valeur" onClick={() => { this.startSaisie('saisie_especes') }}>{ `${(saisie_especes_fv ? devise(saisie_especes_fv)+' €' : '')}` }</div>
                  </div>
                </div>
                  <StdButton identifier="btncomptcaisse" elementclass="btncomptcaisse" key="btncomptcaisse" text={ strings.modules.cloture.comptage.actions.outilcomptage } onClick={ this.openCountTool } />
                  <StdButton identifier="btncompttr" elementclass="btncompttr" key="btncompttr" text={ strings.modules.cloture.comptage.actions.outilcomptagetr } onClick={ this.openCountTRTool } />
              </div>
              <StdButton identifier="btncomptverif" elementclass="btncomptverif" key="btncomptverif" disabled={saisie_carte=='' || saisie_cheque=='' || saisie_ticket=='' || saisie_especes==''} text={ strings.modules.cloture.comptage.actions.validation } onClick={ () => { this.checkComptageBeforeValidation() } } />          
            </div>

          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeComptage }>
          <CloseIcon />
        </Fab>
        <CountTool open={counttoolOpen} monnaie={monnaie} startSaisie={this.startSaisie} counttotal={counttotal} onValidate={ this.validateCountTool } closeHandler={this.closeCountTool} />
        <CountTRTool open={counttrtoolOpen} onValidate={ this.validateCountTRTool } closeHandler={this.closeCountTRTool} />
        <NumberKeyboard open={keyboardOpen} numbersOnly={numbersOnly} buttonHandler={this.keyboardButtonHandler} inner={true} closeHandler={this.closeKeyboard} />
      </div>
    </Modal>
    );

  }

}

export default Comptage;