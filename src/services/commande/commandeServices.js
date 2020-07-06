import {emit} from 'eiphop';
import { differenceInMilliseconds, sub, differenceInMinutes, isBefore, endOfYesterday, parseISO } from 'date-fns';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { commandeActions } from '../commande/commandeActions';
import Logger from '../../helpers/Logger';
const strings = new LocalizedStrings(data);
const logger = new Logger();

export const commandeServices = {
  getNewCommande,
  getCommandeById,
  getCommandesList,
  getNewNumero,
  addProduit,
  updateProduit,
  addReglement,
  addRendu,
  addComment,
  addModificateur,
  saveCommande,
  persistCommande,
  deleteCommande,
  archiveCommands,
  addIngredient,
  removeIngredient,
  noIngredientForStep,
  completeStep,
  uncheckItemSteps,
  getRuleValues,
  setCommandeFromOrder,
  setCommandeFromAPI,
  sendTicketId,
  getAllTicketsRestaurant,
  persistTicketsRestaurants
 };

function getNewCommande(params) {

    return {
        ticketId: _newCommandeId(),
        numero: null,
        operator: {id:params.operator.id, nom:params.operator.nom},
        caisse: params.caisse,
        comments: [],
        operator_encaissement: params.operator_encaissement || null,
        caisse_encaissement: params.caisse_encaissement || null,
        centre_revenu: 'restaurant',
        items: [],
        client: null,
        reglements: params.reglements || [],
        modificateurs: [],
        rendus: [],
        start: null,
        end: null,
        chrono: 0,
        total: 0,
        printnum: 0,
        mode: 'surplace',
        status: 'pending'
    }
}

function getCommandeById(id) {
  return emit('dbCommandeGetCommande', {ticketId: id});
}
function deleteCommande(id, motif) {
  return emit('dbCommandeDelete', {ticketId: id, motif: motif});
}
function getCommandesList(params) {
  return emit('dbCommandeGetAll', params);
}

function getAllTicketsRestaurant(params) {
  return emit('dbTicketsRestauGetAll',params);
}
function persistTicketsRestaurants(liste) {
  const trliste = liste.map(trid => {
    const __trValue = Number(trid.substr(11,5)) / 100;
    const __trValid = Number(trid.substr(16,4)); 
    return {id:trid, valeur:__trValue, valid:__trValid};
  });
  return emit('dbTicketsRestauPersist', {payload: trliste});
}

function getNewNumero(parametres, numero) {

  const { heure_fin } = parametres.entreprise;
  const { numerotation_start, numerotation_max, numerotation_hex } = parametres.commandes;

  logger.log('getNewNumero()');

  let newvalue = null;

  // si un numéro est défini
  if (null!==numero && numero.hasOwnProperty('updated')) {

    // *** définition de la fin de la période précédente
    // fin de la période précédente
    let lastperiode_end = endOfYesterday();
    // si l'heure de fin définie est différente de minuit
    if (heure_fin!="0:00") {
      const hfin_ar = heure_fin.split(':');
      // si l'heure actuelle est > à l'heure de fin, la fin de la période précédente était ce matin
      if (differenceInMinutes(new Date(), new Date().setHours(hfin_ar[0],hfin_ar[1]))>0) {
        lastperiode_end = new Date().setHours(hfin_ar[0],hfin_ar[1]);
      } else {
        lastperiode_end = sub(new Date(), {hours: 24}).setHours(hfin_ar[0],hfin_ar[1]);
      }
    }

    // si la dernière numérotation date d'un service précédent,
    // on repart de la valeur du début
    if (isBefore(parseISO(numero.updated), lastperiode_end)) {
      newvalue = Number(numerotation_start-1);
    } 
    // sinon on continue la numérotation
    else {
      // si la valeur du numéro est sous la valeur maximum
      if (Number(numero.value) < Number(numerotation_max)) {
        newvalue = Number(numero.value) + 1;
      }
      // sinon on repart de la valeur du début
      else {
        newvalue = Number(numerotation_start-1);
      }
    }
  }
  // sinon on crée un numéro en partant de la valeur du début
  else {
    newvalue = Number(numerotation_start-1);
  }

  const newnumero = {value: newvalue, hex: numerotation_hex, updated: new Date};

  localStorage.setItem('numero', JSON.stringify(newnumero));
  
  return newnumero;

}

