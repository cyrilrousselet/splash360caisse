import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import { devise } from './../../helpers/toolbox';
import NumberKeyboard from '../common/NumberKeyboard';
import Swal from 'sweetalert2';

// import Logger from "../../helpers/Logger";
import logger from "../../helpers/Logger";

// const logger = new Logger();

let strings = new LocalizedStrings(data);







class CountTool extends React.Component
{

  initialState = {
    fieldvalue: "",
    activeField: null,
    cent1:0,cent2:0,cent5:0,
    cent10:0,cent20:0,cent50:0,
    eur1:0,eur2:0,eur5:0,
    eur10:0,eur20:0,eur50:0,
    eur100:0,eur200:0
  }


  constructor(props) {
    super(props);
    this.state = this.initialState;

    this.startSaisie = this.startSaisie.bind(this);
    this.validSaisie = this.validSaisie.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
  }


  startSaisie(field) {
    logger.info("startSaisie", field, this.state[field]);

    const { fieldvalue, activeField } = this.state;

    let __st = {
      fieldvalue: this.state[field],
      activeField: field
    };

    if (activeField) __st[activeField] = parseInt(fieldvalue).toString();

    this.setState(__st);

  }
  validSaisie() {
    
    const { fieldvalue, activeField } = this.state;
    logger.info("validSaisie", activeField, fieldvalue);

    this.setState({
      fieldvalue: 0,
      activeField: null,
      [activeField]: parseInt(fieldvalue).toString()
    });

  }


  // action on buttons (fill in passphrase)
  keyboardButtonHandler(text) {
    const { fieldvalue } = this.state;
    let newvalue;
    if (fieldvalue===null || isNaN(String(fieldvalue).replace(",", "."))) {
      newvalue = (text !== "c") ? text : 0;
    } else {
      newvalue =
      (text !== "c")
      ? String(fieldvalue) + text
      : String(fieldvalue).slice(0, -1)
      ;
    }
    logger.info('keybboard', newvalue);
    this.setState({ fieldvalue: newvalue });

  }


  closeKeyboard() {
    const { fieldvalue, activeField } = this.state;
    const newval = Number(fieldvalue)
    this.setState({ keyboardOpen: false, [activeField]: newval, activeField: null });
   // this.validComptage(activeField, newval);
  }

  resetPopin() {
    this.setState(this.initialState);
  }

  onValidate(counttotal) {
    const {onValidate, fdcaisse} = this.props;
    
    if (counttotal<fdcaisse) {
      Swal.fire({
        type: 'warning',
        title: strings.modules.cloture.comptage.counttool.alerte.titre,
        text: strings.modules.cloture.comptage.counttool.alerte.texte,
        showCancelButton: false,
        focusCancel: false,
        focusConfirm: true
      }).then((result) => {
        if (result.isConfirmed) {
          onValidate(counttotal-fdcaisse);
        }
      });
    }
    else {
      onValidate(counttotal-fdcaisse);
    }
    this.resetPopin();

  }
  
