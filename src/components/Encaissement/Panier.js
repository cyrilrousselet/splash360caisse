import React from 'react';
import PropTypes from 'prop-types';

import StdButton from '../common/StdButton';

import { List, ListItem, Fab, Modal, TextField, ListItemText, ListItemIcon, ListItemSecondaryAction, Badge } from '@material-ui/core';
import Swal from 'sweetalert2';
import _, { last } from 'lodash';
import AlarmIcon from '@material-ui/icons/Alarm';

import PlusIcon from '../common/icon/PlusIcon';
import DiscountIcon from '../common/icon/DiscountIcon';
import MinusIcon from '../common/icon/MinusIcon';
import CommentIcon from '../common/icon/CommentIcon';
import CrossIcon from '../common/icon/CrossIcon';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import CloseIcon from '../common/icon/CloseIcon';
import DeleteIcon from '@material-ui/icons/Delete';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import FicheClientCont from '../../containers/FicheClientCont';
import Clavier from '../common/Clavier';
import {devise, dateBounds} from '../../helpers/toolbox';
import TableIcon from '../common/icon/TableIcon';
import BellIcon from '../common/icon/BellIcon';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import CommentRemoveIcon from '../common/icon/CommentRemoveIcon';
import NumberKeyboard from '../common/NumberKeyboard';

import history from '../../helpers/history';
import paths from './../../constants/routes.json';

import { decodetable } from '../../constants/decodetable';
import MouvementPopin from '../Cloture/MouvementPopin';
import EmployeIcon from '../common/icon/EmployeIcon';
import LoginCont from '../../containers/LoginCont';
// import frLocale from "date-fns/locale/fr";
// import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
// import DateFnsUtils from '@date-io/date-fns';
// import { formatRFC3339 } from 'date-fns';
// import { add, isBefore, format } from 'date-fns';
import { add, sub, differenceInHours, format, isBefore, set } from 'date-fns';
import GiftIcon from '../common/icon/GiftIcon';


let strings = new LocalizedStrings(data);
// const logger = new Logger();


// class LocalizedDayUtils extends DateFnsUtils {
//   getDatePickerHeaderText(date) {
//     return this.format(date, "d MMM yyyy", { locale: frLocale });
//   }
// }

// class TablesModal extends React.Component {


//   constructor(props) {
//     super(props);
//     this.state = {
//       phase: 'salles',
//       salleId: null,
//       tableId: null
//     }
//   }

//   render() {

//     const {salles} = this.props;

//     return (
// <div className="TablesModal"></div>
//     );
//   }

// }



const BeneficiaireModal = ({open, getBeneficiaire, closePopin}) => (

  <Modal open={open}>
    <div className="BeneficiaireModal">
      <div className="Modal-container">
        <div className="header">
          <div className="title">{ strings.modules.encaissement.staffmeal.titre }</div>
        </div>
        <div className="body">
          <div className="soustitre">{ strings.modules.encaissement.staffmeal.label }</div>
          <LoginCont inPopin={true} popinAction={ (passphrase) => getBeneficiaire(passphrase) } />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);



const CmdModeModal = ({open, setMode, closePopin}) => (

  <Modal open={open}>
    <div className="CmdModeModal">
      <div className="Modal-container">
        <div className="header">
          <div className="title">{ strings.modules.encaissement.popinmode.titre }</div>
        </div>
        <div className="body">
          <div className="modes">
            <StdButton identifier='surplace' elementclass={ `mode mode-surplace` } icon={ false } text={ strings.modules.encaissement.panier.mode.surplace } onClick={(value) => { setMode(value) }} />
            <StdButton identifier='emporter' elementclass={ `mode mode-emporter` } icon={ false } text={ strings.modules.encaissement.panier.mode.emporter } onClick={(value) => { setMode(value) }} />
            <StdButton identifier='livraison' elementclass={ `mode mode-livraison` } icon={ false } text={ strings.modules.encaissement.panier.mode.livraison } onClick={(value) => { setMode(value) }} />
          </div>
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);


class ScheduleModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      schedule: null,
      end: dateBounds(new Date(), props.heure_fin).fin
    };

    this.deleteSchedule = this.deleteSchedule.bind(this);
    this.saveSchedule = this.saveSchedule.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.checkHour = this.checkHour.bind(this);
    this.hrsUp = this.hrsUp.bind(this);
    this.hrsDown = this.hrsDown.bind(this);
    this.minUp = this.minUp.bind(this);
    this.minDown = this.minDown.bind(this);
  }

  componentDidUpdate(prevprops, prevstate) {
    if (!this.state.schedule) {
      this.setState({schedule: add(new Date(), {minutes:15})});
    }
  }

  deleteSchedule() {
    this.props.deleteSchedule();
    this.resetPopin();
  }
  saveSchedule() {
    const {schedule} = this.state;
    if (schedule) {
      const heure = new Date(schedule);
      // this.props.saveSchedule((heure.getHours()*100)+heure.getMinutes());
      this.props.saveSchedule(heure);
      this.resetPopin();
    }
  }
  checkHour(heure) {
    // const now_delayed = add(new Date(), {minutes:this.props.delai});
    // logger.info('checkHour()', new Date(heure), now_delayed);
    // const heure_date = new Date(heure);
    // if (isBefore(heure_date, now_delayed)) {
    //   Swal.fire({
    //     title: strings.modules.encaissement.schedule.alert.troptot.titre,
    //     html: strings.modules.encaissement.schedule.alert.troptot.texte.replace('%HEURE%', format(now_delayed,'HH:mm'))
    //   });
    // } else {
      this.setState({schedule: heure});
    // }
  }
  resetPopin() {
    this.setState({schedule: null});
  }
  hrsUp() {
    const {end, schedule} = this.state;
    let hr = (schedule) ? schedule : new Date();

    hr = add(hr, {hours: 1});
    if (hr.getTime() < end) { 
      this.setState({schedule: hr});
    } else {
      console.error('hrsUp HEURE DEPASSEE', hr);
    }
    console.log('hrsUp', hr);
  }
  
  hrsDown() {

    const start = add(new Date(), {minutes:15});
    const {schedule} = this.state;
    let hr = (schedule) ? schedule : new Date();

    hr = sub(hr, {hours: 1});
    if (hr.getTime() >= start) { 
      this.setState({schedule: hr});
    } else {
      console.error('hrsUp HEURE ANTICIPEE', hr);
    }
    console.log('hrsDown', hr);
  }

  minUp() {
    const {end, schedule} = this.state;
    let hr = (schedule) ? schedule : new Date();
    // let min = (Math.ceil(hr.getMinutes() / 15) * 15) % 60;
    // hr = set(hr, {minutes: min});
    // if (min===0) {
    //   hr = add(hr, {hours: 1});
    // }

    hr = add(hr, {minutes: 15});

    if (hr.getTime() < end) { 
      this.setState({schedule: hr});
    } else {
      console.error('minUp HEURE DEPASSEE', hr);
    }
    console.log('minUp', hr);
  }

  minDown() {
    const start = add(new Date(), {minutes:15});
    const {schedule} = this.state;
    let hr = (schedule) ? schedule : new Date();
    // let min = (Math.floor(hr.getMinutes() / 15) * 15) % 60;
    // hr = set(hr, {minutes: min});

    hr = sub(hr, {minutes: 15});

    if (hr.getTime() >= start) { 
      this.setState({schedule: hr});
    } else {
      console.error('minDown HEURE ANTICIPEE', hr);
    }
    console.log('minDown', hr);
  }

  render() {

    const {open, closeHandler} = this.props;
    const {schedule, end} = this.state;

    let start = add(new Date(), {minutes:15});
    console.log('start brut', format(start,'HH:mm'));
    let min = (Math.ceil(start.getMinutes() / 15) * 15) % 60;
    start = set(start, {minutes: min});
    if (min===0) {
      start = add(start, {hours: 1});
    }
    console.log('start round', format(start,'HH:mm'));
    // if (!schedule) {
    //   this.setState({schedule: start});
    // }

    let vschedule = schedule ? schedule : this.props.schedule;

    // nombre d'heures dispo : 
      
    const duree = differenceInHours(end, start);

    const hrs_range = Array.from((new Array(duree + 1)), (x,i) => format( add(start, {hours: i}), 'H' ));
    const min_range = [0,15,30,45];

    const next_hrs = start.getHours();
    const next_min = (Math.ceil(start.getMinutes() / 15) * 15) % 60;

    if (!vschedule) {
      vschedule = set(new Date(), {hours: next_hrs, minutes: next_min});
    }

    const sche_hrs = vschedule.getHours();
    const sche_min = vschedule.getMinutes();


    const hrs_decal = differenceInHours(vschedule, set(start, {minutes:0, seconds:0}));
    const min_decal = Math.floor(vschedule.getMinutes() / 15);
    console.log('hrs_decal', hrs_decal);
    console.log('min_decal', min_decal);

    console.log('⏰ schedule', `${sche_hrs.toString().padStart(2,0)}h${sche_min.toString().padStart(2,0)}`);

    return (
      <Modal
        open={open}
        >
        <div className={ `ScheduleModal`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.encaissement.schedule.titre }</div>
            </div>
            <div className="body">
      
              <div className="heures">
                <div className="next-schedule">Prochain créneau : { next_hrs.toString().padStart(2,0) }h{ next_min.toString().padStart(2,0) }</div>
                
                <div className="picker-hrs">
                  <div className="pck-up hrs-up" onClick={ this.hrsUp } hidden={ add(vschedule, {hours:1}) >= end }></div>
                  { (add(vschedule, {hours:1}) > end) && (<div className="dummy-up"></div>)}
                  <div className="pck-val hrs-val">
                    <div className="pck-wrapper">
                      <ul className={ `decal-${hrs_decal}` }>
                      {hrs_range && hrs_range.map(h => (
                        <li key={`hrs-${h}`}>{ h.padStart(2,0) }</li>
                      )) }
                      </ul>
                    </div>
                  </div>
                  <div className="pck-down hrs-down" onClick={ this.hrsDown } hidden={ sub(vschedule, {hours:1}) < start }></div>
                  { (sub(vschedule, {hours:1}) < start) && (<div className="dummy-down"></div>)}
                </div>
                <div className="picker-dots">:</div>
                <div className="picker-min">
                  <div className="pck-up min-up" onClick={ this.minUp } hidden={ add(vschedule, {minutes: 15}) >= end }></div>
                  { (add(vschedule, {minutes: 15}) > end) && (<div className="dummy-up"></div>)}
                  <div className="pck-val min-val">
                    <div className="pck-wrapper">
                      <ul className={ `decal-${min_decal}` }>
                      {min_range && min_range.map(m => (
                        <li key={`min-${m}`}>{ m.toString().padStart(2,0) }</li>
                      )) }
                      </ul>
                    </div>
                  </div>
                  <div className="pck-down min-down" onClick={ this.minDown } hidden={ sub(vschedule, {minutes:15}) < start }></div>
                  { (sub(vschedule, {minutes:15}) < start) && (<div className="dummy-down"></div>)}
                </div>

              </div>
            </div>
            <div className="footer">
            <StdButton 
                identifier="modal-suppr" 
                elementclass="suppr" 
                icon={ false } 
                disabled={ schedule!==null && schedule!==undefined }
                text={ strings.general.dialog.delete } 
                onClick={this.deleteSchedule} 
              />
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={schedule===null || schedule===undefined}
                text={ strings.general.dialog.save } 
                onClick={this.saveSchedule} 
              />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );
  }
}


class BipperModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bipperId: null
    };
    this.resetPopin = this.resetPopin.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
  }

  resetPopin() {
    this.setState({bipperId: null});
  }


  keyboardButtonHandler(text) {
    const { bipperId } = this.state;
    const { bipper } = this.props;
    let bipperval = bipperId!==null ? bipperId : ((bipper!==null && bipper!==undefined ) ? bipper : '');
    if (text!=='c') {
      this.setState({bipperId: (bipperval || '')+text});
    } else {
      this.setState({bipperId: String(bipperval).slice(0,-1)});
    }
  }

  render() {
    const { bipper, selectBipper, closeHandler, open } = this.props;
    const { bipperId } = this.state;

    const bipperVal = bipperId!==null ? bipperId : ((bipper!==null && bipper!==undefined ) ? bipper : '');


    return (
      <Modal
      open={open}
      >
      <div className={ `BipperModal`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.encaissement.bipper.titre }</div>
          </div>
          <div className="body">
            <div className="bipper-valeur">{ bipperVal }</div>
            <NumberKeyboard
              numbersOnly={true}
              keyboardOnly={true}
              inner={true}
              open={true}
              buttonHandler={this.keyboardButtonHandler}
              />
          </div>
          <div className="footer">
            <StdButton 
                identifier="modal-suppr" 
                elementclass="suppr" 
                icon={ false } 
                text={ strings.modules.encaissement.bipper.suppression.bouton } 
                onClick={() => { selectBipper(null); this.resetPopin(); }} 
              />
            <StdButton 
              identifier="modal-save" 
              elementclass="save" 
              icon={ false } 
              disabled={ !bipperId }
              text={ strings.general.dialog.save } 
              onClick={() => {selectBipper(bipperId); this.resetPopin(); }} 
            />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>  
    );
  }
}


// class GiftInputModal extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       inputcode: '',
//       scan: true
//     };
//     this.resetPopin = this.resetPopin.bind(this);
//     this.decodeGiftQRCode = this.decodeGiftQRCode.bind(this);
//   }
//   changeHandler(event) {
//    // logger.info('CommentModal.changeHandler()', event.target.value);
//     this.setState({inputcode:event.target.value});
//   }
//   saveCode() {
//     const { inputcode } = this.state;

//     logger.info('saveCode()', inputcode);

//     this.props.submitHandler(inputcode);
//     this.resetPopin();
//     this.props.closeHandler();

//   }
//   resetPopin() {
//     this.setState({inputcode:''});
//   }

//   giftSrcHandler(event) {
//     if (event.keyCode===13) {
//       logger.info(event.target.value);
//       this.decodeGiftQRCode(event.target.value);
//       event.target.value = '';
//     }    
//   }

//   decodeGiftQRCode(value) {

//     const platform = process.platform==='darwin' ? 'darwin' : 'win';

//     let decoded = '';
//     for (let caractere of value) {
//       if (!decodetable[platform].hasOwnProperty(caractere)) {
//         continue;
//       }
//       decoded += decodetable[platform][caractere];
//     }

//     console.log('decodeQRCode()',decoded);

//     if (String(decoded).length>0) {
//       const value_ar = value.split('/');
//       const id = last(value_ar);
//       if (id) {
//         this.setState({inputcode: id});
//       }
//     }
//     return false;
//   }

//   giftinterval = 0;

//   render() {
//     const {open, clavierOpen, code, closeHandler} = this.props;
//     const {inputcode, scan} = this.state;

//     const vcode = code || inputcode;

//     const readytosave = vcode && vcode.length>0;

//      // gestion du focus sur le champ de recherche (scan QR code)
//      clearInterval(this.giftinterval);
     
//      const self = this;
//      if (scan) {      
//        this.giftinterval = setInterval(() => {
//          if (self.refs.giftinput) self.refs.giftinput.focus();
//         },500);
//      } else {
//        clearInterval(this.giftinterval);
//        this.giftinterval = 0;
//      }

//     return(
//       <div>
//       <Modal
//       open={open}
//       >
//       <div className={ `GiftInputModal`}>
//         <div className="Modal-container">
//           <div className="header">
//             <div className="title">{ strings.modules.encaissement.gift.titre }</div>
//           </div>
//           <div className="body">
//             <div className="form-group">
//                 <div className="label">{ strings.modules.encaissement.gift.input.titre }</div>
//                 <div className="valeur">

//                   <input className="gift-input" ref="giftinput" onKeyUp={this.giftSrcHandler} />
//                  {/* <TextField
//                     multiline
//                     id="texte"
//                     value={vcode}
//                     rowsMax={3}
//                     onChange={this.changeHandler}
//                     variant="filled"
//                     ref="giftinput"
//     />*/}
//                 </div>
//             </div>
//           </div>
//           <div className="footer">
//             <StdButton 
//                 identifier="modal-cancel" 
//                 elementclass="cancel" 
//                 icon={ false } 
//                 text={ strings.general.dialog.cancel } 
//                 onClick={ ()=>{this.resetPopin(); closeHandler()} } 
//               />
//             <StdButton 
//               identifier="modal-save" 
//               elementclass="save" 
//               icon={ false } 
//               disabled={ !readytosave }
//               text={ strings.general.dialog.save } 
//               onClick={this.saveCode} 
//             />
//           </div>
//         </div>
//         <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
//           <CloseIcon />
//         </Fab>
//       </div>
//     </Modal>  
//     {(clavierOpen && open) && <Clavier onChange={this.onKeyboardChange} className="ClavierComment" baseClass="KBComment" inputName="texte" inputVal={vcode} open={open && clavierOpen} />}
//     </div>
//     );
//   }



// }


class CommentModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      texte: null
    };
    this.deleteComment = this.deleteComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.setComment = this.setComment.bind(this);
    this.onKeyboardChange = this.onKeyboardChange.bind(this);
  }

  deleteComment() {
    const {commentid, deleteHandler} = this.props;
    if (commentid!==null) {

      Swal.fire({
        title: strings.modules.encaissement.commentaires.suppression.titre,
        text: strings.modules.encaissement.commentaires.suppression.titre,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'deleteconfirm',
        confirmButtonText: strings.general.dialog.delete,
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      })
      .then((result) => {
        if (result.value) {
          deleteHandler({commendId:commentid});
          this.resetPopin();
          this.props.closeHandler();
        }
      });
    }
  }

  saveComment() {
    const { commentid, item, ingredient } = this.props;
    const { texte } = this.state;

    logger.info('saveComment()');

    this.props.saveHandler(commentid, item, ingredient, texte);
    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({texte:null});
  }
  changeHandler(event) {
   // logger.info('CommentModal.changeHandler()', event.target.value);
    this.setState({texte:String(event.target.value).toUpperCase()});
  }
  setComment(message) {
    const { texte } = this.state;
    let newtexte = (texte===null) ? '' : texte+', ';
    this.setState({texte: newtexte+message});
  }



  onKeyboardChange(input) {
    this.setState({ texte:input });
    logger.info("Comment Input changed", input);
  };

  render() {

    const { commentid, item, ingredient, cmtlib, closeHandler, commenttexte, open, clavierOpen } = this.props;
    const { texte } = this.state;

    const vtexte = texte==null ? commenttexte : texte;

    const __mttl = (ingredient) ? 'titre_ing' : (item) ? 'titre_itm' : 'titre_cmd';

    const readytosave = texte!==null;

    return (
      <div>
      <Modal
      open={open}
      >
      <div className={ `CommentModal`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.encaissement.commentaires[__mttl] }</div>
          </div>
          <div className="body">
            <div className="form-group">
                <div className="label">{ strings.modules.encaissement.commentaires.texte }</div>
                <div className="valeur">
                  <TextField
                    multiline
                    id="texte"
                    value={vtexte}
                    rowsMax={3}
                    onChange={this.changeHandler}
                    variant="filled"
                  />
                  <div className="caption">{ strings.modules.encaissement.commentaires.caption }</div>
                </div>
            </div>
            <div className="form-group">
              <div className="label">{ strings.modules.encaissement.commentaires.predefini }</div>
              <div className="choix">
                {cmtlib && cmtlib.map(cmt=>(
                  <div className="cmtlib-item" key={`cmt-${cmt.id}`} onClick={()=>{this.setComment(cmt.message)}}>{cmt.message}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="footer">
            <StdButton 
                identifier="modal-suppr" 
                elementclass="suppr" 
                icon={ false } 
                disabled={ commentid==null }
                text={ strings.modules.encaissement.commentaires.suppression.bouton } 
                onClick={this.deleteComment} 
              />
            <StdButton 
              identifier="modal-save" 
              elementclass="save" 
              icon={ false } 
              disabled={ !readytosave }
              text={ strings.general.dialog.save } 
              onClick={this.saveComment} 
            />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>  
    {(clavierOpen && open) && <Clavier onChange={this.onKeyboardChange} className="ClavierComment" baseClass="KBComment" inputName="texte" inputVal={vtexte} open={open && clavierOpen} />}
    </div>
    );
  }

}


class DiscountModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      valeur: null,
      nom: ''
    };
    this.deleteDiscount = this.deleteDiscount.bind(this);
    this.saveDiscount = this.saveDiscount.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.setDiscount = this.setDiscount.bind(this);
  }

  deleteDiscount() {
    const {discountid, deleteHandler} = this.props;
    if (discountid!==null) {

      Swal.fire({
        title: strings.modules.encaissement.discount.suppression.titre,
        text: strings.modules.encaissement.discount.suppression.titre,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'deleteconfirm',
        confirmButtonText: strings.general.dialog.delete,
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      })
      .then((result) => {
        if (result.value) {
          deleteHandler({discountId:discountid});
          this.resetPopin();
          this.props.closeHandler();
        }
      });
    }
  }

  saveDiscount() {
    const { discountid, item, ingredient } = this.props;
    const { nom, valeur } = this.state;

    logger.info('saveDiscount()');

    this.props.saveHandler(discountid, item, ingredient, valeur, nom);
    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({valeur:null, nom:''});
  }
  changeHandler(event) {
   // logger.info('CommentModal.changeHandler()', event.target.value);
    this.setState({valeur:Math.abs(event.target.value), nom:event.target.nom});
  }
  setDiscount(discount) {
    // const { valeur } = this.state;
    // let newvaleur = (valeur===null) ? '' : texte+', ';
    this.setState({nom: discount.nom, valeur: discount.valeur});
  }
  render() {

    const { discountid, item, ingredient, dsclib, closeHandler, discountval, discountnom, open } = this.props;
    const { valeur, nom } = this.state;

    logger.info('dsclib',dsclib);

    const vvaleur = valeur===null ? discountval : valeur;
    const vnom = nom==='' ? discountnom : nom;
    logger.info('discountval', discountval);

    // setTimeout(() => {
    //   if (this.refs.commentInput) this.refs.commentInput.focus();
    // },500);

    // const __surpanier = ingredient===null && item===null;
    // const __filteredDsclib = dsclib.filter(d => (__surpanier ? d.valeur.substr(-1,1)!=="%" : true));

    const __filteredDsclib = dsclib;

    const __mttl = (ingredient) ? 'titre_ing' : (item) ? 'titre_itm' : 'titre_cmd';

    const readytosave = valeur!==null;

    return (
      <Modal
      open={open}
      >
      <div className={ `DiscountModal`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.encaissement.discount[__mttl] }</div>
          </div>
          <div className="body">
            <div className="form-group">
                <div className="label">{ strings.modules.encaissement.discount.texte }</div>
                <div className="valeur">
                  {/* <TextField
                    multiline
                    id="texte"
                    value={vtexte}
                    rowsMax={3}
                    ref="commentInput"
                    onChange={this.changeHandler}
                    variant="filled"
                  /> */}
                  <div className="discount-valeur">{ (vvaleur ? `${vnom} (${vvaleur})` : '') }</div>
                  <div className="caption">{ strings.modules.encaissement.discount.caption }</div>
                </div>
            </div>
            <div className="form-group">
              <div className="label">{ strings.modules.encaissement.discount.predefini }</div>
              <div className="choix">
                {__filteredDsclib && __filteredDsclib.map(dsc=>(
                  <div className="dsclib-item" key={`dsc-${dsc.id}`} onClick={()=>{this.setDiscount(dsc)}}>{`${dsc.nom} (${dsc.valeur})`}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="footer">
            <StdButton 
                identifier="modal-suppr" 
                elementclass="suppr" 
                icon={ false } 
                disabled={ discountid==null }
                text={ strings.modules.encaissement.discount.suppression.bouton } 
                onClick={this.deleteDiscount} 
              />
            <StdButton 
              identifier="modal-save" 
              elementclass="save" 
              icon={ false } 
              disabled={ !readytosave }
              text={ strings.general.dialog.save } 
              onClick={this.saveDiscount} 
            />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>

    );
  }

}




class Panier extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: -1,
      selectedIngredient: -1,
      ingredientid: null,
      inputfocus: true,
      searchval:'',
      commentOpen: false, 
      commentId: null, 
      commentItemId: null, 
      commentIngredientId: null,
      discountOpen: false, 
      discountId: null, 
      discountItemId: null, 
      discountIngredientId: null,
      ficheClientOpen: false,
      keyboardLayoutName: 'default',
      clavierOpen: false,
      actualInput: null,
      inputValue: '',
      tablesOpen: false,
      bippersOpen: false,
      scheduleOpen: false,
      ouvertureOpen: false,
      cmdModeOpen: false,
      cmdMode: null,
      giftSet: false,
      // giftOpen: false,
      // giftCode: null,
      solde: 0,
    }
    this.setSelectedIndex = this.setSelectedIndex.bind(this);
    this.setSelectedIngredient = this.setSelectedIngredient.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.decodeQRCode = this.decodeQRCode.bind(this);
    this.send_to_search = this.send_to_search.bind(this);
    this.openComment = this.openComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.closeComment = this.closeComment.bind(this);
    this.getComment = this.getComment.bind(this);
    this.removeComment = this.removeComment.bind(this);

    this.openDiscount = this.openDiscount.bind(this);
    this.saveDiscount = this.saveDiscount.bind(this);
    this.closeDiscount = this.closeDiscount.bind(this);

    this.openFicheClient = this.openFicheClient.bind(this);
    this.closeFicheClient = this.closeFicheClient.bind(this);
    this.selectClient = this.selectClient.bind(this);

    this.openTables = this.openTables.bind(this);
    this.closeTables = this.closeTables.bind(this);
    this.selectTables = this.selectTables.bind(this);

    this.openBippers = this.openBippers.bind(this);
    this.closeBippers = this.closeBippers.bind(this);
    this.selectBipper = this.selectBipper.bind(this);

    this.openSchedule = this.openSchedule.bind(this);
    this.closeSchedule = this.closeSchedule.bind(this);
    this.deleteSchedule = this.deleteSchedule.bind(this);
    this.setSchedule = this.setSchedule.bind(this);

    this.testOuverture = this.testOuverture.bind(this);
    this.openOuverture = this.openOuverture.bind(this);
    this.closeOuverture = this.closeOuverture.bind(this);
    this.addOuverture = this.addOuverture.bind(this);

    this.setStaffmeal = this.setStaffmeal.bind(this);
    this.getBeneficiaire = this.getBeneficiaire.bind(this);
    this.cancelStaffmeal = this.cancelStaffmeal.bind(this);

    this.openCmdMode = this.openCmdMode.bind(this);
    this.setCmdMode = this.setCmdMode.bind(this);
    this.closeCmdMode = this.closeCmdMode.bind(this);

    // this.openGiftIinput = this.openGiftIinput.bind(this);
    // this.closeGiftIinput = this.closeGiftIinput.bind(this);
    // this.getGift = this.getGift.bind(this);
    this.isGiftSet = this.isGiftSet.bind(this);
    this._cleanOrphanGifts = this._cleanOrphanGifts.bind(this);
    this._checkGiftCondition = this._checkGiftCondition.bind(this);

  }

  lock = false;
  search_tmo = -1;

  componentDidMount() {
    const { 
      getCommande, 
      getParametres, 
      getLots,
      // getListeCommandes, 
      getClientsList, 
      commande, 
      getSallesList 
    } = this.props;
    if (!commande.hasOwnProperty('ticketId')) getCommande();
    // getListeCommandes();
    getParametres();    
    getClientsList();
    getLots();
    getSallesList();
    this.testOuverture();
    this.listewrapper.scrollTop = this.listewrapper.scrollHeight;
    
  }
  componentDidUpdate() {
    const { items } = this.props.commande;

    // s'il y a des items dans la commande
    if ((undefined!==items && null!==items) && items.length>0) {
      
        // vérifie si un item est 'pending'
        // si c'est le cas, on ouvre la Personnalisation avec le premier step non complet
        
        const __pendingItem = items.find(itm => itm.status==="pending");
        const __forceItem = (this.props.forcePersonnalisationItem) ? items.find(item => item.itemid===this.props.forcePersonnalisationItem) : null;
        // le prochain step que l'on affiche est celui qui n'a pas encore été revu
        let __stepToRun = null;
        let __item = null;


        if (__forceItem) {
          logger.info('Panier.componentDidUpdate(), modif de personnalisation DEMANDÉE', __forceItem);
          __stepToRun = __forceItem.steps.find(step => step.checked===false );
          __item = __forceItem;
        }
         else if (__pendingItem) {
          logger.info('Panier.componentDidUpdate(), pas de modif de personnalisation', __pendingItem);
          __stepToRun = __pendingItem.steps.find(step => step.checked===false );
          __item = __pendingItem;
        }

        if (__stepToRun) {
          // id du step précédent et suivant
          let __stepIndex = __item.steps.findIndex(s=>s.id===__stepToRun.id);
          let __previd = (__stepIndex<=0 ) ? -1 : __item.steps[__stepIndex-1].id;
          let __nextid = (__stepIndex>=__item.steps.length-1 ) ? -1 : __item.steps[__stepIndex+1].id;
          this.props.openPersonnalisation(__item.itemid, __stepToRun.id, __previd, __nextid, __stepToRun.validated, __item.status, __forceItem==null ? 'Panier.componentDidUpdate()' : 'item');
        } 
        // si aucun item n'est 'pending'
        else {
          this.props.closePersonnalisation('Panier.componentDidUpdate()');
        }


    } else {
      this.props.closeReglement();
    }

    // test des conditions d'application des cadeaux
    this._checkGiftCondition();

    // suppression des cadeaux orphelins (produit ou modificateur)
    this._cleanOrphanGifts();



    const {bippersOpen} = this.state;
    const {parametres} = this.props;
    const gestion_bippers = (parametres && parametres.commandes) ? parametres.commandes.active_bippers : false;
    
    if (!bippersOpen && gestion_bippers && !this.props.commande.hasOwnProperty('bipper')) {
      this.setState({bippersOpen: true});
    }

    const {cmdModeOpen, cmdMode } = this.state;
    const popinmode = (parametres && parametres.commandes) ? parametres.commandes.popinmode : false;
    console.log('popinmode', popinmode, cmdModeOpen, cmdMode);
    if (!cmdModeOpen && popinmode && cmdMode===null && this.props.commande.items.length===0) {
      console.log('on ouvre la popin de mode');
      this.setState({cmdModeOpen: true});
    }

    // liste panier se cale en bas (sur le dernier produit ajouté)
    this.listewrapper.scrollTop = this.listewrapper.scrollHeight;
  }

  /**
   * teste si le cadeau est sélectionné 
   */
  isGiftSet() {
    const {items, modificateurs} = this.props.commande;

    // s'il y a un produit dont l'id contient la sous-chaine "gift_" et un modificateur associé à cet item
    // on considère que le cadeau est attribué (giftSet=true)
    const giftmod = modificateurs.find( mod => (mod.item && mod.item.includes('gift_')) );
    let giftitem = {};
    if (giftmod) {
      giftitem = items.find(itm => itm.itemid===giftmod.item);
    }
  
    return giftitem && giftmod;
  }

  _checkGiftCondition() {
    const { items, modificateurs, gift } = this.props.commande;
    const { deleteDiscount, monnaie } = this.props;

    // const giftitem = items.find(itm => itm.itemid.includes('gift_'));
    const giftmod = modificateurs.find( mod => (mod.item && mod.item.includes('gift_')) );

    if (gift && items && giftmod) {
      const __total = this.calculeTotaux(items, modificateurs, monnaie.symbole);
      
      // si le total du panier est inférieur au minimum requis
      if (__total.total < gift.totalMin) {
        // on alerte avant la suppression du cadeau sélectionné
          
        Swal.fire({
          title: strings.modules.encaissement.gift.alertes.montant.titre,
          html: strings.modules.encaissement.gift.alertes.montant.texte.replace('%TOTAL%', gift.totalMin+' '+monnaie.symbole),
          focusConfirm: true,
          showCancelButton: false,
          // customClass: 'deleteconfirm',
          confirmButtonText: strings.general.dialog.delete,
          buttonsStyling: false 
        })
        .then((result) => {
          // updateProduit({itemid: giftitem.itemid, quantite: 0});
          try {
            deleteDiscount({discountId:giftmod.modificateur_id});
          } catch(e) {
            // console.warn(e);
          }
        });   
      }
      
    }

  }

  /**
   * Nettoie les cadeaux orphelins (produit ou modificateur)
   */
  _cleanOrphanGifts() {
    
    const { items, modificateurs, gift } = this.props.commande;
    const { deleteDiscount, updateProduit } = this.props;


    if (gift) {

      // on recherche un produit-cadeau
      const giftitem = items.find(itm => itm.itemid.includes('gift_'));
      if (giftitem) {
        const giftmod = modificateurs.find( (mod => (mod.item && mod.item===giftitem.itemid)) );
        // s'il n'y a aucun modificateur correspondant on supprime le produit-cadeau
        if (!giftmod) {
          updateProduit({itemid: giftitem.itemid, quantite: 0});
        }
      }

      // on recherche un modificateur-cadeau
      const giftmod = modificateurs.find( (mod => (mod.item && mod.item.includes('gift_'))) );
      if (giftmod) {
        const giftitem = items.find(itm => itm.itemid===giftmod.item);
        // s'il n'y a aucun produit-cadeau correspondant, on supprime le modificateur
        if (!giftitem) {
          deleteDiscount({discountId:giftmod.modificateur_id});
        }
      }
    }

  }

  /**
   * S
   */
  testOuverture() {
    const {ouverture, parametres, unlockEncaissement} = this.props;

    // si la prise en compte du fond de caisse est activé
    // on teste s'il faut ouvrir ou non la caisse (déclaration fd de caisse)
    if (parametres.financier.fonddecaisse_activation) {
      if (ouverture) {
        unlockEncaissement();
      } else {
        this.openOuverture();
      }
    }
    // si la prise en charge du fond de caisse n'est pas activé,
    // on ouvre directement l'encaissement
    else {
      unlockEncaissement();
    }
  }



  openOuverture() {
    this.setState({
      solde: this.props.solde, 
      ouvertureOpen: true,
      inputfocus: false
    });
  }

  closeOuverture() {
    this.props.unlockEncaissement();
    this.setState({ 
      ouvertureOpen: false,
      inputfocus: true
    });
  }
  addOuverture(payload) {

    logger.info('addOuverture', payload);

    this.props.addTresor(payload);
    this.closeOuverture();
  }

  setSelectedIndex(index) {
    const {selectedIngredient} = this.state;
    if (!this.props.open) {
      logger.info('select item');
      if (selectedIngredient===-1) {
        index = index===this.state.selectedIndex ? -1 : index;
      }
    }

    if (index >= 0 && this.props.open) {
      logger.info('select dans le reglt');
      const itemsCopy = [...this.props.commande.items];
      const item = itemsCopy[index];
      item.selected = !item.selected  ? true : false;
      itemsCopy[index] = item;
      this.props.updateCommande({...this.props.commande, items: itemsCopy})
    }  

    this.setState({selectedIndex: index, selectedIngredient: -1, ingredientid: null})
  }

  // sélection / désélection du subItem
  setSelectedIngredient(index,ingidx, ingId) {
    logger.info(`setSelectedIngredient(${index}, ${ingidx})`)
    const {selectedIndex, selectedIngredient} = this.state;
    // si l'item est déjà sélectionné
    if (index===selectedIndex) {
      // si on clique sur un ingrédient déjà sélectionné,
      // on désélectionne l'ingrédient et sont produit parent
      index = ingidx===selectedIngredient ? -1 : index;
      ingidx = ingidx===selectedIngredient ? -1 : ingidx;
      ingId = ingidx===selectedIngredient ? null : ingId
    }
    this.setState({selectedIndex: index, selectedIngredient: ingidx, ingredientid: ingId})
  }


  _calculeItemsEtRemises(items, modificateurs, taux_remise_panier = 0, symbolemonnaie) {

    console.log('🧮 _calculeItemsEtRemises', items, modificateurs, taux_remise_panier, symbolemonnaie);

    let __soustotal_ht = 0;
    let __soustotal_ttc = 0;

      // CALCUL DES REMISES SUR LES ITEMS -> sous-total
      items.forEach(itm => {

        // calcul du prix TTC et HT de l'item
        let __ttcitm = Math.round(itm.pu * 100) * itm.quantite;
        let __htitm = Math.round(itm.puht * 100) * itm.quantite;
        let __ttcing = 0;

        console.log('🧮 _cI&R (ttcitm, htitm, ttcing)', __ttcitm, __htitm, __ttcing);
        
        // on boucle sur le prix TTC des ingrédients
        itm.ingredients.forEach(ing => {
          __ttcing += Math.round(ing.supplement * 100);
          console.log('🧮 _cI&R prepare TTCING (ing.supplement) = ', ing.supplement);
        });
        console.log('🧮 _cI&R TTCING = ', __ttcing);
  
        // on obtient le soustotal ttc de l'item
        let __sttcitm = __ttcitm + __ttcing;
        console.log('🧮 _cI&R __sttcitm = ', __sttcitm);
  
        let __modcoef = 0;
        const moditm = modificateurs.find(m => m.item===itm.itemid);
        // s'il y a un modificateur pour l'item
        if (moditm) {
          
          const ispc = String(moditm.valeur).includes("%");
          const val = Math.abs(ispc 
            ? Number(String(moditm.valeur).slice(0, -1))
            : Number(String(moditm.valeur).slice(0, -symbolemonnaie.length))
          );


          if (ispc) {
            __modcoef = val / 100;
          }
          // si c'est une remise numéraire, on la convertit en coef
          else {
            // à partir du montant TTC de l'item + ses ingrédients
            __modcoef = (val * 100) / __sttcitm;
          }
          console.log('🧮 _cI&R moditm val = ', __modcoef);
        }
          
        const __tx = Number(itm.tva.valeur);

        // on applique ensuite ce coef sur le HT de l'item et des ingrédients
        let __modhtitm = __htitm;
        let __modttcitm = __ttcitm;
        if (__modcoef>0 || taux_remise_panier>0) {
          __modhtitm = (__htitm - (__htitm * __modcoef)) - ((__htitm - (__htitm * __modcoef)) * taux_remise_panier); // <- HT de l'item (avec remise)
          __modttcitm = __modhtitm * (1 + __tx);  // <- TTC de l'item (avec remise)
        }
        console.log('🧮 _cI&R __tx', __tx);
        console.log('🧮 _cI&R __modhtitm,  __modttcitm', __modhtitm, __modttcitm);
        // et on calcule le TTC

        let __modhting = 0; // <- HT des ingrédients de l'item
        let __modttcing = 0;  // <- TTC des ingrédients de l'item
        itm.ingredients.forEach(ing => {
          const __hi = Math.round(ing.supplementht * 100);
          const __itx = Number(ing.tva.valeur);
           
          let __him = __hi;
          let __ti = Math.round(ing.supplement * 100);
          if (__modcoef>0 || taux_remise_panier>0) {
            __him = (__hi - (__hi * __modcoef)) - ((__hi - (__hi * __modcoef)) * taux_remise_panier);  // <- HT de l'ingrédient (avec remise)
            __ti = __him * (1 + __itx); // <- TTC de l'ingrédient (avec remise)
          }
          __modhting += __him;
          __modttcing += __ti;
        });
        console.log('🧮 _cI&R __modhting,  __modttcing', __modhting, __modttcing);
          
        // on compile les données HT et TTC
        __soustotal_ttc += __modttcitm + __modttcing;
        __soustotal_ht += __modhtitm + __modhting;
        console.log('🧮 _cI&R ssttlttc,  ssttlht', __soustotal_ttc, __soustotal_ht);
  
      });

      return {ht: Math.round(__soustotal_ht), ttc: Math.round(__soustotal_ttc)};
  }


  /* retourne le sous-total, le total et les remises pour le panier  */
  calculeTotaux(items, modificateurs, symbolemonnaie) {

    let __total = 0;
    
    const soustotal = this._calculeItemsEtRemises(items, modificateurs, 0, symbolemonnaie);
    console.log('🧮 soustotal', soustotal);
    
    let __soustotal_ttc = soustotal.ttc;

    // on obtient donc un sous-total HT, TVA et TTC

    // CALCUL DE LA REMISE SUR LE PANIER -> total
    let __remise_panier = 0;
    const modcmd = modificateurs.find(m => m.item===null && m.type!=='frais');
    // s'il y a un modificateur pour le panier
    if (modcmd) {


      const ispc = String(modcmd.valeur).includes("%");
      const val = Math.abs(ispc 
        ? Number(String(modcmd.valeur).slice(0, -1))
        : Number(String(modcmd.valeur).slice(0, -symbolemonnaie.length))
      );
      console.log('🧮 val remise', val);
  
      // si c'est une remise en %age
      if (ispc) {
        // on applique ensuite ce coef sur le HT du sous-total du panier
        // on calcule le TTC
        const total = this._calculeItemsEtRemises(items, modificateurs, (val / 100), symbolemonnaie);
        __remise_panier = __soustotal_ttc - total.ttc;
        __total = total.ttc;
      } else {
        __remise_panier = Math.round(val * 100);
        __total = __soustotal_ttc - Math.round(val * 100);
      }

      console.log('🧮 __total', __total);

    } else {
      __total = __soustotal_ttc;
    }

    return {total: __total, remisepanier: __remise_panier};

  }



  searchHandler(event) {
    if (event.keyCode===13) {
      logger.info(event.target.value);
      this.decodeQRCode(event.target.value);
      event.target.value = '';
    }    
  }
  decodeQRCode(value) {

    const platform = process.platform==='darwin' ? 'darwin' : 'win';
    const {items} = this.props.commande;

    let decoded = '';
    for (let caractere of value) {
      if (!decodetable[platform].hasOwnProperty(caractere)) {
        continue;
      }
      decoded += decodetable[platform][caractere];
    }

    if (String(decoded).length>0) {
      if (decoded.includes('luckylikes')) {
      // if (this.state.giftOpen) {
        this.getGift(decoded);
      } else {
        if (!items || items.length===0) {
          this.send_to_search(decoded);
        }
      }
    }
    return false;
  }

  getGift(value) {
    // on découpe la valeur (probablement une URL) selon les "/"
    // et on utilise la dernière partie
    const value_ar = value.split('/');
    const id = last(value_ar);
    if (id) {
      this.props.searchGift({code:id});
    }
  }

  // TODO : faire une requête plutôt que charger la liste des commandes
  // pbm : latence de l'encaissement si on met à jour la liste des commandes
  send_to_search(value) {
    logger.info('send_to_search',value);
    const { nonconfirmeeslist } = this.props;

    if (nonconfirmeeslist) {
      const cmd = Object.values(nonconfirmeeslist).find((c)=>c.ticketId===value);
      if (cmd && cmd.status==='standby') {
        logger.info('s2s commande trouvée', value);
        // this.setState({inputfocus: false});
        this.props.getCommande(value);
      } else {
        logger.info('s2s aucune commande standby avec ce ticketId', value);
      }
    }

  }



  


  openDiscount() {

    const {modificateurs, items } = this.props.commande;
    const {selectedIndex} = this.state;

    // récup des id d'item et d'ingrédients en fonction de la sélection du panier
    const itemid = (selectedIndex>-1) ? items[selectedIndex].itemid : null;
   // const ingredientid = (selectedIngredient!==-1) ? items[selectedIndex].ingredients[selectedIngredient].ingredient : null;
    const ingredientid = null;

    // DEV : pour l'instant on n'utilise que le discount sur le panier entier
    // const itemid = null;
    // const ingredientid = null;

    // si l'id de l'item est défini : 
    // - soit un comment d'item
    // - soit un comment d'ingrédient
    // si pas d'id d'item : comment de commande
    const discount = modificateurs.find(dsc => dsc.item===itemid && dsc.ingredient===ingredientid);

    const discountId = (discount) ? discount.modificateur_id : null;

    this.setState({
      discountOpen: true, 
      discountId: discountId, 
      discountItemId: itemid, 
      discountIngredientId: ingredientid,
      inputfocus: false
    });
  }

  saveDiscount(discountid, itemid, ingredientid, valeur, nom='') {

    const { commande, monnaie } = this.props;
    

    let __discount_valeur = valeur;

    // si le discount est en numéraire
    if (!String(valeur).includes("%")) {
      
      let __target_price = 0;

      // si le discount est attribué à un item
      if (itemid || ingredientid) {
        const item = commande.items.find(i=> i.itemid===itemid);
        __target_price = item.prix;
      }
      // si le discount est attribué au panier entier
      else {
        const __ssttl = this._calculeItemsEtRemises(commande.items, commande.modificateurs, 0, monnaie.symbole);
        __target_price = __ssttl.ttc / 100;
        console.log('❓PRICE', __target_price);
      }
      
      // si le montant du discount dépasse la valeur qu'il modifie
      const __discount_valeurabsolue = Math.abs( Number(String(valeur).slice(0, -monnaie.symbole.length)) );
      if (__discount_valeurabsolue > __target_price) {
        // on limite la valeur du discount à celle du panier
        __discount_valeur = __target_price + monnaie.symbole;
      }
    }
    
    if (discountid===null) {
      this.props.addDiscount({
        item: itemid,
        ingredient: ingredientid,
        valeur: __discount_valeur,
        nom: nom
      });
    } else {
      this.props.updateDiscount({
        discountId: discountid, 
        valeur: __discount_valeur,
        nom: nom
      });
    }
  }

  closeDiscount() {
    this.setState({
      discountOpen: false, 
      discountId:null, 
      discountItemId:null, 
      discountIngredientId:null,
      inputfocus: true
    });
  }




  openComment() {

    const {comments, items } = this.props.commande;
    const {clavier} = this.props.parametres.entreprise;
    const {selectedIndex, selectedIngredient, ingredientid} = this.state;

    logger.info('openComment selectedIngredient', selectedIngredient);

    // récup des id d'item et d'ingrédients en fonction de la sélection du panier
    const itemid = (selectedIndex>-1) ? items[selectedIndex].itemid : null;
  //  const ingredientid = (selectedIngredient!==-1) ? items[selectedIndex].ingredients[selectedIngredient].ingredient : null;

    // si l'id de l'item est défini : 
    // - soit un comment d'item
    // - soit un comment d'ingrédient
    // si pas d'id d'item : comment de commande
    const comment = comments.find(cmt => cmt.item===itemid && cmt.ingredient===ingredientid);

    const commentId = (comment) ? comment.comment_id : null;

    this.setState({
      commentOpen: true, 
      commentId: commentId, 
      commentItemId: itemid, 
      clavierOpen: clavier,
      commentIngredientId: ingredientid,
      inputfocus: false
    });
  }

  saveComment(commentid, itemid, ingredientid, texte) {
    if (commentid===null) {
      this.props.addComment({
        item: itemid,
        ingredient: ingredientid,
        texte: texte
      });
    } else {
      this.props.updateComment({
        commentId: commentid, 
        texte: texte
      });
    }
  }

  getComment(itemid, ingredientid=null) {
    const {comments} = this.props.commande
    const cmt = comments.find(c => (c.item===itemid && c.ingredient===ingredientid));
    
    return cmt ? cmt.texte : '';
  }

  removeComment(itemid, ingredientid=null) {
    logger.info('removeComment', itemid, ingredientid);
    const {comments} = this.props.commande;
    const cmt = comments.find(c => (c.item===itemid && c.ingredient===ingredientid));

    if (cmt) {
      this.props.deleteComment({commentId:cmt.comment_id});
    }
  }

  closeComment() {
    this.setState({
      commentOpen: false, 
      commentId:null, 
      commentItemId:null, 
      commentIngredientId:null,
      clavierOpen: false,
      inputfocus: true
    });
  }


  openFicheClient() {
    const {clavier} = this.props.parametres.entreprise;
    this.setState({
      ficheClientOpen: true,
      clavierOpen: clavier,
      inputfocus: false
    });
  }
  closeFicheClient() {
    this.setState({
      ficheClientOpen: false,
      clavierOpen: false,
      inputfocus: true
    });
  }
  selectClient(client) {
    if (client===null) {
      this.props.updateCommande({client:null});
    } else {
      this.props.updateCommande({
        client:{
          nom:client.nom, 
          prenom:client.prenom, 
          client_id:client.client_id
        }
      });
    }
  }

  openTables() {
    logger.info('openTables()');
  }
  closeTables() {
    logger.info('closeTables()');
  }
  selectTables() {
    logger.info('selectTables()');
  }

  openSchedule() {
    logger.info('openSchedule()');
    this.setState({scheduleOpen: true});
  }
  closeSchedule() {
    logger.info('closeSchedule()');
    this.setState({scheduleOpen: false});
  }
  deleteSchedule() {
    logger.info('deleteSchedule()');
    this.props.updateCommande({scheduled:null, enproduction:false});
    this.setState({scheduleOpen: false});
  }
  setSchedule(heure) {
    logger.info('setSchedule('+heure+')');
    
    const round_heure = new Date(`${ heure.getUTCFullYear() }-${ String(heure.getUTCMonth()+1).padStart(2,'0') }-${ String(heure.getUTCDate()).padStart(2, '0') }T${ String(heure.getUTCHours()).padStart(2, '0') }:${ String(heure.getUTCMinutes()).padStart(2, '0') }:00.000Z`);
    
    // si l'heure programmée est dans les 15 prochaines minutes -> enproduction=true
    const {parametres} = this.props;
    const schedule_delay = (parametres && parametres.commandes) ? (parametres.commandes.schedule_delay || 15) : 15;
    const __end = add(new Date(), {minutes:schedule_delay});
    let __enproduction = false;
    if (isBefore(heure,__end)) {
      __enproduction = true;
    }
    logger.info('SETSCH', __end, heure, __enproduction);
    
    this.props.updateCommande({scheduled:round_heure, enproduction:__enproduction});
    this.setState({scheduleOpen: false});
  }

  openBippers() {
    logger.info('openBippers()');
    this.setState({bippersOpen: true});
  }
  closeBippers() {
    logger.info('closeBippers()');
    this.setState({bippersOpen: false});
  }
  selectBipper(bipperId) {
    logger.info('selectBipper('+bipperId+')');
    this.setState({bippersOpen: false});
    this.props.updateCommande({bipper:bipperId});
  }

  setStaffmeal() {
    const { commande } = this.props;

    if (commande.type==='staffmeal' && commande.beneficiaire!==null) {

      // const discount_panier = commande.modificateurs.find(m => (m.item===null && m.ingredient===null));

      Swal.fire({
        title: strings.modules.encaissement.staffmeal.annulation.titre,
        html: strings.modules.encaissement.staffmeal.annulation.texte,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'deleteconfirm',
        confirmButtonText: strings.general.dialog.delete,
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      })
      .then((result) => {
        if (result.value) {
          this.props.updateCommande({
            type: 'vente',
            beneficiaire: null,
            modificateurs: []
          });
        }
      });


    } else {
      this.props.updateCommande({
        type: 'staffmeal',
        beneficiaire: null,
        modificateurs: []
      });
    }

  }


  async getBeneficiaire(passphrase) {

    const { 
      getUser, 
      updateCommande, 
      parametres, 
      commande, 
      addDiscount, 
      updateDiscount,
      getCommandesList 
    } = this.props;
    
    const { staffmeal_modifier } = parametres.options;

    let id, nom, user_id;

    // récup de l'employé à partir de son identifiant
    try {

      const __user = await getUser(passphrase);

      id = __user.id;
      nom = __user.nom;
      user_id = __user.user_id;

    }
    catch (error) {
      Swal.fire({
        title: strings.modules.encaissement.staffmeal.alerte.titre,
        html: strings.modules.encaissement.staffmeal.alerte.texte,
        showCancelButton: false,
        focusConfirm: true
      }).then((result)=> {
        this.cancelStaffmeal();
      });
    }

 

    const {heure_fin} = parametres.entreprise;
    const {debut} = dateBounds(new Date(), heure_fin);


    logger.info('query staffmeal','{$and:[{type:"staffmeal"}, {createdAt:{$gt:'+debut+'}}, {"beneficiaire.id":"'+id+'"}]}');

    const daily_staffmeal = await getCommandesList({query: {
      $and:[
        { type: 'staffmeal' },
        { 'beneficiaire.id': id },
        { createdAt: { $gt: debut } }
      ]
    }});

    logger.info('daily_staffmeal', daily_staffmeal);

    if (daily_staffmeal && daily_staffmeal.commandeslist && Object.entries(daily_staffmeal.commandeslist).length>0) {

      Swal.fire({
        title: strings.modules.encaissement.staffmeal.deja.titre,
        html: strings.modules.encaissement.staffmeal.deja.texte,
        showCancelButton: false,
        focusConfirm: true
      }).then((result)=> {
        this.cancelStaffmeal();
      });
      
    }
    else {
      
      // attribue le modificateur 'staffmeal_modifier' au niveau du panier
      // modifie le modificateur panier s'il existe déjà
      const discount_panier = commande.modificateurs.find(m => (m.item===null && m.ingredient===null));
      if (discount_panier) {
        updateDiscount({
          discountId: discount_panier.modificateur_id, 
          valeur: staffmeal_modifier,
          nom: strings.modules.encaissement.staffmeal.titre
        });
      }
      else {
        addDiscount({
          item: null,
          ingredient: null,
          valeur: staffmeal_modifier,
          nom: strings.modules.encaissement.staffmeal.titre
        });
      }
      
      
      // définit le bénéficiaire
      updateCommande({beneficiaire:{id, nom, user_id}}); 
    }
      
    

  }

  cancelStaffmeal() {
    this.props.updateCommande({beneficiaire:null, type:'vente'});
  }

  openCmdMode() {
    this.setState({cmdModeOpen: true});
  }
  setCmdMode(mode) {
    this.props.updateMode(mode);
    this.setState({cmdMode:mode, cmdModeOpen: false});
  }
  closeCmdMode() {
    this.setState({cmdMode:true, cmdModeOpen: false});
  }


  // openGiftIinput() {
  //   console.log('openGiftInput');
  //   this.setState({giftOpen: true, inputfocus: false});
  // }
  // closeGiftIinput() {
  //   this.setState({giftOpen: false, inputfocus: true});
  // }
 

  interval = 0;

  render() {

    const { updateProduit, 
            updateCommande, 
            updateMode,
            standByCommande, 
            validateCommande, 
            deleteCommande, 
            gotoListeCommandes, 
            openReglement, 
            open, 
            openDrawer, 
            parametres, 
            deleteComment,
            deleteDiscount,
            clients,
            caisse, 
            blocage_encaissement,
            // caisses,
            monnaie,
            log,
            openGiftSelector,
            // searchGift
           } = this.props;

    const { comments, modificateurs, items, ticketId, mode, client, bipper, type, beneficiaire, gift } = this.props.commande;
    
    const {inputfocus, searchval, 
           commentOpen, commentId, commentItemId, commentIngredientId,
           discountOpen, discountId, discountItemId, discountIngredientId,
           ficheClientOpen,
           clavierOpen,
           bippersOpen,
           ouvertureOpen,
           scheduleOpen,
           cmdModeOpen,
          //  giftOpen,
          //  giftCode,
           solde,
          } = this.state;

    // récup du texte en fonction de l'id du commentaire (s'il est défini)
    let commentTexte = (commentId!==null) ? comments.find(cmt=>cmt.comment_id===commentId).texte : '';

    // choix de messages prédéfinis pour les commentaires :
    const cmtlib = (parametres && parametres.commandes) ? parametres.commandes.comment_predefini : [];

    // récup de la valeur en fonction de l'id du discount (s'il est défini)
    const discountVal = (discountId!==null) ? modificateurs.find(dsc=>dsc.modificateur_id===discountId).valeur : '';
    const discountNom = (discountId!==null) ? modificateurs.find(dsc=>dsc.modificateur_id===discountId).nom : '';
    // choix de discounts prédéfinis pour les discounts :
    const dsclib = (parametres && parametres.commandes) ? parametres.commandes.discount_predefini : [];
    // gestion de tables :
    const gestion_tables = (parametres && parametres.commandes) ? parametres.commandes.gestion_tables : false;
    const tableId = null;
    
    const gestion_bippers = (parametres && parametres.commandes) ? parametres.commandes.active_bippers : false;
    const schedule_delay = (parametres && parametres.commandes) ? (parametres.commandes.schedule_delay || 15) : 15;

logger.info('⏰', schedule_delay);

    const commandeClient = client ? clients.find(c=>c.client_id===client.client_id) : null;


    // autorise-t-on la vente avec encaissement ultérieur ?
    //  - si la propriété n'est pas définie, on fait comme si elle était TRUE (^^)
    const ventecmd = (parametres && parametres.financier) 
                     ? (parametres.financier.hasOwnProperty('vente_commande') && parametres.financier.vente_commande===false) 
                       ? false 
                       : true 
                     : true;

    logger.info('searchval', searchval);

    // const total = this.calculateTotal(items, modificateurs);
    let {total, remisepanier} = this.calculeTotaux(items, modificateurs, monnaie.symbole);
    total = total / 100;
    const devisemonnaie = monnaie.symbole;
    const { selectedIndex, selectedIngredient } = this.state;

    const { staffmeal_active, staffmeal_modifier } = parametres.options;


    logger.info(`index:${selectedIndex}, ingIndex:${selectedIngredient}`);


    /* GESTION DE LA PERSONNALISATION */
    let __encaissable = true;
    // aucun item dans la commande -> btn 'encaissement'/'valider' inactif
    if (undefined===items || items.length===0) {
      __encaissable = false;
    } 
    // s'il y a des items dans la commande
    else {
      
      // vérifie si un item est 'pending'
      // si c'est le cas, le bouton 'encaissement'/'valider' est inactif
       const __pendingItem = items.find(item => item.status==='pending');
       if (__pendingItem) {
         __encaissable = false;
       }
    }

    
    // gestion du focus sur le champ de recherche (scan QR code)
    clearInterval(this.interval);

    logger.info('inputfocus',inputfocus);
    
    const self = this;
    // if (inputfocus && (!items || items.length===0)) {      
    if (inputfocus) {      
      this.interval = setInterval(() => {
        if (self.refs.searchInput) self.refs.searchInput.focus();
       },500);
    } else {
      clearInterval(this.interval);
      this.interval = 0;
    }
    


    
    // const onClickAction = (value) => { logger.info(`Action: ${value}`) };

    const onClickAdd = (event) => {
      updateProduit({itemid: items[selectedIndex].itemid, quantite: items[selectedIndex].quantite + 1, addPrd: true});
    }
    const onClickRemove = (event) => {
      let __i = selectedIndex;
      if (items[selectedIndex].quantite===1) this.setSelectedIndex(-1, -1);
      updateProduit({itemid: items[__i].itemid, quantite: items[__i].quantite - 1, addPrd: false});
    }
    const onClickDelete = (event) => {
      Swal.fire({
        type: 'warning',
        title: strings.modules.encaissement.panier.messages.delete.titre,
        html: strings.modules.encaissement.panier.messages.delete.texte,
        showCancelButton: true,
        focusCancel: true,
        focusConfirm: false
      }).then((result)=> {
        if (result.value) {
          this.setSelectedIndex(-1, -1);
          this.setState({inputfocus: true});
          deleteCommande();
          log('320', 'abandon de la commande en cours');
        }
      });
    }

    const gotoEncaissement = () => {
      Swal.fire({
        title: 'Avez-vous une carte de fidélité ?',
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'encaissementPopin',
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        buttonsStyling: false 
      }).then((result)=> {
        if (result.value) {
          showFidcard();
        } else {
          askFidcard();
        }
      });
    }
    
    const askFidcard = () => {
      Swal.fire({
        title: 'Vous voulez avoir une carte de fidélité ?',
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'askfidcardPopin',
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        buttonsStyling: false 
      }).then((result)=> {
      //  history.push(paths.ENCAISSEMENT);
      });
    }
    
    const showFidcard = () => {
      Swal.fire({
        title: 'Bonjour Édouard !',
        text: 'Voulez-vous...',
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'showfidcardPopin',
        confirmButtonText: 'Une nouvelle commande',
        cancelButtonText: 'Comme la dernière fois',
        buttonsStyling: false 
      }).then((result)=> {
      //  history.push(paths.ENCAISSEMENT);
      });
    }



    // affichage de la popin "carte de fidelite" si la fidélité est activée
    if (null!==parametres && parametres.hasOwnProperty("financier") && parametres.financier.fidelite_activation) {      

      logger.info('fidelite_Activation', parametres.financier.fidelite_activation);
      if (undefined === items || items.length===0) gotoEncaissement();
    }


    const attenteHandler = (event) => {
      this.setState({inputfocus:true, selectedIndex:-1, selectedIngredient:-1});
      standByCommande(this.props.commande, !this.props.commande.numero);
    }
    const validationHandler = (event) => {
   //   logger.info('validationHandler commande numero :', this.props.commande.numero);
      this.setState({inputfocus:true, selectedIndex:-1, selectedIngredient:-1, cmdMode:null});
      if (this.props.commande.mode==="livraison") updateCommande({});
      validateCommande(this.props.commande, !this.props.commande.numero);
    }


    const tiroirHandler = (event) => {
      openDrawer();
    }

    const openReglementHandler = () => {
      if (!this.props.commande.numero) this.props.getNumero();
      this.setState({inputfocus:true, selectedIndex:-1, selectedIngredient:-1, cmdMode:null});
      openReglement();
    }
    

    const getDiscount = (item) => {

      if (null===modificateurs || (modificateurs && modificateurs.length<1)) return null;

      let __itemtotal = item.quantite * item.prix;
      let __montant;
      const __moditem = modificateurs.find(m=>m.item===item.itemid && m.ingredient===null);
      if (__moditem) {


        const ispc = String(__moditem.valeur).includes("%");
        const val = Math.abs(ispc 
          ? Number(String(__moditem.valeur).slice(0, -1))
          : Number(String(__moditem.valeur).slice(0, -monnaie.symbole.length))
        );

        __montant = ispc ? __itemtotal*(val/100) : val
        
        logger.info('geDiscount', item.itemid)
      }
      return __moditem ? {...__moditem, montant: devise(__montant)} : null;
    }


    const getPanierDiscount = () => {

      if (null===modificateurs || (modificateurs && modificateurs.length<1)) return null;

      const __modpanier = (modificateurs && modificateurs.length) ? modificateurs.find(m=>m.item===null && m.ingredient===null) : null;
  
      return __modpanier ? {...__modpanier, montant: devise(remisepanier / 100)} : null;
    }

    const modif_panier = getPanierDiscount();


    // si la caisse se met en blocage,
    // on redirige immédiatement vers le Dashboard 
    // (avec le bouton 'encaissement' grisé)
    if (blocage_encaissement) {
      history.push(paths.DASHBOARD);
    }

    // on déplace les frais de gestion à la fin de l'array
    if (items.findIndex(e=>e.produitid==='frais')>-1) {
      items.push(items.splice(items.findIndex(e=>e.produitid==='frais'), 1)[0]);
    }
 
    return (
      <div className={ `Panier ${open && 'reglement-ouvert'}` }>
        <div className="header">
          {/* <div className="ticketId">{ (this.interval==0?'X':'√')+strings.modules.encaissement.panier.ticket_no+' '+ticketId }</div> */}
          <div className="ticketId">{ strings.modules.encaissement.panier.ticket_no+' '+_.last(ticketId.split('-')) }</div>
          <div className="ticketComment"></div>
       {/*   <div className="gift">
            <GiftIcon className={`ico-gift ${((this.props.commande.gift!==null && this.props.commande.gift!==undefined)?'gift-set':'')}`} onClick={this.openGiftIinput} />
          </div>
    */}
          <div className="schedule">
            <AlarmIcon className={`ico-schedule ${((this.props.commande.scheduled!==null && this.props.commande.scheduled!==undefined)?'schedule-set':'')}`} onClick={this.openSchedule} />
          </div>
          {gestion_bippers && (<Badge className="bipper" badgeContent={bipper} max={999} color="primary">
              <BellIcon className={`ico-bipper ${((bipper!==null && bipper!==undefined)?'bipper-set':'')}`} onClick={this.openBippers} />
            </Badge>)}
          {gestion_tables && (<div className="tablesList">
            <TableIcon className={`ico-tables ${(tableId?'tables-set':'')}`} onClick={this.openTables} />
          </div>)}
          <div className="ticketClient">
            <AccountBoxIcon className={`ico-client ${client?'client-set':'anonymous'}`} onClick={this.openFicheClient} />
          </div>
        </div>
        <div className="body">
          <input className="search-input" ref="searchInput" onKeyUp={this.searchHandler} />
          <div className="PanierListe">
            <div className="Liste">
              <div className="liste-header">
                <div className="lhdr lhdr-nom">{ strings.modules.encaissement.panier.liste.nom }</div>
                <div className="lhdr lhdr-quantite">{ strings.modules.encaissement.panier.liste.quantite }</div>
                <div className="lhdr lhdr-prix">{ strings.modules.encaissement.panier.liste.prix }</div>
              </div>
              <div 
                className="wrapper" 
                ref={(element) => { this.listewrapper = element; }}
              >
                  <List
                    disablePadding
                  >
                  { (undefined !== items) &&
                    items.map((itm,i) => 
                      (undefined!==itm) && <PanierListeItem
                          id={ i } 
                          itemid={ itm.itemid.toString() }
                          key={ i }
                          produitid={ itm.produitid }
                          nom={ itm.nom }
                          quantite={ itm.quantite }
                          // prix={ itm.prix }
                          prix={ itm.pu*itm.quantite }
                          disabled={ itm.paid }
                          commentaire={ itm.commentaire!=='' }
                          getComment={ this.getComment }
                          removeComment= { this.removeComment }
                          selected={ selectedIndex===i }
                          selectedIng={ selectedIngredient }
                          composition={ itm.composition }
                          ingredients={ itm.ingredients }
                          steps={ itm.steps }
                          discount={ getDiscount(itm) }
                          deleteDiscountHandler={deleteDiscount}
                          openDiscountHandler={this.openDiscount}
                          _onClick={() => { 
                            if (itm.produitid!=='frais') {
                              this.setSelectedIndex(i);
                            }
                          } }
                          _onDoubleClick={ (id) => {
                            let __prevstepid = -1;
                            let __nextstepid = (itm.steps.length>1) ? itm.steps[1].id : -1;
                            this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid:null});
                            this.props.openPersonnalisation(itm.itemid.toString(), itm.steps[0].id, __prevstepid, __nextstepid, itm.steps[0].validated, itm.status, 'item');
                          }}
                          _onSubClick={ this.setSelectedIngredient }
                          _onSubDoubleClick={ (stepid) => { 
                            logger.info('_onSubDoubleClick', stepid);
                            let __step = itm.steps.find(s=>s.id===stepid);
                            let __stepIndex = itm.steps.findIndex(s=>s.id===stepid);
                            let __previd = (__stepIndex===0) ? -1 : itm.steps[__stepIndex-1].id;
                            let __nextid = (__stepIndex>=itm.steps.length-1) ? -1 : itm.steps[__stepIndex+1].id;
                            this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid: stepid});
                            this.props.openPersonnalisation(itm.itemid.toString(), stepid, __previd, __nextid, __step.validated, itm.status, 'item');
                          }} 
                          commandetype={ type }/>
                  )}
                  {modif_panier && <div className="separateur"></div>}
                  {modif_panier && <DiscountListItem
                      className="panier-discount"
                      nom={modif_panier.nom||''}
                      valeur={modif_panier.valeur}
                      id={modif_panier.modificateur_id}
                      montant={modif_panier.montant}
                      operation={modif_panier.operation}
                      type={modif_panier.type}
                      onClick={this.openDiscount}
                      deleteHandler={deleteDiscount}
                      discountsurvente={ type==="vente" }
                    />
                  }
                  {(this.props.commande.gift && !this.isGiftSet()) && <DiscountListItem
                    className={ (total>=this.props.commande.gift.totalMin) ? "pending-gift" : "nonactivable-gift" }
                    nom={gift.nom}
                    valeur=''
                    id={gift.gift_id}
                    montant='0'
                    operation={ -1 }
                    type={ 'gift' }
                    onClick={() => { if (total>=this.props.commande.gift.totalMin) openGiftSelector();}}
                    deleteHandler={ null }
                    discountsurvente={ type==="vente" }
                  />
                }
                  </List>
              </div> {/* /.wrapper */}
              <div className="tools">
                <Fab aria-label="add" size="small" className="tool plus" disabled={selectedIndex===-1 || open} onClick={onClickAdd}>
                  <PlusIcon htmlColor="#1EA9DF" />
                </Fab>
                <Fab aria-label="remove" size="small" className="tool remove" disabled={selectedIndex===-1 || open} onClick={onClickRemove}>
                  <MinusIcon htmlColor="#1EA9DF" />
                </Fab>
                <Fab aria-label="discount" size="small" className="tool discount" disabled={open || (type==='staffmeal')} onClick={this.openDiscount}>
                  <DiscountIcon />
                </Fab>
                <Fab aria-label="comment" size="small" className="tool comment" disabled={open} onClick={this.openComment}>
                  <CommentIcon />
                </Fab>
                <Fab aria-label="delete" size="small" className="tool delete" disabled={ undefined===items || items.length===0 || open } onClick={onClickDelete}>
                  <CrossIcon />
                </Fab>
              </div>
            </div> {/* /.Liste */}
            <div className="total">
                <div className="intitule">{ strings.modules.encaissement.panier.liste.total }</div>
                <div className="montant">{ `${total.toFixed(2).replace('.',',')} ${devisemonnaie}` }</div>
            </div>
          </div> {/* /.PanierListe */}

        </div>
        <div className="footer">
          <div className="modes">
            <StdButton identifier='surplace' elementclass={ `mode mode-surplace ${(('surplace'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.surplace } onClick={(value) => { updateMode(value) }} />
            <StdButton identifier='emporter' elementclass={ `mode mode-emporter ${(('emporter'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.emporter } onClick={(value) => { updateMode(value) }} />
            <StdButton identifier='livraison' elementclass={ `mode mode-livraison ${(('livraison'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.livraison } onClick={(value) => { updateMode(value) }} />
          </div>
          <div className={ `actions${ ((staffmeal_active && staffmeal_modifier) ? ' with-staffmeal' : '' ) }` }>
            <StdButton identifier='encaisser' elementclass={ `action action-encaisser${(ventecmd ? ' action-mid' : '')}` } disabled={ !__encaissable || open } icon={ false } text={ strings.modules.encaissement.panier.action.encaissement } onClick={ ()=> { openReglementHandler() }} />
            {(ventecmd) && (<StdButton identifier='valider' elementclass={ `action action-valider action-mid` } disabled={ !__encaissable || open || (type==='staffmeal') } icon={ false } text={ strings.modules.encaissement.panier.action.valider } onClick={ ()=> { validationHandler() }} /> )}
            <StdButton identifier='tiroir' elementclass="action action-tiroir" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.tiroir } onClick={ tiroirHandler } />
            {(staffmeal_active && staffmeal_modifier) && (<StdButton identifier='staffmeal' elementclass={ `action action-staffmeal${(type==="staffmeal" ? " activated" : "")}` } icon={ <EmployeIcon htmlColor="#ffffff" /> } disabled={ open || open } text={ '' } onClick={ () => { this.setStaffmeal() } } />)}
            <StdButton identifier='attente' elementclass="action action-attente" icon={ false } disabled={ !__encaissable || open || (type==='staffmeal') } text={ strings.modules.encaissement.panier.action.attente } onClick={ attenteHandler } />
            <StdButton identifier='reprise' elementclass="action action-reprise" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.reprise } onClick={gotoListeCommandes} />
          </div>
        </div>
        <CommentModal 
          open={commentOpen} 
          closeHandler={this.closeComment} 
          saveHandler={this.saveComment}
          deleteHandler={deleteComment}
          commentid={commentId} 
          item={commentItemId} 
          commenttexte={ commentTexte }
          ingredient={commentIngredientId}
          cmtlib={ cmtlib }
          clavierOpen={ clavierOpen }
          />
        <DiscountModal 
          open={discountOpen} 
          closeHandler={this.closeDiscount} 
          saveHandler={this.saveDiscount}
          deleteHandler={deleteDiscount}
          discountid={discountId} 
          item={discountItemId} 
          discountval={ discountVal }
          discountnom={ discountNom }
          ingredient={discountIngredientId}
          dsclib={ dsclib }
          />
        <BipperModal
          open={bippersOpen}
          closeHandler={this.closeBippers}
          selectBipper={this.selectBipper}
          bipper={bipper}
          />
        <FicheClientCont open={ficheClientOpen} clavierOpen={ clavierOpen } client={commandeClient} mode={commandeClient?'fiche':'recherche'} contexte="encaissement" closeHandler={this.closeFicheClient} selectClient={this.selectClient} scheduled={this.props.commande.scheduled} openSchedule={this.openSchedule} />
        <ScheduleModal
          open={ scheduleOpen }
          closeHandler={ this.closeSchedule }
          deleteSchedule={ this.deleteSchedule }
          saveSchedule={ this.setSchedule }
          schedule={this.props.commande.scheduled}
          delai={schedule_delay}
          heure_fin={parametres.heure_fin}
        />
        <MouvementPopin 
          open={ ouvertureOpen } 
          type={ "ouverture" } 
          mouvement={ {lastMontant: solde} } 
          caisse={ caisse }
          caisses={ [] }
          closeHandler={ this.closeOuverture }
          saveMouvement={ this.addOuverture }
          symbolemonnaie={ monnaie.symbole }
        />
        {(staffmeal_active && staffmeal_modifier) && (<BeneficiaireModal closePopin={ this.cancelStaffmeal } getBeneficiaire={ this.getBeneficiaire } open={ type==="staffmeal" && !beneficiaire } />)}
        <CmdModeModal
          open={ cmdModeOpen }
          setMode={ this.setCmdMode }
          closePopin={ this.closeCmdMode }
        />
     {/*   <GiftInputModal
          open={giftOpen}
          code={giftCode}
          closeHandler={ this.closeGiftIinput }
          submitHandler={ searchGift }
          clavierOpen={ clavierOpen }
      />*/}
      </div>
    );
  }
}

export default Panier;
  
Panier.propTypes = {
  commande: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
  parametres: PropTypes.object,
  getCommande: PropTypes.func,
  getParametres: PropTypes.func,
  getListeCommandes: PropTypes.func,
  updateCommande: PropTypes.func,
  standByCommande: PropTypes.func,
  validateCommande: PropTypes.func,
  deleteCommande: PropTypes.func,
  updateProduit: PropTypes.func,
  gotoListeCommandes: PropTypes.func,
  openDrawer: PropTypes.func
}


function DiscountListItem (props) {
  const {valeur, montant, nom, id, type, operation, onClick, className, deleteHandler, discountsurvente=true} = props;

  const deleteDiscount = () => {
    logger.info('deleteDiscount',id);

    Swal.fire({
      title: strings.modules.encaissement.discount.suppression.titre,
      html: strings.modules.encaissement.discount.suppression.texte,
      focusConfirm: true,
      showCancelButton: true,
      customClass: 'deleteconfirm',
      confirmButtonText: strings.general.dialog.delete,
      cancelButtonText: strings.general.dialog.cancel,
      buttonsStyling: false 
    })
    .then((result) => {
      if (result.value) {
        deleteHandler({discountId:id});
      }
    });
  }

  const modtype = (type==="discount" || type==="gift") 
  ? "type-discount" 
  : (
    operation>0 
    ? "type-frais" 
    : "type-regle"
    )
  ;

  logger.info('discount id', id, operation);

  return (
    <ListItem className={ `discount ${className||''} ${modtype}` }>
     <ListItemText primary={`${(nom ? nom : valeur)}`} onClick={() => { type==="discount" || type==="gift" ? onClick() : void(0);}} />
      <ListItemSecondaryAction>
        <ListItemIcon onClick={() => {type==="discount" ? deleteDiscount() : void(0);} }>
          {(discountsurvente && type==="discount") && (<DeleteIcon />)}
          {(className==='pending-gift' || className==='nonactivable-gift') && (<GiftIcon />)}
        </ListItemIcon>
        {(className!=='pending-gift' && className!=='nonactivable-gift' && <ListItemText primary={`${(operation<0 ? '-' : '+')}${montant}`} />)}
      </ListItemSecondaryAction>
    </ListItem>
  );
}


class PanierListeItem extends React.Component {

 
  render() {
    const {id, itemid,  produitid, nom, quantite, prix, selected, discount, deleteDiscountHandler, openDiscountHandler, selectedIng, disabled, ingredients, composition, getComment, removeComment, steps, _onClick, _onDoubleClick, _onSubClick, _onSubDoubleClick, commandetype} = this.props;


    // logger.info('item discount', discount);
    // logger.info('item compo', composition)

    let timer = 0;
    let prevent = false;
  
    const handleClick = () => {
      timer = setTimeout(() => {
        if (!prevent) {
          _onClick(id);
        }
        prevent = true;
      }, 200);
    }
    const handleDoubleClick = () => {
      clearTimeout(timer);
      prevent = true;
      _onDoubleClick(id);
    }

    // on définit la liste des ingrédients à partir de l'ordre des steps de personnalisation de l'item
    // (pour exclure les ingrédients non personnalisables et conserver l'ordre des steps)
    let customIng = [...composition];
    // let i =  -1;
    if (steps) {
      steps.forEach(stp => {
        let ing = ingredients.filter(ingrd => ingrd.fromStep===stp.id);
        
        // s'il n'y a aucun ingrédient pour le step,
        // on ajoute un item "aucun" pour permettre d'ouvrir la popin de personnalisation pour ce step
        // if (0==ing.length) {
          
        //   ing = [{
        //     fromStep: stp.id,
        //     ingredient: i--,
        //     nom: strings.modules.encaissement.personnalisation.aucun,
        //     qte: 0,
        //     prix: 0
        //   }];
        // }

        // s'il y a un ingrédient pour le step, on l'ajoute
        if (ing.length>0) {  
          customIng = [...customIng, ...ing];
        }
      });
    }

    const comment = getComment(itemid);

    return (
      <div className={`PanierListeItem${(produitid==='frais' ? ' PanierListeItem-frais' : '')}`} key={`pli-${id}`}>
        <ListItem 
          button 
          disableGutters
          selected={ selected && selectedIng===-1 }
          disabled={ disabled }
          onClick={ handleClick }
          onDoubleClick={ handleDoubleClick }
          key={`lpli-${id}`}
          >
          <div className="litm row">
            { /*<div className="nom">{ `${nom} (${itemid.substr(0,5)})` }</div> */ }
            <div className="nom">{ `${nom}` }</div> 
            <div className="quantite">{ (produitid!=='frais' ? quantite : '') }</div> 
            <div className="prix">{ `${(produitid==='frais' ? '+ ' : '')}${prix.toFixed(2).replace('.',',')}` }</div>
          </div>
          {comment && <div className="litm-comment">{ `* ${comment} *` }<div className="cmtdel" onClick={()=>{removeComment(itemid)}}><CommentRemoveIcon htmlColor="#FF2D55" /></div></div>}
        </ListItem>
      {customIng.length>0 && (
        <div className="litm ingredients-list">
          {customIng.map((ing, i) => ( 
            <PanierListeSubItem 
              nom={ ing.nom }
              quantite={ ing.qte } 
              prix={ Number(ing.supplement) || 0 }
              ingredient={ ing.ingredient }
              produitIndex={ id }
              ingredientIndex={ i }
              fromStep={ ing.fromStep }
              comment={ getComment(itemid, ing.ingredient) }
              _key={ `itm${itemid}-ing${ing.ingredient}` }
              key={ `citm${itemid}-ing${ing.ingredient}` }
              _selected={ selectedIng===i && selected }
              _disabled={ disabled }
              _onClick={ _onSubClick }
              _onDoubleClick={ (ing.fromStep!==null) ? _onSubDoubleClick : null }
              _removeComment={()=>{removeComment(itemid, ing.ingredient)}}
            />
          ))}
        </div>
      )}
      {discount && <DiscountListItem 
        className="item-discount"
        valeur={ discount.valeur }
        montant={ discount.montant }
        id={ discount.modificateur_id }
        onClick={ openDiscountHandler }
        type={ discount.type }
        nom={ discount.nom }
        operation={ discount.operation }
        deleteHandler={ deleteDiscountHandler }
        discountsurvente={commandetype==="vente" }
      />}
      </div>
    );
  }
}

PanierListeItem.propTypes = {
  id: PropTypes.number.isRequired,
  itemid: PropTypes.string.isRequired,
  produitid: PropTypes.string.isRequired,
  nom: PropTypes.string.isRequired,
  quantite: PropTypes.number,
  prix: PropTypes.number,
  commentaire: PropTypes.bool,
  selected: PropTypes.bool,
  composition: PropTypes.array,
  ingredients: PropTypes.array,
  _onClick: PropTypes.func,
  _onSubClick: PropTypes.func
};

class PanierListeSubItem extends React.Component {

  render() {
    const { nom, quantite, prix, ingredient, produitIndex, ingredientIndex, comment, fromStep, _key, _selected, _disabled, _onClick, _onDoubleClick, _removeComment } = this.props;

    let timer = 0;
    let prevent = false;
  
    const handleClick = () => {
      timer = setTimeout(() => {
        if (!prevent) {
          _onClick(produitIndex, ingredientIndex, ingredient);
        }
        prevent = true;
      }, 200);
    }
    const handleDoubleClick = () => {
      clearTimeout(timer);
      prevent = true;
      if (_onDoubleClick!==null) {        
        _onDoubleClick(fromStep);
      }
    }

    return (
      <ListItem
        button
        disableGutters
        selected={_selected}
        disabled={_disabled}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        key={_key}
        className={ `lsitm-${(fromStep===null ? 'compo' : 'ing')}` }
      >
      <div className="lsitm row">
        <div className="nom">{ nom }</div>
        <div className="quantite">{ quantite }</div>
        <div className="prix">{ prix.toFixed(2).replace('.',',') }</div>
      </div>
      {comment && <div className="lsitm-comment">{ `* ${comment} *` }<div className="cmtdel" onClick={_removeComment}><CommentRemoveIcon htmlColor="#FF2D55" /></div></div>}
    </ListItem>
    );
  }

}