// function setNewNumero(numero) {
//   localStorage.setItem('numero', JSON.stringify(numero));
//  // numero = {value: newvalue, hex: numerotation_hex, updated: new Date()})
//   return new Promise((resolve,reject) => {
//     resolve(numero);
//   });
// }

function addProduit(payload, tva, items, steps) {
  const { produitid, nom, prix, composition, customizable } = payload;

  let mode = '';
  let item = {};

  // s'il s'agit d'un produit customisable, on crée un autre item
  if (customizable) {
    mode = 'add';


    let steps_list = [];
    steps.forEach(step => {
      steps_list.push({id: step.step_id, completed: false, validated: isStepOptionnal(step), checked: false});
    });

    item = {
      produitid: produitid,
      nom: nom,
      prix: prix,
      pu: prix,
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
        pu: prix,
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
  const { quantite } = payload;

  let mode = 'update';
  item.quantite = quantite;
  if (item.quantite===0) mode = 'delete';

  return {commandeItem:item, mode:mode};
}


/**
 * Incrémente la quantité d'un ingrédient
 * et ajoute l'ingrédient à la liste s'il n'y est pas encore
 * 
 * @param {*} ingredient   : provenant du catalogue
 * @param {*} quantite     : quantité choisie
 * @param {*} step         : provenant du catalogue
 * @param {*} item         : item à modifier
 * @param {*} produitSteps : steps du produit
 * @param {*} tva          : objet TVA lié à l'ingrédient
 */
function addIngredient(ingredient, quantite, step, item, produitSteps, tva) {

  const {ingredients, steps} = item;

  // si la règle du step impose un seul ingrédient
  // on vérifie si un ingrédient existe déjà pour le step
  // et on le supprime avant d'ajouter le nouvel ingrédient
  const { unique, type } = _mustBeUnique(step, ingredient);

  logger.log('step #'+step.step_id+' '+(unique?'unique':'pas unique'));
  if (unique) {
    let ingdustepInCmd = -1;
    // s'il n'y a aucun type précisé, on supprime l'ingrédient du step
    if (null==type) {
      logger.log('aucun type précisé => suppression de l’ing du step');
      ingdustepInCmd = ingredients.findIndex(ing=>ing.fromStep==step.step_id);
      if (ingdustepInCmd>-1) ingredients.splice(ingdustepInCmd,1);
    }
    // si un type est précisé, on supprime l'ingrédient du type (et du step)
    else {
      logger.log('type '+type+' => suppression de l’ing du type et du step');
      ingdustepInCmd = ingredients.findIndex(ing=>(ing.fromStep==step.step_id && ing.type==type));
      if (ingdustepInCmd>-1) ingredients.splice(ingdustepInCmd,1);
    }
  }
  
  const ingInCmdId = ingredients.findIndex(ing=>ing.ingredient==ingredient.id);
  // si l'ingredient n'est pas encore dans la liste de l'item
  if (-1==ingInCmdId) {
    item.ingredients.push({
      ingredient: ingredient.id, 
      type: ingredient.type, 
      qte: 1, 
      prix: Number(ingredient.supplement), 
      nom: ingredient.nom, 
      fromStep:step.step_id,
      tva: tva
    });
  } 
  // sinon on augmente d'1 la quantité de l'ingrédient
  else {
    ingredients[ingInCmdId].qte += 1;
    item.ingredients = [...ingredients];
  }

  // test du step (validation et supplément)
  const {completed, validated} = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  const itemstepid = steps.findIndex(st => st.id == step.step_id);
  steps[itemstepid].validated = validated;
  steps[itemstepid].completed = completed;
  steps[itemstepid].checked = validated && completed;
  item.steps = [...steps];

  if (validated) {
    
    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (-1==steps.findIndex(st => st.validated == false || st.checked == false )) {
      item.status = 'completed';
    }
  }
  
//  item.prix = prixtotal;
  item.prix = _getPrix(item, produitSteps);

  return item;
}


/**
 * Décrémente la quantité d'un ingrédient
 * et supprime l'ingrédient de la liste si sa quantité est nulle
 * 
 * @param {*} ingredient : provenant du catalogue
 * @param {*} quantite   : quantité choisie
 * @param {*} step       : provenant du catalogue
 * @param {*} item       : item à modifier
 * @param {*} produitSteps : steps du produit
 */
function removeIngredient(ingredient, quantite, step, item, produitSteps) {

  const {ingredients, steps} = item;

  logger.log(step)
  
  const ingInCmdId = ingredients.findIndex(ing=>ing.ingredient==ingredient.id);
  // l'ingredient est-il dans la liste de l'item ?
  if (-1!==ingInCmdId) {

    ingredients[ingInCmdId].qte -= 1;
    // si la quantité de l'ingrédient est à 0, on le supprime de la liste
    if (0>=ingredients[ingInCmdId].qte) {
      ingredients.splice(ingInCmdId,1);
    }

    item.ingredients = [...ingredients];
  }

  // test du step (validation et supplément)
  const {validated, completed} = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  const itemstepid = steps.findIndex(st => st.id == step.step_id);
  steps[itemstepid].validated = validated;
  steps[itemstepid].completed = completed;
  steps[itemstepid].checked = validated && completed;
  
  item.steps = [...steps];
  
  if (validated) {
    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (-1==steps.findIndex(st => st.validated == false || st.checked == false)) {
      item.status = 'completed';
    }
  }
  
 // item.prix = prixtotal;
  item.prix = _getPrix(item, produitSteps);

  return item;
}

/**
 * Supprime tous les ingrédients pour le step
 * 
 * @param {*} step       : provenant du catalogue
 * @param {*} item       : item à modifier
 * @param {*} produitSteps : steps du produit
 */
function noIngredientForStep(step, item, produitSteps) {

  const {ingredients, steps} = item;

  logger.log(step)

  ingredients.forEach((ing,i) => {
    if (ing.fromStep == step.step_id) ingredients.splice(i,1);
  });

  item.ingredients = [...ingredients];

  // test du step (validation et supplément)
  const {validated, completed} = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  if (validated) {
    const itemstepid = steps.findIndex(st => st.id == step.step_id);
    steps[itemstepid].validated = true;
    steps[itemstepid].completed = completed;
    steps[itemstepid].checked = true;
    
    item.steps = [...steps];

    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (-1==steps.findIndex(st => st.validated == false || st.checked == false)) {
      item.status = 'completed';
    }
  }
  
 // item.prix = prixtotal;
  item.prix = _getPrix(item, produitSteps);

  return item;
}

function uncheckItemSteps(item, stepid) {
  const {steps} = item;
  if (stepid!=null) {
    const itemstepid = steps.findIndex(st => st.id == stepid);
    steps[itemstepid].checked = false;
    item.steps = [...steps];
  } else {
    const uncheckedSteps = steps.map( st => ({...st, checked:false}) );
    item.steps = uncheckedSteps;
  }


  return item;
}

function completeStep(step, item, produitSteps) {

  logger.log('completeStep');

  const {steps} = item;

  const {validated, completed } = _checkStepRegles(step, item);
  if (validated) {
    const itemstepid = steps.findIndex(st => st.id == step.step_id);
    steps[itemstepid].checked = true;
    steps[itemstepid].completed = completed;
    
    item.steps = [...steps];

    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (-1==steps.findIndex(st => st.validated == false || st.checked == false)) {
      logger.log('item completed');
      item.status = 'completed';

      item.ingredients = _ventilationIngredientsSteps(item, produitSteps);


    }
  }
  item.prix = _getPrix(item, produitSteps);

  return item;
}


// on passe en revue chaque step pour déterminer le supplément pour chaque ingrédient
function _ventilationIngredientsSteps(item, produitSteps) {

  let __supplement = 0;
  let __ing = null;

  let __ingredients = [];

  produitSteps.forEach(step => {
    if (step.regles.length == 1 || (step.regles.length>1 && step.regles[0].regle.toLowerCase().indexOf('g') != -1)) {
      // on exécute le même test sur tous les types
      logger.log('on applique le test sur tous les types d’ingredients à la fois');
      __ing = item.ingredients.filter(ing => ing.fromStep == step.step_id);
      if (__ing.length>0) __ingredients = [...__ingredients, ..._setSupplements(step.regles[0], __ing)];
    }
    else {
      step.regles.forEach( regle => {
        __ing = item.ingredients.filter(ing => regle.type == ing.type);
        if (__ing.length>0) __ingredients = [...__ingredients, ..._setSupplements(regle, __ing)];
      })
    }
  });

  return __ingredients;

}


// on attribue le montant du supplément à chaque ingrédient, 
// en fonction des règles des steps
function _setSupplements(rule, ingredients) {
  logger.log('_setSupplements');

  const regle = rule.regle;
  let __ingredients = [];

  // s'il y a une indication de supplément dans la règle :
  if (regle.indexOf('s')!=-1) {
    const __deuxregles = regle.split(';s:');

    const __rulevaleurs = getRuleValues(__deuxregles[0]);
    const __supvaleurs = getRuleValues(__deuxregles[1]);

    // si la liste des ingrédients entre dans les critères du supplément
    if (_testIngredient({regle: __deuxregles[1]}, ingredients)) {

      // tri des ingrédients par supplément croissant (les plus élevés à la fin)
      ingredients.sort((a,b) => a.prix - b.prix);


      let __stack = 0;
      // compte les suppléments à partir du minimum des critères
      ingredients.forEach(ing => {
        ing.supplement = 0;
        for(let j=0;j<ing.qte;j++) {
          if (__stack>=__supvaleurs.min-1) {
            ing.supplement += ing.prix>0 ? Number(ing.prix) : Number(rule.supplement);
          }
          __stack++;
        }
        __ingredients.push(ing);
      });

    }

  } else {
    ingredients.forEach(ing => {
      ing.supplement = 0;
      ing.supplement += ing.prix>0 ? (ing.prix * ing.qte) : (rule.supplement * ing.qte);

      __ingredients.push(ing);
    })
  }

  return __ingredients;

}


function _getPrix(item, produitSteps) {

  let __supplement = 0;
  let __ing = null;

  produitSteps.forEach(step => {
    if (step.regles.length == 1 || (step.regles.length>1 && step.regles[0].regle.toLowerCase().indexOf('g') != -1)) {
      // on exécute le même test sur tous les types
      logger.log('on applique le test sur tous les types d’ingredients à la fois');
      __ing = item.ingredients.filter(ing => ing.fromStep == step.step_id);
      __supplement += _getSupplements(step.regles[0], __ing);
    }
    else {
      step.regles.forEach( regle => {
        __ing = item.ingredients.filter(ing => regle.type == ing.type);
        __supplement += _getSupplements(regle, __ing);
      })
    }
    logger.log('step '+step.step_id+' suppl = '+__supplement);
  });

  return item.pu + __supplement;

}

function _mustBeUnique(step, ingredient) {

  let __unique = false;
  let __type = null;

  // s'il n'y a qu'un type d'ingrédients
  // OU
  // s'il y a plusieurs types d'ingrédients dans le step
  // et que la règle vaut pour tous les types
  if (step.regles.length == 1 || (step.regles.length>1 && step.regles[0].regle.toLowerCase().indexOf('g') != -1)) {
    // si la règle impose un max. d'1 ingrédient:
    if (RegExp('^(\\?|\\{1,1\\}|\\{0,1\\}|\\{1\\})').test(step.regles[0].regle)) __unique = true;
    
  }
  // s'il y a plusieurs types d'ingrédients
  else if (step.regles.length>1) {
    const __regle = step.regles.find(st=>st.type==ingredient.type);

    // si la règle impose un max. d'1 ingrédient
    // on récupère le type correspondant à l'ingrédient
    if (RegExp('^(\\?|\\{1,1\\}|\\{0,1\\}|\\{1\\})').test(__regle.regle)) {
    // if (RegExp('^(\\?|\\{1\\})').test(__regle.regle)) {
      __unique = true;
      __type = ingredient.type;
    }
  }

  return {unique: __unique, type: __type};
}


function _checkStepRegles(step, item) {

  let __validated = true;
  let __completed = true;
  let __types = [];
  let __ing = [];

  // on stocke les types dans un tableau
  step.regles.forEach(rgl => {
    __types.push(rgl.type);
  });


  // s'il n'y a qu'un type d'ingrédients
  // OU
  // s'il y a plusieurs types d'ingrédients dans le step
  // et que la règle vaut pour tous les types
  if (step.regles.length == 1 || (step.regles.length>1 && step.regles[0].regle.toLowerCase().indexOf('g') != -1)) {
    // on exécute le même test sur tous les types
    logger.log('on applique le test sur tous les types d’ingredients à la fois');
    __ing = item.ingredients.filter(ing => __types.indexOf(ing.type)!=-1);
    if (!_testIngredient(step.regles[0], __ing)) __validated = false;
    if (!_testIngredient(step.regles[0], __ing, true)) __completed = false;
  }
  else {
    step.regles.forEach( regle => {
      __ing = item.ingredients.filter(ing => regle.type == ing.type);
      if (!_testIngredient(regle, __ing)) __validated = false;
      if (!_testIngredient(regle, __ing, true)) __completed = false;
    })
  }

  return {validated:__validated, completed:__completed};

}


function isStepOptionnal(step) {
  let __isOptionnal = false;
  // s'il n'y a qu'un type d'ingrédients
  // OU
  // s'il y a plusieurs types d'ingrédients dans le step
  // et que la règle vaut pour tous les types
  if (step.regles.length == 1 || (step.regles.length>1 && step.regles[0].regle.toLowerCase().indexOf('g') != -1)) {
    if (getRuleValues(step.regles[0].regle).min==0) __isOptionnal = true;
  } 
  // sinon (plusieurs types avec règles différentes), on additionne les valeurs minimales (si 0, c'est optionnel)
  else {
    let values = 0;
    step.regles.forEach( rgl => {
      values += getRuleValues(rgl.regle).min;
    });
    if (values==0) __isOptionnal = true;
  }

  return __isOptionnal;
}



function _getSupplements(rule, ingredients) {
  logger.log('_getSupplements');

  const regle = rule.regle;
  let __supplement = 0;

  // s'il y a une indication de supplément dans la règle :
  if (regle.indexOf('s')!=-1) {
    const __deuxregles = regle.split(';s:');

    const __rulevaleurs = getRuleValues(__deuxregles[0]);
    const __supvaleurs = getRuleValues(__deuxregles[1]);
  
    // si la liste des ingrédients entre dans les critères du supplément
    if (_testIngredient({regle: __deuxregles[1]}, ingredients)) {

      // tri des ingrédients par supplément croissant (les plus élevés à la fin)
      ingredients.sort((a,b) => a.prix - b.prix);


      let __ingstack = [];

      // compte les suppléments à partir du minimum des critères
      ingredients.forEach(ing => {

        for(let j=0;j<ing.qte;j++) __ingstack.push(ing);
      });
      __ingstack.forEach((ing,i) => {
        if (i>=__supvaleurs.min-1) __supplement += ing.prix>0 ? Number(ing.prix) : Number(rule.supplement);
      });

    }

  } else {
    ingredients.forEach(ing => {
      __supplement += ing.prix>0 ? (ing.prix * ing.qte) : (rule.supplement * ing.qte);
    })
  }

  return __supplement;

}


function _testIngredient(rule, ingredients, max=false) {

  const regle = rule.regle;
  let __valeurs = getRuleValues(regle);
  let __total = 0;

  // calcul de la quantité
  ingredients.forEach(ing => {
    __total += ing.qte;
  });


  let __confirm = false;
  let __c = 0;

  if (max) {
    if (__valeurs.max == __total) __c = 2;
  } else {
    // si la quantité est dans le créneau valeurs min <= total <= max
    if (__valeurs.max == -1 || __total <= __valeurs.max) __c++;
    if (__total >= __valeurs.min) __c++;

    // si la quantité correspond à la valeur fixe
    if (__valeurs.max == __valeurs.min && __valeurs.min == __total) __c = 2;
  }
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

  logger.log('getRuleValues('+rule+')');

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
  const { moyen, valeur, info } = payload;

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
    valeur: valeur,
    info: info
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


function addComment(payload, comments) {
  const {item, ingredient, texte} = payload;

  return {
    comment_id: _newCommentId(),
    item: item,
    ingredient: ingredient,
    texte: texte
  };
}


function addModificateur(payload, comments) {
  const {item, ingredient, valeur} = payload;

  return {
    modificateur_id: _newModificateurId(),
    item: item,
    ingredient: ingredient,
    valeur: valeur
  };
}


function saveCommande(commande, catalogueReducer) {
/*
  let __cmd = {
    commande_id: payload.ticketId,
    operator: {id: payload.operator.id, nom: payload.operator.nom},
    caisse: payload.caisse,
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
  for (let [key, value] of Object.entries(catalogueReducer.catalogue)) {
    produits = [...produits, ...value.produits];
  }

  // on ajoute les infos de tva à chaque item de la commande
  commande.items.forEach(itm => {

    let ingrd = [];
    // on ajoute les infos de tva à chaque ingrédient de chaque item de la commande
    if (itm.ingredients.length>0) {
      itm.ingredients.forEach(ing => {
       const ingr = catalogueReducer.ingredients[ing.ingredient];
       ingrd.push({
         ...ing,
         tva: {id: ingr.tva_id, code: catalogueReducer.tva[ingr.tva_id].code, valeur: catalogueReducer.tva[ingr.tva_id].valeur}
        })
      });
      itm.ingredients = ingrd;
    }


    const prd = produits.find(p => p.id==itm.produitid);
    items.push({
      ...itm,
      tva: {id: prd.tva_id, code: catalogueReducer.tva[prd.tva_id].code, valeur: catalogueReducer.tva[prd.tva_id].valeur}
    })


  });

  

  const __c = {
    ...commande,
    items,
    total: _getCommandeTotal(commande.items, commande.modificateurs)
  }


  return emit('dbCommandePersist', {commande:__c});
}

function persistCommande(commande) {
  return emit('dbCommandePersist', {commande:commande});
}

function archiveCommands(commandesid, clotureId) {
  return emit('dbCommandeArchive', {ids:commandesid, clotureId:clotureId});
}


function setCommandeFromOrder(data, catalogueReducer, parametres, numero) {

  const commande = getNewCommande(data);
  commande.centre_revenu = 'uber';
  commande.status = 'confirmed'; // "standby" ou "confirmed"
  commande.mode = 'livraison'; // "emporter", "surplace" ou "livraison"
  commande.numero = getNewNumero(parametres, numero);

  // on met tous les produits dans le même array
  let produits = [];
  for (let [key, value] of Object.entries(catalogueReducer.catalogue)) {
    produits = [...produits, ...value.produits];
  }

  data.cart.items.forEach(itm => {

    // infos du produit issues du catalogue
    const prd = produits.find(p => p.id==itm.id);

    if (prd) {

      // steps de personnalisation du produit issus du catalogue
      let steps = catalogueReducer.steps[itm.id];
      let steps_list = [];
      if (steps) {
        steps.forEach(step => {
          steps_list.push({id: step.step_id, completed: true, validated: true}); // <-- "completed=true" parce que commande terminée
        }); 
      } else {
        steps = [];
      }
      

      // création de l'item (produit dans la commande)
      const item = {
        produitid: itm.id,
        nom: prd.nom,
//        prix: itm.quantity*Number(prd.prix),
        prix: itm.quantity*Number(itm.price.unit_price.amount/100),
        pu: Number(itm.price.unit_price.amount/100),
        tva: {...catalogueReducer.tva[prd.tva_id]},
        composition: prd.composition,
        ingredients: [...prd.composition],
        steps: steps_list,
        stepslength: steps.length,
        quantite: itm.quantity,
        itemid: _newCommandeItemId(),
        status: 'completed'
      };


      // ajout commentaire sur item
      if (itm.special_instructions && itm.special_instructions!=='') {
        commande.comments.push(addComment({
                      item: item.itemid, 
                      ingredient: null, 
                      texte: itm.special_instructions},null));
      }

      // ajout des ingrédients (personnalisation)
      itm.selected_modifier_groups.forEach(mod => {
        mod.selected_items.forEach(ing => {
          
          // infos de l'ingrédient issues du catalogue
          const ingredient = catalogueReducer.ingredients[ing.id];
          
          logger.log(ing.id, ingredient);
          
          if (ingredient) {

            logger.log('steps', steps);

            const ingredient_step = steps.find(st => {
              let __istype = false;
              st.regles.forEach(str => {
                logger.log(str.type, ingredient.type);
                if (str.type==ingredient.type) __istype = true;
              });
              return __istype;
            });

           item.ingredients.push({ingredient: ing.id, type: ingredient.type, qte: ing.quantity, prix: Number(ing.price.unit_price.amount/100), nom: ingredient.nom, fromStep:ingredient_step.step_id});
            // item.ingredients.push({ingredient: ing.id, type: ingredient.type, qte: ing.quantity, prix: Number(ing.price.unit_price.amount/100), nom: ingredient.nom });
          }

        });
      });

      item.prix = Number(itm.price.total_price.amount/100);
      commande.items.push(item);
    }
    
  });

  // couverts demandés ?
  if (data.packaging && data.packaging.disposable_items && data.packaging.disposable_items.should_include) {

    commande.comments.push(addComment({
      item: null, 
      ingredient: null, 
      texte: strings.tickets.uber.couverts
    },null));
  }

  // // ajout des charges :
  // commande.modificateurs.push(
  //   addModificateur({
  //     item: null,
  //     ingredient: null,
  //     valeur: Number(data.payment.charges.total_fee.amount)/100
  //   },null)
  // );
      
  commande.total = Number(data.payment.charges.sub_total.amount/100);
  return commande;


}


function setCommandeFromAPI(data, catalogueReducer, parametres, numero) {

  const commande = getNewCommande(data);
  commande.status = data.status; // "standby" ou "confirmed"
  commande.mode = data.mode; // "emporter", "surplace" ou "livraison"
  commande.numero = getNewNumero(parametres, numero);

  // on met tous les produits dans le même array
  let produits = [];
  for (let [key, value] of Object.entries(catalogueReducer.catalogue)) {
    produits = [...produits, ...value.produits];
  }

  data.items.forEach(itm => {

    // infos du produit issues du catalogue
    const prd = produits.find(p => p.id==itm.produitid);

    if (prd) {

      // steps de personnalisation du produit issus du catalogue
      let steps = catalogueReducer.steps[itm.produitid];
      let steps_list = [];
      if (steps) {
        steps.forEach(step => {
          steps_list.push({id: step.step_id, completed: true, validated: true}); // <-- "completed=true" parce que commande terminée
        }); 
      } else {
        steps = [];
      }
      

      // création de l'item (produit dans la commande)
      const item = {
        produitid: itm.produitid,
        nom: prd.nom,
        prix: itm.quantite*Number(prd.prix),
        pu: Number(prd.prix),
        tva: {...catalogueReducer.tva[prd.tva_id]},
        composition: prd.composition,
        ingredients: [...prd.composition],
        steps: steps_list,
        stepslength: steps.length,
        quantite: itm.quantite,
        itemid: _newCommandeItemId(),
        status: 'completed'
      };

      // ajout des ingrédients (personnalisation)
      itm.ingredients.forEach(ing => {

        // infos de l'ingrédient issues du catalogue
        const ingredient = catalogueReducer.ingredients[ing.ingredient];
        if (ingredient) {
          const ingredient_step = steps.find(st => {
            let __istype = false;
            st.regles.forEach(str => {
              if (str.type==ingredient.type) __istype = true;
            });
            return __istype;
          });

          item.ingredients.push({ingredient: ing.ingredient, type: ingredient.type, qte: ing.qte, prix: Number(ingredient.supplement), nom: ingredient.nom, fromStep:ingredient_step.step_id});
        }

      });

      item.prix = _getPrix(item, steps)    
      commande.items.push(item);
    }
    
  });
  
  commande.total = _getCommandeTotal(commande.items, []);
  return commande;


}


function sendTicketId(ticketId, response) {
  logger.log('commandeServices.sendTicketId('+ticketId+')')
  return emit('sendTicketId', {ticketId, response});
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
const _newCommentId = () => {
    let __d = new Date();
    return __d.getTime().toString();
}
const _newModificateurId = () => {
    let __d = new Date();
    return __d.getTime().toString();
}


const _getCommandeTotal = (items, modificateurs) => {
  // montant à payer (somme des items)
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