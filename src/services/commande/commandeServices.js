import {emit} from 'eiphop';

export const commandeServices = {
  getNewCommande,
  getCommandeById,
  getCommandesList,
  addProduit,
  updateProduit,
  addReglement,
  addRendu,
  saveCommande
 };

function getNewCommande(params) {
    return {
        ticketId: _newCommandeId(),
        operator: {id: params.operator.id, nom: params.operator.nom},
        caisse: params.caisse,
        commentaire: '',
        items: [],
        reglements: [],
        rendus: [],
        mode: 'surplace',
        status: 'pending'
    }
}

function getCommandeById(id) {
  return emit('dbCommandeGetCommande', {ticketId: id});
}
function getCommandesList(params) {
  return emit('dbCommandeGetAll', params);
}

function addProduit(payload, items) {
  const { produitid, nom, prix, composition } = payload;

  // s'il s'agit d'un produit customisable, on crée une autre item
  
  // s'il s'agit d'un produit non customisable, 
  // on recherche s'il existe un item du même produit
  // et on modifie la quantité de l'item
  let item = items.find(itm=>{
    return itm.produitid === produitid;
  });
  let mode = 'add';
  if (undefined===item) {
    item = {
      produitid: produitid,
      nom: nom,
      prix: prix,
      composition: composition,
      quantite: 1,
      itemid: new Date().getTime()
    };
  }
  else {
    item.quantite += 1;
    mode = 'update';
  }



  return {commandeItem:item, mode:mode};
}


function updateProduit(payload, item) {
  const { quantite, commentaire } = payload;

  let mode = 'update';
  item.quantite = quantite;
  item.commentaire = commentaire;
  if (item.quantite===0) mode = 'delete';

  return {commandeItem:item, mode:mode};
}


/**
 * Retourne un nouveau réglement avec les paramètres envoyés
 * 
 * @param {Object} payload : paramètres du réglement 
 * @param {Array} reglements : liste des réglements de la commande
 */
function addReglement(payload, reglements) {
  const { moyen, valeur } = payload;

  const esp = reglements.filter(rgl=>rgl.moyen=='especes');
  
  if (esp.length>0 && moyen=='especes') {
    const newvaleur = esp[0].valeur + valeur;
    return {
      ...esp[0],
      valeur: newvaleur
    };
  }

  return {
    reglementId: new Date().getTime(),
    moyen: moyen,
    valeur: valeur
  };
}


/**
 * Retourne un nouveau rendu avec les paramètres envoyés
 * 
 * @param {Object} payload : paramètres du rendu 
 * @param {Array} rendus : liste des rendus de la commande
 */
function addRendu(payload, rendus) {
  const { moyen, valeur } = payload;

  return {
    renduId: new Date().getTime(),
    moyen: moyen,
    valeur: valeur
  };
}


function saveCommande(commande, state) {
/*
  let __cmd = {
    commande_id: payload.ticketId,
    operator: {id: payload.operator.id, nom: payload.operator.nom},
    caisse: payload.caisse,
    commentaire: payload.commentaire,
    mode: payload.mode,
    status: payload.status,
    items: [],
    reglements: []
  };
  payload.items.forEach(itm => {
    let __itm = {
      item_id: itm.itemid,
      produit_id: itm.produitid,
      prix: itm.prix,
      quantite: itm.quantite,
      commentaire: itm.commentaire ? itm.commentaire : '',
      composition: []
    };
    if (itm.composition.length>0) {
      itm.composition.forEach( cmp => {
        __itm.composition.push(cmp);
      });
    }
    __cmd.items.push(__itm)
  });
  */
  let items = [];

  // on met tous les produits dans le même array
  let produits = [];
  for (let [key, value] of Object.entries(state.catalogueReducer.catalogue)) {
    produits = [...produits, ...value.produits];
  }

  // on ajoute les infos de tva à chaque item de la commande
  commande.items.forEach(itm => {
    const prd = produits.find(p => p.id==itm.produitid);
    items.push({
      ...itm,
      tva: {id: prd.tva_id, valeur: state.catalogueReducer.tva[prd.tva_id].valeur}
    })
  });



  const __c = {
    ...commande,
    items,
    total: _getCommandeTotal(commande.items)
  }


  return emit('dbCommandePersist', {commande:__c});
}

const _newCommandeId = () => {
    let __d = new Date();
    return __d.getTime();
}


const _getCommandeTotal = (items) => {
  // montant à payer (somme des items)
  let __total = 0;
  if (undefined!==items) {
    items.forEach(itm => {
      __total += itm.quantite * itm.prix;      
    });
  }
  return __total;
}