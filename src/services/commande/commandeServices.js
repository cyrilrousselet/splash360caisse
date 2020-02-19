import {emit} from 'eiphop';

export const commandeServices = {
  getNewCommande,
  getCommandeById,
  getCommandesList,
  addProduit,
  updateProduit,
  addReglement,
  addRendu,
  saveCommande,
  addIngredient,
  getRuleValues
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

function addProduit(payload, tva, items, steps) {
  const { produitid, nom, prix, composition, customizable } = payload;

  let mode = '';
  let item = {};

  // s'il s'agit d'un produit customisable, on crée un autre item
  if (customizable) {
    mode = 'add';


    let steps_list = [];
    steps.forEach(step => {
      steps_list.push({id: step.step_id, completed: false});
    });

    item = {
      produitid: produitid,
      nom: nom,
      prix: prix,
      tva: tva,
      composition: composition,
      ingredients: [...composition],
      steps: steps_list,
      stepslength: steps.length,
      quantite: 1,
      itemid: _newCommandeItemId(),
      status: 'pending'
    };
  }
  // s'il s'agit d'un produit non customisable, 
  else {
    // on recherche s'il existe un item du même produit
    item = items.find(itm=>{
      return itm.produitid === produitid;
    });
    // si aucun item ne correspond, on l'ajoute
    mode = 'add';
    if (undefined===item) {
      item = {
        produitid: produitid,
        nom: nom,
        prix: prix,
        tva: tva,
        composition: composition,
        ingredients: [...composition],
        quantite: 1,
        itemid: _newCommandeItemId(),
        status: 'completed'
      };
    }
    // sinon on modifie la quantité de l'item
    else {
      item.quantite += 1;
      mode = 'update';
    }

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
 * 
 * @param {*} ingredient : provenant du catalogue
 * @param {*} quantite   : quantité choisie
 * @param {*} step       : provenant du catalogue
 * @param {*} item       : item à modifier
 */
function addIngredient(ingredient, quantite, step, item) {

  const {ingredients, steps} = item;

  console.log(step)
  
  const ingInCmdId = ingredients.findIndex(ing=>ing.ingredient==ingredient.id);
  // si l'ingredient n'est pas encore dans la liste de l'item
  if (-1==ingInCmdId) {
    item.ingredients.push({ingredient: ingredient.id, type: ingredient.type, qte: 1, prix: Number(ingredient.supplement), nom: ingredient.nom, fromStep:step.step_id});
  } 
  // sinon on augmente d'1 la quantité de l'ingrédient
  else {
    ingredients[ingInCmdId].qte += 1;
    item.ingredients = [...ingredients];
  }

  // test du step (validation et supplément)
  const {validated, prixtotal} = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  if (validated) {
    const itemstepid = steps.findIndex(st => st.id == step.step_id);
    steps[itemstepid].completed = true;
    
    item.steps = [...steps];

    // si tous les steps sont "completed", 
    // on passe le status de l'item de "pending" à "completed"
    if (-1==steps.findIndex(st => st.completed == false)) {
      item.status = 'completed';
    }
  }
  
  item.prix = prixtotal;

  return item;
}


function _checkStepRegles(step, item) {

  let __validated = true;
  let __supplement = 0;
  let __types = [];
  let __ing = [];

  // on stocke les types dans un tableau
  step.regles.forEach(rgl => {
    __types.push(rgl.type);
  })


  // s'il n'y a qu'un type d'ingrédients
  // OU
  // s'il y a plusieurs types d'ingrédients dans le step
  // et que la règle vaut pour tous les types
  if (step.regles.length == 1 || (step.regles.length>1 && step.regles[0].regle.toLowerCase().indexOf('g') != -1)) {
    // on exécute le même test sur tous les types
    console.log('on applique le test sur tous les types d’ingredients à la fois');
    __ing = item.ingredients.filter(ing => __types.indexOf(ing.type)!=-1);
    if (!_testIngredient(step.regles[0], __ing)) __validated = false;
    __supplement = _getSupplements(step.regles[0], __ing);
  }
  else {
    step.regles.forEach( regle => {
      __ing = item.ingredients.filter(ing => regle.type == ing.type);
      if (!_testIngredient(regle, __ing)) __validated = false;
      __supplement += _getSupplements(regle, __ing);
    })
  }

  return {validated: __validated, prixtotal: item.prix + __supplement};

}



function _getSupplements(rule, ingredients) {

  const regle = rule.regle;
  let __supplement = 0;

  // s'il y a une indication de supplément dans la règle :
  if (regle.indexOf('s')!=-1) {
    const __deuxregles = regle.split(';s:');

    const __rulevaleurs = getRuleValues(__deuxregles[0]);
    const __supvaleurs = getRuleValues(__deuxregles[1]);
    
    // si la liste des ingrédients entre dans les critères du supplément
    if (_testIngredient(__deuxregles[1], ingredients)) {

      // tri des ingrédients par supplément croissant (les plus élevés à la fin)
      ingredients.sort((a,b) => a.prix - b.prix);

      // compte les suppléments à partir du minimum des critères
      ingredients.forEach((ing,i) => {
        if (i>=__supvaleurs.min) __supplement += ing.prix>0 ? (ing.prix * ing.qte) : (rule.supplement * ing.qte);
      });

    }

  } else {
    ingredients.forEach(ing => {
      __supplement += ing.prix>0 ? (ing.prix * ing.qte) : (rule.supplement * ing.qte);
    })
  }

  return __supplement;

}



function _testIngredient(rule, ingredients) {

  const regle = rule.regle;
  let __valeurs = getRuleValues(regle);
  let __total = 0;

  // calcul de la quantité
  ingredients.forEach(ing => {
    __total += ing.qte;
  });


  let __confirm = false;
  let __c = 0;

  // si la quantité est dans le créneau valeurs min <= total <= max
  if (__valeurs.max == -1 || __total <= __valeurs.max) __c++;
  if (__total >= __valeurs.min) __c++;

  // si la quantité correspond à la valeur fixe
  if (__valeurs.max == __valeurs.min && __valeurs.min == __total) __c = 2;

  if (__c==2) __confirm = true;

  return __confirm;
}



/**
   * Renvoie les valeurs minimales et maximales indiquées par la règle
   *
   * @param rule :string règle
   *
   * @returns :any Un object de la forme {min:Number, max:Number, global:boolean}.
   * Si une valeur unique est indiquée, min=max.
   * Si la règle n'impose aucune valeur maximale ('+' ou '*') max = -1.
   * 'global' indique si la règle s'applique à tous les types d'ingrédients de l'étape ou juste au type de l'ingrédient courant
   */
function  getRuleValues(rule) {

    let __valeurs = {min:0, max:-1, global:false}; // par défaut, règle '*'

    let __rule = '';
    if (rule.indexOf(';')!=-1) {
      __rule = rule.substring(0, rule.indexOf(';'));
    }  else {
      __rule = rule;
    }

    // valeur booléenne
    if (__rule == "?") {
      __valeurs.max = 1;
    }
    // 1 ou plus
    else if (__rule == "+") {
      __valeurs.min = 1;
    }
    // valeurs explicites
    else if (__rule.slice(0,1)=="{") {
      // on récupère le contenu de la règle et le flag précisant si la règle est globale
      let __cont = /^\{(.*)\}(g?)$/.exec(__rule);
      __valeurs.global = __cont[2]=="g";

      // s'il y a deux valeurs explicites
      if (__cont[1].indexOf(',')>-1) {
        __valeurs.min = Number(__cont[1].split(',')[0]);
        __valeurs.max = Number(__cont[1].split(',')[1]);
        // si la valeur max n'est pas fixée ('*', '+' ou chaîne vide)
        if ((/^$|^[\*\+]$/).test(__cont[1].split(',')[1])) __valeurs.max = -1;
      }
      // s'il n'y a qu'une valeur explicite (min = max)
      else {
        __valeurs.min = __valeurs.max = Number(__cont[1]);
      }
    }

    return __valeurs;
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
    reglementId: _newReglementId(),
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
    renduId: _newRenduId(),
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
    return __d.getTime().toString();
}
const _newReglementId = () => {
    let __d = new Date();
    return __d.getTime().toString();
}
const _newRenduId = () => {
    let __d = new Date();
    return __d.getTime().toString();
}
const _newCommandeItemId = () => {
    let __d = new Date();
    return __d.getTime().toString();
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