  render() {

    const {open, closeHandler, fdcaisse, especes, symbolemonnaie} = this.props;

    
    const { 
      fieldvalue, 
      activeField,
      cent1,cent2,cent5,
      cent10,cent20,cent50,
      eur1,eur2,eur5,
      eur10,eur20,eur50,
      eur100,eur200 } = this.state;

    const mtcaisse = fdcaisse + especes;

    const monnaie = {
      cent1: activeField==='cent1' ? Number(fieldvalue) : cent1,
      cent2: activeField==='cent2' ? Number(fieldvalue) : cent2,
      cent5: activeField==='cent5' ? Number(fieldvalue) : cent5,
      cent10: activeField==='cent10' ? Number(fieldvalue) : cent10,
      cent20: activeField==='cent20' ? Number(fieldvalue) : cent20,
      cent50: activeField==='cent50' ? Number(fieldvalue) : cent50,
      eur1: activeField==='eur1' ? Number(fieldvalue) : eur1,
      eur2: activeField==='eur2' ? Number(fieldvalue) : eur2,
      eur5: activeField==='eur5' ? Number(fieldvalue) : eur5,
      eur10: activeField==='eur10' ? Number(fieldvalue) : eur10,
      eur20: activeField==='eur20' ? Number(fieldvalue) : eur20,
      eur50: activeField==='eur50' ? Number(fieldvalue) : eur50,
      eur100: activeField==='eur100' ? Number(fieldvalue) : eur100,
      eur200: activeField==='eur200' ? Number(fieldvalue) : eur200
    }
    const counttotal = (monnaie.cent1*.01) + 
                       (monnaie.cent2*.02) + 
                       (monnaie.cent5*.05) + 
                       (monnaie.cent10*.1) + 
                       (monnaie.cent20*.2) + 
                       (monnaie.cent50*.5) + 
                       parseInt(monnaie.eur1) + 
                       (monnaie.eur2*2) + 
                       (monnaie.eur5*5) + 
                       (monnaie.eur10*10) + 
                       (monnaie.eur20*20) + 
                       (monnaie.eur50*50) + 
                       (monnaie.eur100*100) + 
                       (monnaie.eur200*200); 

    const startSaisie = this.startSaisie;

    return (
      <Modal open={open}>
        <div className="CountTool">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.cloture.comptage.counttool.titre }</div>
            </div>
            <div className="body">
              <div className="colonne">
                <div className="champliste pieces-blanches">
                  <div className={ `champ${(monnaie.eur2>0?' filled':'')}` } key="ctf2">
                    <div className="nom">{`2 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur2")? 'active':''}`} onClick={() => {startSaisie('eur2', true)}}>{ monnaie.eur2 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur2*2)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.eur1>0?' filled':'')}` } key="ctf1">
                    <div className="nom">{`1 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur1")? 'active':''}`} onClick={() => {startSaisie('eur1', true)}}>{ monnaie.eur1 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur1)} ${symbolemonnaie}` }</div>
                  </div>
                </div>
                <div className="champliste pieces-jaunes">
                  <div className={ `champ${(monnaie.cent50>0?' filled':'')}` } key="ctf05">
                    <div className="nom">50 cents</div>
                    <div className={ `field ${(activeField==="cent50")? 'active':''}`} onClick={() => {startSaisie('cent50', true)}}>{ monnaie.cent50 }</div>
                    <div className="subtotal">{ `${devise(monnaie.cent50*.5)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.cent20>0?' filled':'')}` } key="ctf02">
                    <div className="nom">20 cents</div>
                    <div className={ `field ${(activeField==="cent20")? 'active':''}`} onClick={() => {startSaisie('cent20', true)}}>{ monnaie.cent20 }</div>
                    <div className="subtotal">{ `${devise(monnaie.cent20*.2)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.cent10>0?' filled':'')}` } key="ctf01">
                    <div className="nom">10 cents</div>
                    <div className={ `field ${(activeField==="cent10")? 'active':''}`} onClick={() => {startSaisie('cent10', true)}}>{ monnaie.cent10 }</div>
                    <div className="subtotal">{ `${devise(monnaie.cent10*.1)} ${symbolemonnaie}` }</div>
                  </div>
                </div>
                <div className="champliste pieces-rouges">
                  <div className={ `champ${(monnaie.cent5>0?' filled':'')}` } key="ctf005">
                    <div className="nom">5 cents</div>
                    <div className={ `field ${(activeField==="cent5")? 'active':''}`} onClick={() => {startSaisie('cent5', true)}}>{ monnaie.cent5 }</div>
                    <div className="subtotal">{ `${devise(monnaie.cent5*.05)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.cent2>0?' filled':'')}` } key="ctf002">
                    <div className="nom">2 cents</div>
                    <div className={ `field ${(activeField==="cent2")? 'active':''}`} onClick={() => {startSaisie('cent2', true)}}>{ monnaie.cent2 }</div>
                    <div className="subtotal">{ `${devise(monnaie.cent2*.02)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.cent1>0?' filled':'')}` } key="ctf001">
                    <div className="nom">1 cent</div>
                    <div className={ `field ${(activeField==="cent1")? 'active':''}`} onClick={() => {startSaisie('cent1', true)}}>{ monnaie.cent1 }</div>
                    <div className="subtotal">{ `${devise(monnaie.cent1*.01)} ${symbolemonnaie}` }</div>
                  </div>
                </div>

                <div className="champliste billets">
                  <div className={ `champ${(monnaie.eur200>0?' filled':'')}` } key="ctf200">
                    <div className="nom">{`200 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur200")? 'active':''}`} onClick={() => {startSaisie('eur200', true)}}>{ monnaie.eur200 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur200*200)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.eur100>0?' filled':'')}` } key="ctf100">
                    <div className="nom">{`100 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur100")? 'active':''}`} onClick={() => {startSaisie('eur100', true)}}>{ monnaie.eur100 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur100*100)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.eur50>0?' filled':'')}` } key="ctf50">
                    <div className="nom">{`50 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur50")? 'active':''}`} onClick={() => {startSaisie('eur50', true)}}>{ monnaie.eur50 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur50*50)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.eur20>0?' filled':'')}` } key="ctf20">
                    <div className="nom">{`20 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur20")? 'active':''}`} onClick={() => {startSaisie('eur20', true)}}>{ monnaie.eur20 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur20*20)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.eur10>0?' filled':'')}` } key="ctf10">
                    <div className="nom">{`10 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur10")? 'active':''}`} onClick={() => {startSaisie('eur10', true)}}>{ monnaie.eur10 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur10*10)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className={ `champ${(monnaie.eur5>0?' filled':'')}` } key="ctf5">
                    <div className="nom">{`5 ${symbolemonnaie}`}</div>
                    <div className={ `field ${(activeField==="eur5")? 'active':''}`} onClick={() => {startSaisie('eur5', true)}}>{ monnaie.eur5 }</div>
                    <div className="subtotal">{ `${devise(monnaie.eur5*5)} ${symbolemonnaie}` }</div>
                  </div>
                </div>
              </div>
              <div className="colonne">
                <NumberKeyboard
                  className="CountToolKeyboard"
                  open={true}
                  disabled={!activeField}
                  numbersOnly={true}
                  extraButton={ {text:'✔︎', handler: this.validSaisie, position:9, replace:true} }
                  buttonHandler={this.keyboardButtonHandler}
                  inner={true}
                  closeHandler={this.closeKeyboard}
                />
                <div>
                  <div className="counttheorique" key={'total0'}>
                    <div className="ttl">{ strings.modules.cloture.comptage.counttool.theorique }</div>
                    <div className="val">{ `${devise(mtcaisse)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className="counttotal" key={'total1'}>
                    <div className="ttl">{ strings.modules.cloture.comptage.counttool.total }</div>
                    <div className="val">{ `${devise(counttotal)} ${symbolemonnaie}` }</div>
                  </div>
                  <div className="countfdcaisse" key={'total2'}>
                    <div className="ttl">{ strings.modules.cloture.comptage.counttool.fdcaisse }</div>
                    <div className="val">{ `${devise(fdcaisse)} ${symbolemonnaie}` }</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer">
              <StdButton identifier="btnvalidcounttool" elementclass="btnvalidcounttool" key="btnvalidcounttool" disabled={ false } text={ strings.modules.cloture.comptage.counttool.bouton } onClick={ () => { this.onValidate(counttotal) } } />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
            <CloseIcon />
          </Fab>
        </div>
        
      </Modal>
    );
  }

};

export default CountTool;