import React from 'react';
import PropTypes from 'prop-types';

import StdButton from '../common/StdButton';

import { List, ListItem, Fab, Modal, TextField, ListItemText, ListItemIcon, ListItemSecondaryAction, Badge } from '@material-ui/core';
import Swal from 'sweetalert2';
import _ from 'lodash';

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
import {devise} from '../../helpers/toolbox';
import TableIcon from '../common/icon/TableIcon';
import BellIcon from '../common/icon/BellIcon';
import Logger from '../../helpers/Logger';
import CommentRemoveIcon from '../common/icon/CommentRemoveIcon';
import NumberKeyboard from '../common/NumberKeyboard';

import history from '../../helpers/history';
import paths from './../../constants/routes.json';

import { decodetable } from '../../constants/decodetable';
import MouvementPopin from '../Cloture/MouvementPopin';
import EmployeIcon from '../common/icon/EmployeIcon';
import LoginCont from '../../containers/LoginCont';
import { dateBounds } from '../../helpers/toolbox';

let strings = new LocalizedStrings(data);
const logger = new Logger();



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

    logger.log('saveComment()');

    this.props.saveHandler(commentid, item, ingredient, texte);
    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({texte:null});
  }
  changeHandler(event) {
   // logger.log('CommentModal.changeHandler()', event.target.value);
    this.setState({texte:String(event.target.value).toUpperCase()});
  }
  setComment(message) {
    const { texte } = this.state;
    let newtexte = (texte===null) ? '' : texte+', ';
    this.setState({texte: newtexte+message});
  }



  onKeyboardChange(input) {
    this.setState({ texte:input });
    logger.log("Comment Input changed", input);
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
      valeur: null
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
    const { valeur } = this.state;

    logger.log('saveDiscount()');

    this.props.saveHandler(discountid, item, ingredient, valeur);
    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({valeur:null});
  }
  changeHandler(event) {
   // logger.log('CommentModal.changeHandler()', event.target.value);
    this.setState({valeur:Math.abs(event.target.value)});
  }
  setDiscount(valeur) {
    // const { valeur } = this.state;
    // let newvaleur = (valeur===null) ? '' : texte+', ';
    this.setState({valeur: valeur});
  }
  render() {

    const { discountid, item, ingredient, dsclib, closeHandler, discountval, open } = this.props;
    const { valeur } = this.state;

    const vvaleur = valeur==null ? discountval : valeur;
    logger.log('discountval', discountval);

    // setTimeout(() => {
    //   if (this.refs.commentInput) this.refs.commentInput.focus();
    // },500);

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
                  <div className="discount-valeur">{ vvaleur }</div>
                  <div className="caption">{ strings.modules.encaissement.discount.caption }</div>
                </div>
            </div>
            <div className="form-group">
              <div className="label">{ strings.modules.encaissement.discount.predefini }</div>
              <div className="choix">
                {dsclib && dsclib.map(dsc=>(
                  <div className="dsclib-item" key={`dsc-${dsc.id}`} onClick={()=>{this.setDiscount(dsc.valeur)}}>{dsc.valeur}</div>
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
      ouvertureOpen: false,
      solde: 0
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

    this.testOuverture = this.testOuverture.bind(this);
    this.openOuverture = this.openOuverture.bind(this);
    this.closeOuverture = this.closeOuverture.bind(this);
    this.addOuverture = this.addOuverture.bind(this);

    this.setStaffmeal = this.setStaffmeal.bind(this);
    this.getBeneficiaire = this.getBeneficiaire.bind(this);
    this.cancelStaffmeal = this.cancelStaffmeal.bind(this);

  }

  lock = false;
  search_tmo = -1;

  componentDidMount() {
    const { 
      getCommande, 
      getParametres, 
      // getListeCommandes, 
      getClientsList, 
      commande, 
      getSallesList 
    } = this.props;
    if (!commande.hasOwnProperty('ticketId')) getCommande();
    // getListeCommandes();
    getParametres();    
    getClientsList();
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
          logger.log('Panier.componentDidUpdate(), modif de personnalisation DEMANDÉE', __forceItem);
          __stepToRun = __forceItem.steps.find(step => step.checked===false );
          __item = __forceItem;
        }
         else if (__pendingItem) {
          logger.log('Panier.componentDidUpdate(), pas de modif de personnalisation', __pendingItem);
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

    const {bippersOpen} = this.state;
    const {parametres} = this.props;
    const gestion_bippers = (parametres && parametres.commandes) ? parametres.commandes.active_bippers : false;
    
    if (!bippersOpen && gestion_bippers && !this.props.commande.hasOwnProperty('bipper')) {
      this.setState({bippersOpen: true});
    }


    // liste panier se cale en bas (sur le dernier produit ajouté)
    this.listewrapper.scrollTop = this.listewrapper.scrollHeight;
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

    logger.log('addOuverture', payload);

    this.props.addTresor(payload);
    this.closeOuverture();
  }

  setSelectedIndex(index) {
    const {selectedIngredient} = this.state;
    if (selectedIngredient===-1) {
      index = index===this.state.selectedIndex ? -1 : index;
    }
    this.setState({selectedIndex: index, selectedIngredient: -1, ingredientid: null})
  }

  // sélection / désélection du subItem
  setSelectedIngredient(index,ingidx, ingId) {
    logger.log(`setSelectedIngredient(${index}, ${ingidx})`)
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

  calculateTotal(items, modificateurs) {
    let __total = 0;
    if (undefined!==items) {
      items.forEach(itm => {

        let __itemtotal = itm.quantite * itm.prix;
        
        // modificateur sur l'item
        const __moditem = (modificateurs && modificateurs.length) ? modificateurs.find(m => m.item===itm.itemid && m.ingredient===null) : null;
        if (__moditem) {
          const ispc = String(__moditem.valeur).substr(-1,1)==='%';
          const val = Math.abs(Number(String(__moditem.valeur).slice(0,-1)));
          if (ispc) {
            __itemtotal *= (100 - val) / 100;
          } else {
            __itemtotal -= val;
          }
        }
        __total += __itemtotal;
      });
    }




    // modificateur sur le panier entier
    const modpanier = (modificateurs && modificateurs.length) ? modificateurs.find(m => m.item===null && m.ingredient===null) : null;
    if (modpanier) {
      const ispc = String(modpanier.valeur).substr(-1,1)==='%';
      const val = Math.abs(Number(String(modpanier.valeur).slice(0,-1)));
      if (ispc) {
        __total *= (100 - val) / 100;
      } else {
        __total -= val;
      }
    }
    

    return __total;
  }


  searchHandler(event) {
    if (event.keyCode===13) {
      logger.log(event.target.value);
      this.decodeQRCode(event.target.value);
      event.target.value = '';
    }    
  }
  decodeQRCode(value) {

    const platform = process.platform==='darwin' ? 'darwin' : 'win';

    let decoded = '';
    for (let caractere of value) {
      if (!decodetable[platform].hasOwnProperty(caractere)) {
        continue;
      }
      decoded += decodetable[platform][caractere];
    }
    if (String(decoded).length>0) {
      this.send_to_search(decoded);
    }
    return false;
  }


  // TODO : faire une requête plutôt que charger la liste des commandes
  // pbm : latence de l'encaissement si on met à jour la liste des commandes
  send_to_search(value) {
    logger.log('send_to_search',value);
    const {commandeslist } = this.props;

    if (commandeslist) {
      const cmd = Object.values(commandeslist).find((c)=>c.ticketId===value);
      logger.log('s2s', cmd);
      if (cmd && cmd.status==='standby') {
        this.setState({inputfocus: false});
        this.props.getCommande(value);
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
    if (discountid===null) {
      this.props.addDiscount({
        item: itemid,
        ingredient: ingredientid,
        valeur: valeur,
        nom: nom
      });
    } else {
      this.props.updateDiscount({
        discountId: discountid, 
        valeur: valeur,
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

    logger.log('openComment selectedIngredient', selectedIngredient);

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
    console.log('removeComment', itemid, ingredientid);
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
    logger.log('openTables()');
  }
  closeTables() {
    logger.log('closeTables()');
  }
  selectTables() {
    logger.log('selectTables()');
  }


  openBippers() {
    logger.log('openBippers()');
    this.setState({bippersOpen: true});
  }
  closeBippers() {
    logger.log('closeBippers()');
    this.setState({bippersOpen: false});
  }
  selectBipper(bipperId) {
    logger.log('selectBipper('+bipperId+')');
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


    logger.log('query staffmeal','{$and:[{type:"staffmeal"}, {createdAt:{$gt:'+debut+'}}, {"beneficiaire.id":"'+id+'"}]}');

    const daily_staffmeal = await getCommandesList({
      $and:[
        { type: 'staffmeal' },
        { 'beneficiaire.id': id },
        { createdAt: { $gt: debut } }
      ]
    });

    logger.log('daily_staffmeal', daily_staffmeal);

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

  interval = 0;

  render() {

    const { updateProduit, 
            updateCommande, 
            standByCommande, 
            livraisonCommande, 
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
           } = this.props;

    const { comments, modificateurs, items, ticketId, mode, client, bipper, type, beneficiaire } = this.props.commande;
    
    const {inputfocus, searchval, 
           commentOpen, commentId, commentItemId, commentIngredientId,
           discountOpen, discountId, discountItemId, discountIngredientId,
           ficheClientOpen,
           clavierOpen,
           bippersOpen,
           ouvertureOpen,
           solde,
          } = this.state;

    // récup du texte en fonction de l'id du commentaire (s'il est défini)
    let commentTexte = (commentId!==null) ? comments.find(cmt=>cmt.comment_id===commentId).texte : '';

    // choix de messages prédéfinis pour les commentaires :
    const cmtlib = (parametres && parametres.commandes) ? parametres.commandes.comment_predefini : [];

    // récup de la valeur en fonction de l'id du discount (s'il est défini)
    const discountVal = (discountId!==null) ? modificateurs.find(dsc=>dsc.modificateur_id===discountId).valeur : '';
    // choix de discounts prédéfinis pour les discounts :
    const dsclib = (parametres && parametres.commandes) ? parametres.commandes.discount_predefini : [];
    // gestion de tables :
    const gestion_tables = (parametres && parametres.commandes) ? parametres.commandes.gestion_tables : false;
    const tableId = null;
    
    const gestion_bippers = (parametres && parametres.commandes) ? parametres.commandes.active_bippers : false;
    

    const commandeClient = client ? clients.find(c=>c.client_id===client.client_id) : null;


    // autorise-t-on la vente avec encaissement ultérieur ?
    //  - si la propriété n'est pas définie, on fait comme si elle était TRUE (^^)
    const ventecmd = (parametres && parametres.financier) 
                     ? (parametres.financier.hasOwnProperty('vente_commande') && parametres.financier.vente_commande===false) 
                       ? false 
                       : true 
                     : true;

    logger.log('searchval', searchval);

    const total = this.calculateTotal(items, modificateurs);
    const devisemonnaie = '€';
    const { selectedIndex, selectedIngredient } = this.state;

    const { staffmeal_active, staffmeal_modifier } = parametres.options;


    logger.log(`index:${selectedIndex}, ingIndex:${selectedIngredient}`);


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

    logger.log('inputfocus',inputfocus);
    
    const self = this;
    if (inputfocus && (!items || items.length===0)) {      
      this.interval = setInterval(() => {
        if (self.refs.searchInput) self.refs.searchInput.focus();
       },500);
    } else {
      clearInterval(this.interval);
      this.interval = 0;
    }
    


    
    // const onClickAction = (value) => { logger.log(`Action: ${value}`) };

    const onClickAdd = (event) => {
      updateProduit({itemid: items[selectedIndex].itemid, quantite: items[selectedIndex].quantite + 1});
    }
    const onClickRemove = (event) => {
      let __i = selectedIndex;
      if (items[selectedIndex].quantite===1) this.setSelectedIndex(-1, -1);
      updateProduit({itemid: items[__i].itemid, quantite: items[__i].quantite - 1});
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

      logger.log('fidelite_Activation', parametres.financier.fidelite_activation);
      if (undefined === items || items.length===0) gotoEncaissement();
    }


    const attenteHandler = (event) => {
    //  if (!this.props.commande.numero) this.props.getNumero();
      this.setState({inputfocus:true, selectedIndex:-1, selectedIngredient:-1});
      standByCommande(this.props.commande, !this.props.commande.numero);
    }
    const validationHandler = (event) => {
    //  if (!this.props.commande.numero) this.props.getNumero();
   //   logger.log('validationHandler commande numero :', this.props.commande.numero);
      this.setState({inputfocus:true, selectedIndex:-1, selectedIngredient:-1});
      livraisonCommande(this.props.commande, !this.props.commande.numero);
    }

    // const repriseHandler = (event) => {
    //   gotoListeCommandes();
    // }

    const tiroirHandler = (event) => {
      openDrawer();
    }

    const openReglementHandler = () => {
      if (!this.props.commande.numero) this.props.getNumero();
      this.setState({inputfocus:true, selectedIndex:-1, selectedIngredient:-1});
      openReglement();
    }


    const getDiscount = (item) => {

      if (null===modificateurs || (modificateurs && modificateurs.length<1)) return null;

      let __itemtotal = item.quantite * item.prix;
      let __montant;
      const __moditem = modificateurs.find(m=>m.item===item.itemid && m.ingredient===null);
      if (__moditem) {

        const ispc = String(__moditem.valeur).substr(-1,1)==='%';
        const val = Math.abs(Number(String(__moditem.valeur).slice(0,-1)));
        __montant = ispc ? __itemtotal*(val/100) : val
        
        logger.log('geDiscount', item.itemid)
      }
      return __moditem ? {...__moditem, montant: devise(__montant)} : null;
    }


    const getPanierDiscount = () => {

      if (null===modificateurs || (modificateurs && modificateurs.length<1)) return null;
      let __total = 0;

      if (undefined!==items) {
        items.forEach(itm => {
  
          let __itemtotal = itm.quantite * itm.prix;
          
          // modificateur sur l'item
          const __moditem = (modificateurs && modificateurs.length) ? modificateurs.find(m => m.item===itm.itemid && m.ingredient===null) : null;
          if (__moditem) {
            const ispc = String(__moditem.valeur).substr(-1,1)==='%';
            const val = Math.abs(Number(String(__moditem.valeur).slice(0,-1)));
            if (ispc) {
              __itemtotal *= (100 - val) / 100;
            } else {
              __itemtotal -= val;
            }
          }
          __total += __itemtotal;
        });
      }

      let __montant;
      const __modpanier = (modificateurs && modificateurs.length) ? modificateurs.find(m=>m.item===null && m.ingredient===null) : null;
      if (__modpanier) {

        const ispc = String(__modpanier.valeur).substr(-1,1)==='%';
        const val = Math.abs(Number(String(__modpanier.valeur).slice(0,-1)));
        __montant = ispc ? __total*(val/100) : val;
      }
      return __modpanier ? {...__modpanier, montant: devise(__montant)} : null;
    }

    const modif_panier = getPanierDiscount();


    // si la caisse se met en blocage,
    // on redirige immédiatement vers le Dashboard 
    // (avec le bouton 'encaissement' grisé)
    if (blocage_encaissement) {
      history.push(paths.DASHBOARD);
    }

 
    return (
      <div className={ `Panier ${open && 'reglement-ouvert'}` }>
        <div className="header">
          {/* <div className="ticketId">{ (this.interval==0?'X':'√')+strings.modules.encaissement.panier.ticket_no+' '+ticketId }</div> */}
          <div className="ticketId">{ strings.modules.encaissement.panier.ticket_no+' '+_.last(ticketId.split('-')) }</div>
          <div className="ticketComment"></div>
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
                          disabled={ open }
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
                          _onClick={ this.setSelectedIndex }
                          _onDoubleClick={ (id) => {
                            let __prevstepid = -1;
                            let __nextstepid = (itm.steps.length>1) ? itm.steps[1].id : -1;
                            this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid:null});
                            this.props.openPersonnalisation(itm.itemid.toString(), itm.steps[0].id, __prevstepid, __nextstepid, itm.steps[0].validated, itm.status, 'item');
                          }}
                          _onSubClick={ this.setSelectedIngredient }
                          _onSubDoubleClick={ (stepid) => { 
                            logger.log('_onSubDoubleClick', stepid);
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
                      onClick={this.openDiscount}
                      deleteHandler={deleteDiscount}
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
            <StdButton identifier='surplace' elementclass={ `mode mode-surplace ${(('surplace'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.surplace } onClick={(value) => { updateCommande({mode:value}) }} />
            <StdButton identifier='emporter' elementclass={ `mode mode-emporter ${(('emporter'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.emporter } onClick={(value) => { updateCommande({mode:value}) }} />
            <StdButton identifier='livraison' elementclass={ `mode mode-livraison ${(('livraison'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.livraison } onClick={(value) => { updateCommande({mode:value}) }} />
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
          ingredient={discountIngredientId}
          dsclib={ dsclib }
          />
        <BipperModal
          open={bippersOpen}
          closeHandler={this.closeBippers}
          selectBipper={this.selectBipper}
          bipper={bipper}
          />
        <FicheClientCont open={ficheClientOpen} clavierOpen={ clavierOpen } client={commandeClient} mode={commandeClient?'fiche':'recherche'} contexte="encaissement" closeHandler={this.closeFicheClient} selectClient={this.selectClient} />

        <MouvementPopin 
          open={ ouvertureOpen } 
          type={ "ouverture" } 
          mouvement={ {lastMontant: solde} } 
          caisse={ caisse }
          caisses={ [] }
          closeHandler={ this.closeOuverture }
          saveMouvement={ this.addOuverture }
        />
        {(staffmeal_active && staffmeal_modifier) && (<BeneficiaireModal closePopin={ this.cancelStaffmeal } getBeneficiaire={ this.getBeneficiaire } open={ type==="staffmeal" && !beneficiaire } />)}
      </div>
    );
  }
}

export default Panier;
  
Panier.propTypes = {
  commande: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  parametres: PropTypes.object,
  getCommande: PropTypes.func,
  getParametres: PropTypes.func,
  getListeCommandes: PropTypes.func,
  updateCommande: PropTypes.func,
  standByCommande: PropTypes.func,
  livraisonCommande: PropTypes.func,
  deleteCommande: PropTypes.func,
  updateProduit: PropTypes.func,
  gotoListeCommandes: PropTypes.func,
  openDrawer: PropTypes.func
}


function DiscountListItem (props) {
  const {valeur, montant, nom, id, onClick, className, deleteHandler, discountsurvente=true} = props;

  const deleteDiscount = () => {
    logger.log('deleteDiscount',id);

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

  logger.log('discount id', id);

  return (
    <ListItem className={ `discount ${className||''}` }>
      <ListItemText primary={`${(nom ? nom : valeur)}`} onClick={onClick} />
      <ListItemSecondaryAction>
        <ListItemIcon onClick={deleteDiscount}>
          {discountsurvente && (<DeleteIcon />)}
        </ListItemIcon>
        <ListItemText primary={`-${montant}`} />
      </ListItemSecondaryAction>
    </ListItem>
  );
}


class PanierListeItem extends React.Component {

 
  render() {
    const {id, itemid, nom, quantite, prix, selected, discount, deleteDiscountHandler, openDiscountHandler, selectedIng, disabled, ingredients, composition, getComment, removeComment, steps, _onClick, _onDoubleClick, _onSubClick, _onSubDoubleClick, commandetype} = this.props;


    // logger.log('item discount', discount);
    // logger.log('item compo', composition)

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
      <div className="PanierListeItem" key={`pli-${id}`}>
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
            <div className="nom">{nom}</div> 
            <div className="quantite">{quantite}</div> 
            <div className="prix">{ prix.toFixed(2).replace('.',',') }</div>
          </div>
          {comment && <div className="litm-comment">{ `* ${comment} *` }<div className="cmtdel" onClick={()=>{removeComment(itemid)}}><CommentRemoveIcon htmlColor="#FF2D55" /></div></div>}
        </ListItem>
      {customIng.length>0 && (
        <div className="litm ingredients-list">
          {customIng.map((ing, i) => ( 
            <PanierListeSubItem 
              nom={ ing.nom }
              quantite={ ing.qte } 
              prix={ ing.supplement || 0 }
              ingredient={ ing.ingredient }
              produitIndex={ id }
              ingredientIndex={ i }
              fromStep={ ing.fromStep }
              comment={ getComment(itemid, ing.ingredient) }
              _key={ `itm${itemid}-ing${ing.ingredient}` }
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