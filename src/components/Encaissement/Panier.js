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
    const { getCommande } = this.props;
    getCommande();
    
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

    const { error, loading, updateProduit, updateCommande, deleteCommande, openReglement, open } = this.props;
    const { commentaire, items, status, ticketId, mode } = this.props.commande;
    
    const total = this.calculateTotal(items);
    const devise = '€';
    const { selectedIndex } = this.state;
    
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
                          ingredients={ itm.ingredients }
                          _onClick={ this.setSelectedIndex } />
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
            <StdButton identifier='encaisser' elementclass="action action-encaisser" disabled={ undefined===items || items.length===0 || open } icon={ false } text={ strings.modules.encaissement.panier.action.encaissement } onClick={ openReglement } />
            <StdButton identifier='tiroir' elementclass="action action-tiroir" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.tiroir } onClick={(value) => { onClickAction(value) }} />
            <StdButton identifier='attente' elementclass="action action-attente" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.attente } onClick={(value) => { onClickAction(value) }} />
            <StdButton identifier='reprise' elementclass="action action-reprise" icon={ false } disabled={ open } text={ strings.modules.encaissement.panier.action.reprise } disabled={ true } onClick={(value) => { onClickAction(value) }} />
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
  getCommande: PropTypes.func,
  updateCommande: PropTypes.func,
  deleteCommande: PropTypes.func,
  updateProduit: PropTypes.func
}


const PanierListeItem = ({id, itemid, nom, quantite, prix, commentaire, selected, disabled, ingredients, _onClick}) => (
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
  </div>
);

PanierListeItem.propTypes = {
  id: PropTypes.number.isRequired,
  itemid: PropTypes.string.isRequired,
  produitid: PropTypes.string.isRequired,
  nom: PropTypes.string.isRequired,
  quantite: PropTypes.number,
  prix: PropTypes.number,
  commentaire: PropTypes.bool,
  selected: PropTypes.bool,
  ingredients: PropTypes.array,
  _onClick: PropTypes.func
};