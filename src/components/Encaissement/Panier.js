import React from 'react';
import PropTypes from 'prop-types';

import StdButton from '../common/StdButton';

import { List, ListItem, Fab, Modal, TextField, ListItemText, ListItemIcon, ListItemSecondaryAction } from '@material-ui/core';
import Swal from 'sweetalert2';

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
let strings = new LocalizedStrings(data);


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
    const { commentid, item, ingredient, sa } = this.props;
    const { texte } = this.state;

    console.log('saveComment()');

    this.props.saveHandler(commentid, item, ingredient, texte);
    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({texte:null});
  }
  changeHandler(event) {
   // console.log('CommentModal.changeHandler()', event.target.value);
    this.setState({texte:String(event.target.value).toUpperCase()});
  }
  setComment(message) {
    const { texte } = this.state;
    let newtexte = (texte===null) ? '' : texte+', ';
    this.setState({texte: newtexte+message});
  }
  render() {

    const { commentid, item, ingredient, cmtlib, closeHandler, deleteHandler, commenttexte, open } = this.props;
    const { texte } = this.state;

    const vtexte = texte==null ? commenttexte : texte;
    console.log('commenttexte', commenttexte);

    setTimeout(() => {
      if (this.refs.commentInput) this.refs.commentInput.focus();
    },500);

    const __mttl = (ingredient) ? 'titre_ing' : (item) ? 'titre_itm' : 'titre_cmd';

    const readytosave = texte!==null;

    return (
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
                    ref="commentInput"
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
    const { discountid, item, ingredient, sa } = this.props;
    const { valeur } = this.state;

    console.log('saveDiscount()');

    this.props.saveHandler(discountid, item, ingredient, valeur);
    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({valeur:null});
  }
  changeHandler(event) {
   // console.log('CommentModal.changeHandler()', event.target.value);
    this.setState({valeur:Math.abs(event.target.value)});
  }
  setDiscount(valeur) {
    // const { valeur } = this.state;
    // let newvaleur = (valeur===null) ? '' : texte+', ';
    this.setState({valeur: valeur});
  }
  render() {

    const { discountid, item, ingredient, dsclib, closeHandler, deleteHandler, discountval, open } = this.props;
    const { valeur } = this.state;

    const vvaleur = valeur==null ? discountval : valeur;
    console.log('discountval', discountval);

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
      ficheClientOpen: false
    }
    this.setSelectedIndex = this.setSelectedIndex.bind(this);
    this.setSelectedIngredient = this.setSelectedIngredient.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.decodeQRCode = this.decodeQRCode.bind(this);
    this.send_to_search = this.send_to_search.bind(this);
    this.openComment = this.openComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.closeComment = this.closeComment.bind(this);

    this.openDiscount = this.openDiscount.bind(this);
    this.saveDiscount = this.saveDiscount.bind(this);
    this.closeDiscount = this.closeDiscount.bind(this);

    this.openFicheClient = this.openFicheClient.bind(this);
    this.closeFicheClient = this.closeFicheClient.bind(this);
    this.selectClient = this.selectClient.bind(this);
  }

  lock = false;
  search_tmo = -1;

  componentDidMount() {
    const { getCommande, getParametres, getListeCommandes, getClientsList } = this.props;
    getCommande();
    getListeCommandes();
    getParametres();    
    getClientsList();
  }
  componentDidUpdate() {
    const { items } = this.props.commande;

    // s'il y a des items dans la commande
    if (undefined!==items && items.length>0) {
      
        // vérifie si un item est 'pending'
        // si c'est le cas, on ouvre la Personnalisation avec le premier step non complet
        
        const __pendingItem = items.find(item => item.status==='pending');
        const __forceItem = (this.props.forcePersonnalisationItem) ? items.find(item => item.itemid===this.props.forcePersonnalisationItem) : null;
        // le prochain step que l'on affiche est celui qui n'a pas encore été revu
        let __stepToRun = null;
        let __item = null;
        if (__forceItem) {
          console.log('Panier.componentDidUpdate(), modif de personnalisation DEMANDÉE', __forceItem);
          __stepToRun = __forceItem.steps.find(step => step.checked===false );
          __item = __forceItem;
        }
         else if (__pendingItem) {
          console.log('Panier.componentDidUpdate(), pas de modif de personnalisation', __pendingItem);
          __stepToRun = __pendingItem.steps.find(step => step.checked===false );
          __item = __pendingItem;
        }

        if (__stepToRun) {
          // id du step précédent et suivant
          let __stepIndex = __item.steps.findIndex(s=>s.id==__stepToRun.id);
          let __previd = (__stepIndex<=0 ) ? -1 : __item.steps[__stepIndex-1].id;
          let __nextid = (__stepIndex>=__item.steps.length-1 ) ? -1 : __item.steps[__stepIndex+1].id;
          this.props.openPersonnalisation(__item.itemid, __stepToRun.id, __previd, __nextid, __stepToRun.validated, __item.status, __forceItem===null ? 'Panier.componentDidUpdate()' : 'item');
        } 
        // si aucun item n'est 'pending'
        else {
          this.props.closePersonnalisation('Panier.componentDidUpdate()');
        }
    }
  }

  setSelectedIndex(index) {
    const {selectedIndex, selectedIngredient} = this.state;
    if (selectedIngredient===-1) {
      index = index===this.state.selectedIndex ? -1 : index;
    }
    this.setState({selectedIndex: index, selectedIngredient: -1})
  }

  setSelectedIngredient(index,ingidx) {
    console.log(`setSelectedIngredient(${index}, ${ingidx})`)
    const {selectedIndex, selectedIngredient} = this.state;
    if (index==selectedIndex) {
      index = ingidx===selectedIngredient ? -1 : index;
      ingidx = ingidx===selectedIngredient ? -1 : ingidx;
    }
    this.setState({selectedIndex: index, selectedIngredient: ingidx})
  }

  calculateTotal(items, modificateurs) {
    let __total = 0;
    if (undefined!==items) {
      items.forEach(itm => {
        __total += itm.quantite * itm.prix;
      });
    }

    // en attendant d'avoir un discount sur chaque item / ingredient
    if (modificateurs && modificateurs.length) {
      const ispc = String(modificateurs[0].valeur).substr(-1,1)==='%';
      const val = Math.abs(Number(String(modificateurs[0].valeur).slice(0,-1)));
      if (ispc) {
        __total *= (100 - val) / 100;
      } else {
        __total -= val;
      }
    }

    return __total;
  }


  searchHandler(event) {
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
      this.send_to_search(value);
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
      this.send_to_search(decoded);
    }
    return false;
  }


  send_to_search(value) {
    const {commandeslist, getCommande } = this.props;

    if (commandeslist) {
      const cmd = Object.values(commandeslist).find((c)=>c.ticketId==value);
      console.log('s2s', cmd);
      if (cmd && cmd.status=='standby') {
        this.setState({inputfocus: false});
        this.props.getCommande(value);
      }
    }

  }




  openDiscount() {

    const {modificateurs, items } = this.props.commande;
    const {selectedIndex, selectedIngredient} = this.state;

    // récup des id d'item et d'ingrédients en fonction de la sélection du panier
  //  const itemid = (selectedIndex!==-1) ? items[selectedIndex].itemid : null;
  //  const ingredientid = (selectedIngredient!==-1) ? items[selectedIndex].ingredients[selectedIngredient].ingredient : null;

    // DEV : pour l'instant on n'utilise que le discount sur le panier entier
    const itemid = null;
    const ingredientid = null;

    // si l'id de l'item est défini : 
    // - soit un comment d'item
    // - soit un comment d'ingrédient
    // si pas d'id d'item : comment de commande
    const discount = modificateurs.find(dsc => dsc.item==itemid && dsc.ingredient==ingredientid);

    const discountId = (discount) ? discount.modificateur_id : null;

    this.setState({
      discountOpen: true, 
      discountId: discountId, 
      discountItemId: itemid, 
      discountIngredientId: ingredientid,
      inputfocus: false
    });
  }

  saveDiscount(discountid, itemid, ingredientid, valeur) {
    if (discountid===null) {
      this.props.addDiscount({
        item: itemid,
        ingredient: ingredientid,
        valeur: valeur
      });
    } else {
      this.props.updateDiscount({
        discountId: discountid, 
        valeur: valeur
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
    const {selectedIndex, selectedIngredient} = this.state;

    // récup des id d'item et d'ingrédients en fonction de la sélection du panier
    const itemid = (selectedIndex!==-1) ? items[selectedIndex].itemid : null;
    const ingredientid = (selectedIngredient!==-1) ? items[selectedIndex].ingredients[selectedIngredient].ingredient : null;

    // si l'id de l'item est défini : 
    // - soit un comment d'item
    // - soit un comment d'ingrédient
    // si pas d'id d'item : comment de commande
    const comment = comments.find(cmt => cmt.item==itemid && cmt.ingredient==ingredientid);

    const commentId = (comment) ? comment.comment_id : null;

    this.setState({
      commentOpen: true, 
      commentId: commentId, 
      commentItemId: itemid, 
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



  closeComment() {
    this.setState({
      commentOpen: false, 
      commentId:null, 
      commentItemId:null, 
      commentIngredientId:null,
      inputfocus: true
    });
  }


  openFicheClient() {
    this.setState({
      ficheClientOpen: true,
      inputfocus: false
    });
  }
  closeFicheClient() {
    this.setState({
      ficheClientOpen: false,
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



  interval = 0;

  render() {

    const { commandeslist, 
            error, 
            loading, 
            updateProduit, 
            updateCommande, 
            standByCommande, 
            livraisonCommande, 
            deleteCommande, 
            gotoListeCommandes, 
            openReglement, 
            open, 
            openDrawer, 
            parametres, 
            itemToPersonnalize, 
            uncompleteStep,
            deleteComment,
            deleteDiscount,
            clients } = this.props;

    const { comments, modificateurs, items, status, ticketId, mode, client } = this.props.commande;
    
    const {inputfocus, searchval, 
           commentOpen, commentId, commentItemId, commentIngredientId,
           discountOpen, discountId, discountItemId, discountIngredientId,
           ficheClientOpen } = this.state;

    // récup du texte en fonction de l'id du commentaire (s'il est défini)
    const commentTexte = (commentId!==null) ? comments.find(cmt=>cmt.comment_id==commentId).texte : '';
    // choix de messages prédéfinis pour les commentaires :
    const cmtlib = (parametres && parametres.commandes) ? parametres.commandes.comment_predefini : [];

    // récup de la valeur en fonction de l'id du discount (s'il est défini)
    const discountVal = (discountId!==null) ? modificateurs.find(dsc=>dsc.modificateur_id==discountId).valeur : '';
    // choix de discounts prédéfinis pour les discounts :
    const dsclib = (parametres && parametres.commandes) ? parametres.commandes.discount_predefini : [];


    const commandeClient = client ? clients.find(c=>c.client_id==client.client_id) : null;


    // autorise-t-on la vente avec encaissement ultérieur ?
    //  - si la propriété n'est pas définie, on fait comme si elle était TRUE (^^)
    const ventecmd = (parametres && parametres.financier) 
                     ? (parametres.financier.hasOwnProperty('vente_commande') && parametres.financier.vente_commande===false) 
                       ? false 
                       : true 
                     : true;

    console.log('searchval', searchval);

    const total = this.calculateTotal(items, modificateurs);
    const devise = '€';
    const { selectedIndex, selectedIngredient } = this.state;


    console.log(`index:${selectedIndex}, ingIndex:${selectedIngredient}`);


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
    
    const self = this;
    if (inputfocus && (!items || items.length==0)) {      
      this.interval = setInterval(() => {
        if (self.refs.searchInput) self.refs.searchInput.focus();
       },500);
    } else {
      clearInterval(this.interval);
      this.interval = 0;
    }
    


    
    const onClickAction = (value) => { console.log(`Action: ${value}`) };

    const onClickAdd = (event) => {
      updateProduit({itemid: items[selectedIndex].itemid, quantite: items[selectedIndex].quantite + 1});
    }
    const onClickRemove = (event) => {
      let __i = selectedIndex;
      if (items[selectedIndex].quantite===1) this.setSelectedIndex(null, -1);
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
          this.setSelectedIndex(null, -1);
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

      console.log('fidelite_Activation', parametres.financier.fidelite_activation);
      if (undefined === items || items.length==0) gotoEncaissement();
    }

    const attenteHandler = (event) => {
      this.props.setNewNumero();
      standByCommande(this.props.commande);
    }
    const validationHandler = (event) => {
      this.props.setNewNumero();
      livraisonCommande(this.props.commande);
    }

    const repriseHandler = (event) => {
      gotoListeCommandes();
    }

    const tiroirHandler = (event) => {
      openDrawer();
    }

    const openReglementHandler = () => {
      this.props.setNewNumero();
      openReglement();
    }
 
    return (
      <div className={ `Panier ${open && 'reglement-ouvert'}` }>
        <div className="header">
          {/* <div className="ticketId">{ (this.interval==0?'X':'√')+strings.modules.encaissement.panier.ticket_no+' '+ticketId }</div> */}
          <div className="ticketId">{ strings.modules.encaissement.panier.ticket_no+' '+ticketId }</div>
          <div className="ticketComment"></div>
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
              <div className="wrapper">
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
                          prix={ itm.prix }
                          disabled={ open }
                          commentaire={ itm.commentaire!=='' }
                          selected={ selectedIndex===i }
                          selectedIng={ selectedIngredient }
                          composition={ itm.composition }
                          ingredients={ itm.ingredients }
                          steps={ itm.steps }
                          _onClick={ this.setSelectedIndex }
                          _onDoubleClick={ (id) => {
                            let __prevstepid = -1;
                            let __nextstepid = (itm.steps.length>1) ? itm.steps[1].id : -1;
                            this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid:null});
                            this.props.openPersonnalisation(itm.itemid.toString(), itm.steps[0].id, __prevstepid, __nextstepid, itm.steps[0].validated, itm.status, 'item');
                          }}
                          _onSubClick={ this.setSelectedIngredient }
                          _onSubDoubleClick={ (stepid) => { 
                            console.log('_onSubDoubleClick', stepid);
                            let __step = itm.steps.find(s=>s.id==stepid);
                            let __stepIndex = itm.steps.findIndex(s=>s.id==stepid);
                            let __previd = (__stepIndex==0) ? -1 : itm.steps[__stepIndex-1].id;
                            let __nextid = (__stepIndex>=itm.steps.length-1) ? -1 : itm.steps[__stepIndex+1].id;
                            this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid: stepid});
                            this.props.openPersonnalisation(itm.itemid.toString(), stepid, __previd, __nextid, __step.validated, itm.status, 'item');
                          }} />
                  )}
                  {modificateurs && <div className="separateur"></div>}
                  {modificateurs && modificateurs.map(dis => (
                    <DiscountListItem
                      valeur={dis.valeur}
                      id={dis.modificateur_id}
                      onClick={this.openDiscount}
                      deleteHandler={deleteDiscount}
                      />
                  ))}
                  </List>
              </div> {/* /.wrapper */}
              <div className="tools">
                <Fab aria-label="add" size="small" className="tool plus" disabled={selectedIndex===-1 || open} onClick={onClickAdd}>
                  <PlusIcon htmlColor="#1EA9DF" />
                </Fab>
                <Fab aria-label="remove" size="small" className="tool remove" disabled={selectedIndex===-1 || open} onClick={onClickRemove}>
                  <MinusIcon htmlColor="#1EA9DF" />
                </Fab>
                <Fab aria-label="discount" size="small" className="tool discount" disabled={open} onClick={this.openDiscount}>
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
                <div className="montant">{ `${total.toFixed(2).replace('.',',')} ${devise}` }</div>
            </div>
          </div> {/* /.PanierListe */}

        </div>
        <div className="footer">
          <div className="modes">
            <StdButton identifier='surplace' elementclass={ `mode mode-surplace ${(('surplace'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.surplace } onClick={(value) => { updateCommande({mode:value}) }} />
            <StdButton identifier='emporter' elementclass={ `mode mode-emporter ${(('emporter'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.emporter } onClick={(value) => { updateCommande({mode:value}) }} />
            <StdButton identifier='livraison' elementclass={ `mode mode-livraison ${(('livraison'===mode) && 'active' : '')}` } disabled={ open } icon={ false } text={ strings.modules.encaissement.panier.mode.livraison } onClick={(value) => { updateCommande({mode:value}) }} />
          </div>
          <div className="actions">
            <StdButton identifier='encaisser' elementclass={ `action action-encaisser${(ventecmd && 'surplace'!==mode ? ' action-mid' : '')}` } disabled={ !__encaissable || open } icon={ false } text={ strings.modules.encaissement.panier.action.encaissement } onClick={ ()=> { openReglementHandler() }} />
            {(ventecmd && 'surplace'!==mode) && (<StdButton identifier='valider' elementclass={ `action action-valider action-mid` } disabled={ !__encaissable || open } icon={ false } text={ strings.modules.encaissement.panier.action.valider } onClick={ ()=> { validationHandler() }} /> )}
            <StdButton identifier='tiroir' elementclass="action action-tiroir" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.tiroir } onClick={ tiroirHandler } />
            <StdButton identifier='attente' elementclass="action action-attente" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.attente } onClick={ attenteHandler } />
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
        <FicheClientCont open={ficheClientOpen} client={commandeClient} mode={commandeClient?'fiche':'recherche'} contexte="encaissement" closeHandler={this.closeFicheClient} selectClient={this.selectClient} />
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
  const {valeur, id, onClick, deleteHandler} = props;

  const deleteDiscount = () => {

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
          deleteHandler({discountId:id});
        }
      });
    }


  return (
    <ListItem className="discount">
      <ListItemText primary={valeur} onClick={onClick} />
      <ListItemSecondaryAction>
        <ListItemIcon onClick={deleteDiscount}>
          <DeleteIcon />
        </ListItemIcon>
      </ListItemSecondaryAction>
    </ListItem>
  );
}


class PanierListeItem extends React.Component {

 
  render() {
    const {id, itemid, nom, quantite, prix, commentaire, selected, selectedIng, disabled, ingredients, steps, _onClick, _onDoubleClick, _onSubClick, _onSubDoubleClick} = this.props;

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
    let customIng = [];
    let i =  -1;
    if (steps) {
      steps.forEach(stp => {
        let ing = ingredients.filter(ingrd => ingrd.fromStep==stp.id);
        
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

    return (
      <div className="PanierListeItem" key={`pli-${id}`}>
        <ListItem 
          button 
          disableGutters
          selected={ selected && selectedIng===-1 }
          disabled={ disabled }
          onClick={ handleClick }
          onDoubleClick={ handleDoubleClick }
          >
          <div className="litm nom">{nom}</div> 
          <div className="litm quantite">{quantite}</div> 
          <div className="litm prix">{ prix.toFixed(2).replace('.',',') }</div>
        </ListItem>
      {customIng.length>0 && (
        <div className="litm ingredients-list">
          {customIng.map((ing, i) => ( 
            <PanierListeSubItem 
              nom={ ing.nom }
              quantite={ ing.qte } 
              prix={ ing.prix }
              ingredient={ ing.ingredient }
              produitIndex={ id }
              ingredientIndex={ i }
              fromStep={ ing.fromStep }
              _key={ `itm${itemid}-ing${ing.ingredient}` }
              _selected={ selectedIng===i && selected }
              _disabled={ disabled }
              _onClick={ _onSubClick }
              _onDoubleClick={ _onSubDoubleClick }
            />
          ))}
        </div>
      )}
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
    const { nom, quantite, prix, ingredient, produitIndex, ingredientIndex, fromStep, _key, _selected, _disabled, _onClick, _onDoubleClick } = this.props;

    let timer = 0;
    let prevent = false;
  
    const handleClick = () => {
      timer = setTimeout(() => {
        if (!prevent) {
          _onClick(produitIndex, ingredientIndex);
        }
        prevent = true;
      }, 200);
    }
    const handleDoubleClick = () => {
      clearTimeout(timer);
      prevent = true;
      _onDoubleClick(fromStep);
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
      >
      <div className="lsitm nom">{ nom }</div>
      <div className="lsitm quantite">{ quantite }</div>
      <div className="lsitm prix">{ prix.toFixed(2).replace('.',',') }</div>
    </ListItem>
    );
  }

}