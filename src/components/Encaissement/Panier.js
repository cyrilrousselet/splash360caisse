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
      selectedIndex: -1,
      selectedIngredient: null,
      inputfocus: true,
      searchval:''
    }
    this.setSelectedIndex = this.setSelectedIndex.bind(this);
    this.setSelectedIngredient = this.setSelectedIngredient.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.decodeQRCode = this.decodeQRCode.bind(this);
    this.send_to_search = this.send_to_search.bind(this);
  }

  lock = false;
  search_tmo = -1;

  componentDidMount() {
    const { getCommande, getParametres, getListeCommandes } = this.props;
    getCommande();
    getListeCommandes();
    getParametres();    
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
    index = index===this.state.selectedIndex ? -1 : index;
    this.setState({selectedIndex: index, selectedIngredient: null})
  }

  setSelectedIngredient(ingid) {
    this.setState({selectedIngredient: ingid})
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

  render() {

    const { commandeslist, error, loading, updateProduit, updateCommande, standByCommande, livraisonCommande, deleteCommande, gotoListeCommandes, openReglement, open, openDrawer, parametres, itemToPersonnalize, uncompleteStep } = this.props;
    const { commentaire, items, status, ticketId, mode } = this.props.commande;
    
    const {inputfocus, searchval} = this.state;


    console.log('searchval', searchval);

    const total = this.calculateTotal(items);
    const devise = '€';
    const { selectedIndex, selectedIngredient } = this.state;


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

    const self = this;

    if (items) console.log('items', items.length);
    else console.log('items null');

    // if (!items || items.length==0) {
    //   clearInterval(this.search_tmo);
    //   this.search_tmo = -1;
    // }
    
    // if (this.search_tmo==-1) {
      setInterval(function(){
        if (inputfocus && (!items || items.length==0)) {
          if (self.refs.searchInput) self.refs.searchInput.focus();
        }
      },200);
    // }


    
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
    const livraisonHandler = (event) => {
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
          <div className="ticketId">{ strings.modules.encaissement.panier.ticket_no+' '+ticketId }</div>
          <div className="ticketComment"></div>
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
                          _onClick={ (id) => {
                            console.log('_onClick', id, selectedIndex);
                            if (selectedIndex==id) {
                              let __prevstepid = -1;
                              let __nextstepid = (itm.steps.length>1) ? itm.steps[1].id : -1;
                              this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid:null});
                              this.props.openPersonnalisation(itm.itemid.toString(), itm.steps[0].id, __prevstepid, __nextstepid, itm.steps[0].validated, itm.status, 'item');
                            } else {
                              this.setSelectedIndex(id); 
                            }
                          }}
                          _onSubClick={ (ingid, stepid) => { 
                            console.log('_onSubClick', ingid, stepid, selectedIngredient);
                            if (ingid==selectedIngredient) {
                              let __step = itm.steps.find(s=>s.id==stepid);
                              let __stepIndex = itm.steps.findIndex(s=>s.id==stepid);
                              let __previd = (__stepIndex==0) ? -1 : itm.steps[__stepIndex-1].id;
                              let __nextid = (__stepIndex>=itm.steps.length-1) ? -1 : itm.steps[__stepIndex+1].id;
                              this.props.uncheckItemSteps({itemid:itm.itemid.toString(), stepid: stepid});
                              this.props.openPersonnalisation(itm.itemid.toString(), stepid, __previd, __nextid, __step.validated, itm.status, 'item');
                            } else {
                              this.setSelectedIngredient(ingid);
                            }
                          } } />
                  )}
                  </List>
              </div> {/* /.wrapper */}
              <div className="tools">
                <Fab aria-label="add" size="small" className="tool plus" disabled={selectedIndex===-1 || open} onClick={onClickAdd}>
                  <PlusIcon htmlColor="#1EA9DF" />
                </Fab>
                <Fab aria-label="remove" size="small" className="tool remove" disabled={selectedIndex===-1 || open} onClick={onClickRemove}>
                  <MinusIcon htmlColor="#1EA9DF" />
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
            <StdButton identifier='encaisser' elementclass="action action-encaisser" disabled={ !__encaissable || open } icon={ false } text={ ('livraison'===mode)?strings.modules.encaissement.panier.action.valider:strings.modules.encaissement.panier.action.encaissement } onClick={ ()=> { ('livraison'===mode)?livraisonHandler():openReglementHandler() }} />
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
  getListeCommandes: PropTypes.func,
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
    const {id, itemid, nom, quantite, prix, commentaire, selected, selectedIng, disabled, ingredients, steps, _onClick, _onSubClick} = this.props;

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
      <div className="PanierListeItem">
        <ListItem 
          button 
          disableGutters
          selected={ selected }
          disabled={ disabled }
          onClick={ () => _onClick(id) }
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
              selected={selectedIng==ing.ingredient}
              disabled={disabled}
              onClick={ event => _onSubClick(ing.ingredient,ing.fromStep)}
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