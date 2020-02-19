import React from 'react';
import PropTypes from 'prop-types';

import StdButton from '../common/StdButton';

import { List, ListItem, Fab } from '@material-ui/core';
import Swal from 'sweetalert2';

import PlusIcon from '../common/icon/PlusIcon';
import DiscountIcon from '../common/icon/DiscountIcon';
import MinusIcon from '../common/icon/MinusIcon';
import CommentIcon from '../common/icon/CommentIcon';
import CrossIcon from '../common/icon/CrossIcon';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);

class Panier extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: -1
    }
    this.setSelectedIndex = this.setSelectedIndex.bind(this);
  }


  componentDidMount() {
    const { getCommande, getParametres } = this.props;
    getCommande();
    getParametres();    
  }
  componentDidUpdate() {
    const { items } = this.props.commande;

    // s'il y a des items dans la commande
    if (undefined!==items && items.length>0) {
    
      // vérifie si un item est 'pending'
      // si c'est le cas, on ouvre la Personnalisation avec le premier step non complet
      // et si c'est le cas, le bouton 'encaissement'/'valider' est inactif
      
      const __pendingItem = items.find(item => item.status==='pending');
      if (__pendingItem) {
        const __nextStep = __pendingItem.steps.find(step => step.completed===false);
        this.props.openPersonnalisation(__pendingItem.itemid, __nextStep.id, 'Panier.componentDidUpdate()');
      } else {
        this.props.closePersonnalisation('Panier.componentDidUpdate()');
      }
    }
  }

  setSelectedIndex(event=null,index) {
    index = index===this.state.selectedIndex ? -1 : index;
    this.setState({selectedIndex: index})
  }

  calculateTotal(items) {
    let __total = 0;
    if (undefined!==items) {
      items.forEach(itm => {
        __total += itm.quantite * itm.prix;
      });
    }
    return __total;
  }


  render() {

    const { error, loading, updateProduit, updateCommande, standByCommande, livraisonCommande, deleteCommande, gotoListeCommandes, openReglement, open, openDrawer, parametres, itemToPersonnalize } = this.props;
    const { commentaire, items, status, ticketId, mode } = this.props.commande;
    
    const total = this.calculateTotal(items);
    const devise = '€';
    const { selectedIndex } = this.state;


    /* GESTION DE LA PERSONNALISATION */
    let __encaissable = true;
    // aucun item dans la commande -> btn 'encaissement'/'valider' inactif
    if (undefined===items || items.length===0) {
      __encaissable = false;
    } 
    // s'il y a des items dans la commande
    else {
      
    //   // vérifie si un item est 'pending'
    //   // si c'est le cas, on ouvre la Personnalisation avec le premier step non complet
    //   // et si c'est le cas, le bouton 'encaissement'/'valider' est inactif
      
       const __pendingItem = items.find(item => item.status==='pending');
       if (__pendingItem) {
         __encaissable = false;
    //     const __nextStep = __pendingItem.steps.find(step => step.completed===false);
    //     this.props.openPersonnalisation(__pendingItem.itemid, __nextStep.id);
    //   } else {
    //     this.props.closePersonnalisation();
       }
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
      if (undefined === items || items.length==0) gotoEncaissement();
    }

    const attenteHandler = (event) => {
      standByCommande(this.props.commande);
    }
    const livraisonHandler = (event) => {
      livraisonCommande(this.props.commande);
    }

    const repriseHandler = (event) => {
      gotoListeCommandes();
    }

    const tiroirHandler = (event) => {
      openDrawer();
    }

    return (
      <div className={ `Panier ${open && 'reglement-ouvert'}` }>
        <div className="header">
          <div className="ticketId">{ strings.modules.encaissement.panier.ticket_no+' '+ticketId }</div>
          <div className="ticketComment"></div>
        </div>
        <div className="body">

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
                          composition={ itm.composition }
                          ingredients={ itm.ingredients }
                          _onClick={ this.setSelectedIndex }
                          _onSubClick={ (stepid) => { this.props.openPersonnalisation(itm.itemid.toString(), stepid, 'subitem') } } />
                  )}
                  </List>
              </div> {/* /.wrapper */}
              <div className="tools">
                <Fab aria-label="add" size="small" className="tool plus" disabled={selectedIndex===-1 || open} onClick={onClickAdd}>
                  <PlusIcon />
                </Fab>
                <Fab aria-label="remove" size="small" className="tool remove" disabled={selectedIndex===-1 || open} onClick={onClickRemove}>
                  <MinusIcon />
                </Fab>
                <Fab aria-label="discount" size="small" className="tool discount" disabled={selectedIndex===-1 || open}>
                  <DiscountIcon />
                </Fab>
                <Fab aria-label="comment" size="small" className="tool comment" disabled={selectedIndex===-1 || open}>
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
            <StdButton identifier='encaisser' elementclass="action action-encaisser" disabled={ !__encaissable || open } icon={ false } text={ ('livraison'===mode)?strings.modules.encaissement.panier.action.valider:strings.modules.encaissement.panier.action.encaissement } onClick={ ()=> { ('livraison'===mode)?livraisonHandler():openReglement() }} />
            <StdButton identifier='tiroir' elementclass="action action-tiroir" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.tiroir } onClick={ tiroirHandler } />
            <StdButton identifier='attente' elementclass="action action-attente" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.attente } onClick={ attenteHandler } />
            <StdButton identifier='reprise' elementclass="action action-reprise" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.reprise } onClick={gotoListeCommandes} />
          </div>
        </div>
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
  updateCommande: PropTypes.func,
  standByCommande: PropTypes.func,
  livraisonCommande: PropTypes.func,
  deleteCommande: PropTypes.func,
  updateProduit: PropTypes.func,
  gotoListeCommandes: PropTypes.func,
  openDrawer: PropTypes.func
}



class PanierListeItem extends React.Component {

  render() {
    const {id, itemid, nom, quantite, prix, commentaire, selected, disabled, ingredients, _onClick, _onSubClick} = this.props;

    const customIng = ingredients.filter(ing => ing.fromStep!==null);

    return (
      <div className="PanierListeItem">
        <ListItem 
          button 
          disableGutters
          selected={ selected }
          disabled={ disabled }
          onClick={ event => _onClick(event, id) }
          >
          <div className="litm nom">{nom}</div> 
          <div className="litm quantite">{quantite}</div> 
          <div className="litm prix">{ prix.toFixed(2).replace('.',',') }</div>
        </ListItem>
      {customIng.length>0 && (
        <div className="litm ingredients-list">
          {customIng.map(ing => (
            <ListItem
              button
              disableGutters
              selected={selected}
              disabled={disabled}
              onClick={ event => _onSubClick(ing.fromStep)}
              key={`itm${itemid}-ing${ing.ingredient}`}
              >
              <div className="lsitm nom">{ ing.nom }</div>
              <div className="lsitm quantite">{ ing.qte }</div>
              <div className="lsitm prix">{ ing.prix.toFixed(2).replace('.',',') }</div>
            </ListItem>
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