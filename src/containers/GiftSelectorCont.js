import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { commandeActions } from '../services/commande/commandeActions'
// import { getCommandeError, getCommandeLoading, getCommande } from '../services/commande/commandeReducer';
import GiftSelector from '../components/Encaissement/GiftSelector';



const _getProductsList = (state) => {

  let produitListe = [];
  if (state && state.hasOwnProperty('commandeReducer')) {

    const { gift } = state.commandeReducer.commande;
    
    if (!gift) return null;
    
    gift.produits.forEach(prdid => {
      const prd = _getProduit(prdid, state.catalogueReducer.catalogue);
      produitListe = [...produitListe, prd];
    });
    
  }
  return produitListe;
}


const _getProduit = (id, catalogue) => {
  let produit = {};
  Object.values(catalogue).forEach(grp => {
    const p = grp.produits.find(p=>p.id===id);
    if (p!==undefined) {
      produit = p;
      return;
    }
  });
  return produit;
}


const mapStateToProps = (...args) => { 
    const state = args[0];
  return {
    productsList: state ? _getProductsList(state) : [],
    gift: state.commandeReducer.commande.gift,
    mode: state.commandeReducer.commande.mode,
    monnaie: (state.parametresReducer.parametres.financier && state.parametresReducer.parametres.financier.monnaie) || {iso: 'EUR', nom: 'euro', nom_pl: 'euros', symbole: '€'},
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    addProduit: commandeActions.addProduit,
    addDiscount: commandeActions.addDiscount,
  }, dispatch);

}

const GiftSelectorCont = connect(
  mapStateToProps, 
  mapDispatchToProps
)(GiftSelector);

export default GiftSelectorCont;