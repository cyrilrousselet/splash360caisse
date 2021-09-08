import { emit } from "eiphop";
import LodashId from "lodash-id";
import LocalizedStrings from "react-localization";
import { data } from "../../constants/translations";
// import Logger from "../../helpers/Logger";
import logger from "../../helpers/Logger";
import {MODES} from '../../constants/commandeModes';
import {add} from "date-fns";

const strings = new LocalizedStrings(data);
// const logger = new Logger();



export const commandeServices = {
  getNewCommande,
  getCommandeById,
  getCommandesList,
  //  getNewNumero,
  checkMarketing,
  getCommandesCaisses,
  addProduit,
  updateProduit,
  addReglement,
  addRendu,
  addComment,
  addModificateur,
  saveCommande,
  updateMode,
  persistCommande,
  deleteCommande,
  archiveCommands,
  setSyncedCommands,
  addIngredient,
  removeIngredient,
  noIngredientForStep,
  completeStep,
  uncheckItemSteps,
  getRuleValues,
  setCommandeFromOrder,
  setCommandeFromSync,
  setCommandeFromAPI,
  sendTicketId,
  getCommandesToSync,
  getAllTicketsRestaurant,
  persistTicketsRestaurants,
  persistSingleTicketRestaurant,
  getNewCommandeItemId,
  createLot,
  getLot,
  getAllLots,
  deleteLot,
  saveLot,
};

function getNewCommande(params) {
  return {
    ticketId: params.ticketId || params.ticket_id || _newCommandeId(),
    numero: null,
    operator: { id: params.operator.id, nom: params.operator.nom },
    caisse: params.caisse,
    comments: [],
    operator_encaissement: params.operator_encaissement || null,
    caisse_encaissement: params.caisse_encaissement || null,
    centre_revenu: "restaurant",
    items: [],
    client: params.client ? params.client : null,
    reglements: params.reglements || [],
    modificateurs: [],
    rendus: [],
    start: null,
    end: null,
    chrono: 0,
    total: 0,
    printnum: 0,
    mode: "surplace",
    status: "pending",
    type: "vente",
    livreur: null,
    pickedAt: null,
    scheduled: null,
    lot: null,
    enproduction: params.enproduction ? params.enproduction : false,
    shippedAt: null,
    beneficiaire: params.beneficiaire ? params.beneficiaire : null,
  };
}

function getNewCommandeItemId() {
  return _newCommandeItemId();
}

function getCommandeById(id) {
  logger.info("getCommandeById", id);
  return emit("dbCommandeGetCommande", { ticketId: id });
}
function deleteCommande(id, motif) {
  return emit("dbCommandeDelete", { ticketId: id, motif: motif });
}
function getCommandesList(params) {
  return emit("dbCommandeGetAll", params);
}

function getAllTicketsRestaurant(params) {
  return emit("dbTicketsRestauGetAll", params);
}
function persistTicketsRestaurants(liste, caisseId) {
  const trliste = liste.map((trid) => {
    const __trValue = Number(trid.substr(11, 5)) / 100;
    const __trValid = Number(trid.substr(16, 4));
    return { id: trid, valeur: __trValue, valid: __trValid, localsync: [caisseId] };
  });
  return emit("dbTicketsRestauPersist", { payload: trliste });
}

function persistSingleTicketRestaurant(tr) {
  return emit("dbTicketsRestauPersist", {payload: tr});
}

function getCommandesCaisses() {
  return emit('dbCommandesGetCaisses',{});
}

function addProduit(payload, tva, items, steps) {
  const { produitid, nom, prix, puht, composition, customizable, status } = payload;

  let mode = "";
  let item = {};

  // s'il s'agit d'un produit customisable, on crée un autre item
  if (customizable) {
    mode = "add";

    let steps_list = [];
    steps.forEach((step) => {
      steps_list.push({
        id: step.step_id,
        completed: false,
        validated: isStepOptionnal(step),
        checked: false,
      });
    });

    item = {
      produitid: produitid,
      nom: nom,
      prix: prix,
      pu: prix,
      puht: puht,
      tva: tva,
      composition: composition,
      ingredients: [...composition],
      steps: steps_list,
      stepslength: steps.length,
      quantite: 1,
      itemid: _newCommandeItemId(),
      status: status || "pending",
    };
  }
  // s'il s'agit d'un produit non customisable,
  else {
    // on recherche s'il existe un item du même produit
    item = items.find((itm) => {
      return itm.produitid === produitid;
    });
    // si aucun item ne correspond, on l'ajoute
    mode = "add";
    if (undefined === item) {
      item = {
        produitid: produitid,
        nom: nom,
        prix: prix,
        pu: prix,
        puht: puht,
        tva: tva,
        composition: composition,
        ingredients: [...composition],
        quantite: 1,
        itemid: _newCommandeItemId(),
        status: "completed",
      };
    }
    // sinon on modifie la quantité de l'item
    else {
      item.quantite += 1;
      mode = "update";
    }
  }

  return { commandeItem: item, mode: mode };
}

function updateProduit(payload, item) {
  const { quantite } = payload;

  let mode = "update";
  item.quantite = quantite;
  if (item.quantite === 0) mode = "delete";

  return { commandeItem: item, mode: mode };
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
function addIngredient(ingredient, quantite, step, item, produitSteps, tva, commandeMode) {
  const { ingredients, steps } = item;

  // si la règle du step impose un seul ingrédient
  // on vérifie si un ingrédient existe déjà pour le step
  // et on le supprime avant d'ajouter le nouvel ingrédient
  const { unique, type } = _mustBeUnique(step, ingredient);

  logger.info(
    "step #" + step.step_id + " " + (unique ? "unique" : "pas unique")
  );
  if (unique) {
    let ingdustepInCmd = -1;
    // s'il n'y a aucun type précisé, on supprime l'ingrédient du step
    if (null == type) {
      logger.info("aucun type précisé => suppression de l’ing du step");
      ingdustepInCmd = ingredients.findIndex(
        (ing) => ing.fromStep === step.step_id
      );
      if (ingdustepInCmd > -1) ingredients.splice(ingdustepInCmd, 1);
    }
    // si un type est précisé, on supprime l'ingrédient du type (et du step)
    else {
      logger.info(
        "type " + type + " => suppression de l’ing du type et du step"
      );
      ingdustepInCmd = ingredients.findIndex(
        (ing) => ing.fromStep === step.step_id && ing.type === type
      );
      if (ingdustepInCmd > -1) ingredients.splice(ingdustepInCmd, 1);
    }
  }

  const ingInCmdId = ingredients.findIndex(
    (ing) => ing.ingredient === ingredient.id
  );
  // si l'ingredient n'est pas encore dans la liste de l'item
  if (-1 === ingInCmdId) {
    item.ingredients.push({
      ingredient: ingredient.id,
      type: ingredient.type,
      qte: 1,
      prix: Number(ingredient.supplementArray[MODES[commandeMode]].ttc),
      ht: Number(ingredient.supplementArray[MODES[commandeMode]].ht),
      nom: ingredient.nom,
      fromStep: step.step_id,
      tva: tva,
    });
  }
  // sinon on augmente d'1 la quantité de l'ingrédient
  else {
    ingredients[ingInCmdId].qte += 1;
    item.ingredients = [...ingredients];
  }

  // test du step (validation et supplément)
  const { completed, validated } = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  const itemstepid = steps.findIndex((st) => st.id === step.step_id);
  steps[itemstepid].validated = validated;
  steps[itemstepid].completed = completed;
  steps[itemstepid].checked = validated && completed;
  item.steps = [...steps];

  if (validated) {
    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (
      steps.findIndex(
        (st) => st.validated === false || st.checked === false
      ) === -1
    ) {
      item.status = "completed";
      item.ingredients = _ventilationIngredientsSteps(item, produitSteps);
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
  const { ingredients, steps } = item;

  logger.info(step);

  const ingInCmdId = ingredients.findIndex(
    (ing) => ing.ingredient === ingredient.id
  );
  // l'ingredient est-il dans la liste de l'item ?
  if (-1 < ingInCmdId) {
    ingredients[ingInCmdId].qte -= 1;
    // si la quantité de l'ingrédient est à 0, on le supprime de la liste
    if (0 >= ingredients[ingInCmdId].qte) {
      ingredients.splice(ingInCmdId, 1);
    }

    item.ingredients = [...ingredients];
  }

  // test du step (validation et supplément)
  const { validated, completed } = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  const itemstepid = steps.findIndex((st) => st.id === step.step_id);
  steps[itemstepid].validated = validated;
  steps[itemstepid].completed = completed;
  steps[itemstepid].checked = validated && completed;

  item.steps = [...steps];

  if (validated) {
    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (
      -1 ===
      steps.findIndex((st) => st.validated === false || st.checked === false)
    ) {
      item.status = "completed";
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
  const { ingredients, steps } = item;

  logger.info(step);

  ingredients.forEach((ing, i) => {
    if (ing.fromStep === step.step_id) ingredients.splice(i, 1);
  });

  item.ingredients = [...ingredients];

  // test du step (validation et supplément)
  const { validated, completed } = _checkStepRegles(step, item);
  // on vérifie si l'ajout est raccord avec la liste
  // et on indique que le step est "completed", le cas échéant
  if (validated) {
    const itemstepid = steps.findIndex((st) => st.id === step.step_id);
    steps[itemstepid].validated = true;
    steps[itemstepid].completed = completed;
    steps[itemstepid].checked = true;

    item.steps = [...steps];

    // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
    // on passe le status de l'item de "pending" à "completed"
    if (
      steps.findIndex(
        (st) => st.validated === false || st.checked === false
      ) === -1
    ) {
      item.status = "completed";
    }
  }

  // item.prix = prixtotal;
  item.prix = _getPrix(item, produitSteps);

  return item;
}

function uncheckItemSteps(item, stepid) {
  const { steps } = item;
  if (stepid !== null && stepid !== undefined) {
    const itemstepid = steps.findIndex((st) => st.id === stepid);
    steps[itemstepid].checked = false;
    item.steps = [...steps];
  } else {
    const uncheckedSteps = steps.map((st) => ({ ...st, checked: false }));
    item.steps = uncheckedSteps;
  }

  return item;
}

function completeStep(step, item, produitSteps) {
  logger.info("completeStep");
  return new Promise((resolve, reject) => {
    const { steps } = item;

    const { validated, completed } = _checkStepRegles(step, item);
    if (validated) {
      const itemstepid = steps.findIndex((st) => st.id === step.step_id);
      steps[itemstepid].checked = true;
      steps[itemstepid].completed = completed;

      item.steps = [...steps];

      // si tous les steps sont "validated" (dans les règles) et "checked" (personnalisé)
      // on passe le status de l'item de "pending" à "completed"
      const pasfiniIndex = steps.findIndex(
        (st) => st.validated === false || st.checked === false
      );
      logger.info("pasfiniIndex", pasfiniIndex);
      if (-1 === pasfiniIndex) {
        logger.info("item completed");
        item.status = "completed";

        item.ingredients = _ventilationIngredientsSteps(item, produitSteps);
      }
    }
    item.prix = _getPrix(item, produitSteps);

    resolve(item);
  });
}

function updateMode(mode, commande, data_catalogue) {
  const {ingredients, catalogue, steps, tva} = data_catalogue;


  commande.mode = mode;

  const __modeid = MODES[mode];

  let __items = [...commande.items];
  let __cmdtotal = 0;
  // mise à jour des items (prix et tva)
  __items = __items.map(itm => {
    
    const __produit = _getProduit(itm.produitid,catalogue);

    let __itming = [...itm.ingredients];
    __itming = __itming.map(ing => {

      let __ingredient = ingredients[ing.ingredient];
      logger.info('ingredient id', ing.ingredient, __ingredient, 'ht='+Number(__ingredient.supplementArray[__modeid].ht));
      return {
        ...ing,
        tva: tva[__ingredient.tvaArray[__modeid]],
      //  supplement: Number(__ingredient.supplementArray[__modeid].ttc),
        prix: Number(__ingredient.supplementArray[__modeid].ttc),
        ht: Number(__ingredient.supplementArray[__modeid].ht)
      };
    });
    

    let __ritm = {
      ...itm,
      tva: tva[__produit.tvaArray[__modeid]],
      pu: Number(__produit.prixArray[__modeid].ttc),
      ingredients: __itming
    };

    let __stepsDuProduit = steps[itm.produitid];
    
    if (__stepsDuProduit) {  
      __ritm.ingredients = _ventilationIngredientsSteps(__ritm, __stepsDuProduit);
    }

    // __ritm.prix = __stepsDuProduit ? _getPrix(__ritm, __stepsDuProduit) : (__ritm.pu * __ritm.quantite);
    __ritm.prix = __stepsDuProduit ? _getPrix(__ritm, __stepsDuProduit) : __ritm.pu;
    __cmdtotal += __ritm.prix;
    return __ritm;

  });
  commande.items = __items;

  commande.total = __cmdtotal;

  return commande;
}


function _getProduit(id, catalogue) {
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


// on passe en revue chaque step pour déterminer le supplément pour chaque ingrédient
function _ventilationIngredientsSteps(item, produitSteps) {
  logger.info("_ventilationIngredientsSteps()");
  // let __supplement = 0;
  let __ing = null;

  let __ingredients = [];

  produitSteps.forEach((step) => {
    if (
      step.regles.length === 1 ||
      (step.regles.length > 1 &&
        step.regles[0].regle.toLowerCase().indexOf("g") > -1)
    ) {
      // on exécute le même test sur tous les types
      logger.info(
        "on applique le test sur tous les types d’ingredients à la fois"
      );
      __ing = item.ingredients.filter((ing) => ing.fromStep === step.step_id);
      if (__ing.length > 0)
        __ingredients = [
          ...__ingredients,
          ..._setSupplements(step.regles[0], __ing),
        ];
    } else {
      step.regles.forEach((regle) => {
        __ing = item.ingredients.filter((ing) => regle.type === ing.type);
        if (__ing.length > 0)
          __ingredients = [...__ingredients, ..._setSupplements(regle, __ing)];
      });
    }
  });

  return __ingredients;
}

// on attribue le montant du supplément à chaque ingrédient,
// en fonction des règles des steps
function _setSupplements(rule, ingredients) {
  logger.info("_setSupplements");

  const regle = rule.regle;
  let __ingredients = [];

  // s'il y a une indication de supplément dans la règle :
  if (regle.indexOf("s") > -1) {
    const __deuxregles = regle.split(";s:");

    // const __rulevaleurs = getRuleValues(__deuxregles[0]);
    const __supvaleurs = getRuleValues(__deuxregles[1]);

    // si la liste des ingrédients entre dans les critères du supplément
    if (_testIngredient({ regle: __deuxregles[1] }, ingredients)) {
      // tri des ingrédients par supplément croissant (les plus élevés à la fin)
      ingredients.sort((a, b) => a.prix - b.prix);

      let __stack = 0;
      // compte les suppléments à partir du minimum des critères
      ingredients.forEach((ing) => {
        ing.supplement = 0;
        ing.supplementht = 0;
        for (let j = 0; j < ing.qte; j++) {
          ing.supplement += Number(ing.prix);
          ing.supplementht += Number(ing.ht);
          if (__stack >= __supvaleurs.min - 1) {
            // ing.supplement += Number(ing.prix)>0 ? Number(ing.prix) : Number(rule.supplement);
            ing.supplement += Number(rule.supplement);
            ing.supplementht += Number( ( Number(rule.supplement) /  1 + Number(ing.tva.valeur) ).toFixed(2) );
          }
          __stack++;
        }
        __ingredients.push(ing);
      });
    } else {
      // let __stack = 0;
      // on compte uniquement le prix des ingrédients
      ingredients.forEach((ing) => {
        ing.supplement = 0;
        ing.supplementht = 0;
        ing.supplement += Number(ing.prix) * ing.qte;
        ing.supplementht += Number(ing.ht) * ing.qte;
        __ingredients.push(ing);
      });
    }
  } else {
    ingredients.forEach((ing) => {
      ing.supplement = 0;
      ing.supplementht = 0;
      ing.supplement += (Number(ing.prix) + Number(rule.supplement)) * ing.qte;
      ing.supplementht += (Number(ing.ht) + Number(rule.supplement)) * ing.qte;
      __ingredients.push(ing);
    });
  }

  return __ingredients;
}

function _getPrix(item, produitSteps) {
  let __supplement = 0;
  let __ing = null;

  logger.info('commandeServices._getPrix()', produitSteps);

  produitSteps.forEach((step) => {
    if (
      step.regles.length === 1 ||
      (step.regles.length > 1 &&
        step.regles[0].regle.toLowerCase().indexOf("g") > -1)
    ) {
      // on exécute le même test sur tous les types
      logger.info(
        "on applique le test sur tous les types d’ingredients à la fois"
      );
      __ing = item.ingredients.filter((ing) => ing.fromStep === step.step_id);
      __supplement += _getSupplements(step.regles[0], __ing);
    } else {
      step.regles.forEach((regle) => {
        __ing = item.ingredients.filter((ing) => regle.type === ing.type);
        __supplement += _getSupplements(regle, __ing);
      });
    }
    logger.info("step " + step.step_id + " suppl = " + __supplement);
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
  if (
    step.regles.length === 1 ||
    (step.regles.length > 1 &&
      step.regles[0].regle.toLowerCase().indexOf("g") > -1)
  ) {
    // si la règle impose un max. d'1 ingrédient:
    if (RegExp("^(\\?|\\{1,1\\}|\\{0,1\\}|\\{1\\})").test(step.regles[0].regle))
      __unique = true;
  }
  // s'il y a plusieurs types d'ingrédients
  else if (step.regles.length > 1) {
    const __regle = step.regles.find((st) => st.type === ingredient.type);

    // si la règle impose un max. d'1 ingrédient
    // on récupère le type correspondant à l'ingrédient
    if (RegExp("^(\\?|\\{1,1\\}|\\{0,1\\}|\\{1\\})").test(__regle.regle)) {
      // if (RegExp('^(\\?|\\{1\\})').test(__regle.regle)) {
      __unique = true;
      __type = ingredient.type;
    }
  }

  return { unique: __unique, type: __type };
}

function _checkStepRegles(step, item) {
  let __validated = true;
  let __completed = true;
  let __types = [];
  let __ing = [];

  // on stocke les types dans un tableau
  step.regles.forEach((rgl) => {
    __types.push(rgl.type);
  });

  // s'il n'y a qu'un type d'ingrédients
  // OU
  // s'il y a plusieurs types d'ingrédients dans le step
  // et que la règle vaut pour tous les types
  if (
    step.regles.length === 1 ||
    (step.regles.length > 1 &&
      step.regles[0].regle.toLowerCase().indexOf("g") > -1)
  ) {
    // on exécute le même test sur tous les types
    logger.info(
      "on applique le test sur tous les types d’ingredients à la fois"
    );
    __ing = item.ingredients.filter(
      (ing) => __types.indexOf(ing.type) > -1 && ing.fromStep === step.step_id
    );
    if (!_testIngredient(step.regles[0], __ing)) __validated = false;
    if (!_testIngredient(step.regles[0], __ing, true)) __completed = false;
  } else {
    step.regles.forEach((regle) => {
      __ing = item.ingredients.filter(
        (ing) => regle.type === ing.type && ing.fromStep === step.step_id
      );
      if (!_testIngredient(regle, __ing)) __validated = false;
      if (!_testIngredient(regle, __ing, true)) __completed = false;
    });
  }

  return { validated: __validated, completed: __completed };
}

function isStepOptionnal(step) {
  let __isOptionnal = false;
  // s'il n'y a qu'un type d'ingrédients
  // OU
  // s'il y a plusieurs types d'ingrédients dans le step
  // et que la règle vaut pour tous les types
  if (
    step.regles.length === 1 ||
    (step.regles.length > 1 &&
      step.regles[0].regle.toLowerCase().indexOf("g") > -1)
  ) {
    if (getRuleValues(step.regles[0].regle).min === 0) __isOptionnal = true;
  }
  // sinon (plusieurs types avec règles différentes), on additionne les valeurs minimales (si 0, c'est optionnel)
  else {
    let values = 0;
    step.regles.forEach((rgl) => {
      values += getRuleValues(rgl.regle).min;
    });
    if (values === 0) __isOptionnal = true;
  }

  return __isOptionnal;
}

function _getSupplements(rule, ingredients) {
  logger.info("_getSupplements");

  const regle = rule.regle;
  let __supplement = 0;

  // s'il y a une indication de supplément dans la règle :
  if (regle.indexOf("s") > -1) {
    const __deuxregles = regle.split(";s:");

    // const __rulevaleurs = getRuleValues(__deuxregles[0]);
    const __supvaleurs = getRuleValues(__deuxregles[1]);

    // si la liste des ingrédients entre dans les critères du supplément
    if (_testIngredient({ regle: __deuxregles[1] }, ingredients)) {
      // tri des ingrédients par supplément croissant (les plus élevés à la fin)
      ingredients.sort((a, b) => a.prix - b.prix);

      let __ingstack = [];

      // compte les suppléments à partir du minimum des critères
      ingredients.forEach((ing) => {
        for (let j = 0; j < ing.qte; j++) __ingstack.push(ing);
      });

      __ingstack.forEach((ing, i) => {
        // if (i>=__supvaleurs.min-1) __supplement += ing.prix>0 ? Number(ing.prix) : Number(rule.supplement);
        __supplement += Number(ing.prix);
        if (i >= __supvaleurs.min - 1) __supplement += Number(rule.supplement);
      });
    } else {
      ingredients.forEach((ing) => {
        __supplement += Number(ing.prix);
      });
    }
  } else {
    ingredients.forEach((ing) => {
      __supplement += (Number(ing.prix) + Number(rule.supplement)) * ing.qte;
    });
  }

  return __supplement;
}

function _testIngredient(rule, ingredients, max = false) {
  const regle = rule.regle;
  let __valeurs = getRuleValues(regle);
  let __total = 0;

  // calcul de la quantité
  ingredients.forEach((ing) => {
    __total += ing.qte;
  });

  let __confirm = false;
  let __c = 0;

  if (max) {
    if (__valeurs.max === __total) __c = 2;
  } else {
    // si la quantité est dans le créneau valeurs min <= total <= max
    if (__valeurs.max === -1 || __total <= __valeurs.max) __c++;
    if (__total >= __valeurs.min) __c++;

    // si la quantité correspond à la valeur fixe
    if (__valeurs.max === __valeurs.min && __valeurs.min === __total) __c = 2;
  }
  if (__c === 2) __confirm = true;

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
function getRuleValues(rule) {
  logger.info("getRuleValues(" + rule + ")");

  let __valeurs = { min: 0, max: -1, global: false }; // par défaut, règle '*'

  let __rule = "";
  if (rule.indexOf(";") > -1) {
    __rule = rule.substring(0, rule.indexOf(";"));
  } else {
    __rule = rule;
  }

  // valeur booléenne
  if (__rule === "?") {
    __valeurs.max = 1;
  }
  // 1 ou plus
  else if (__rule === "+") {
    __valeurs.min = 1;
  }
  // valeurs explicites
  else if (__rule.slice(0, 1) === "{") {
    // on récupère le contenu de la règle et le flag précisant si la règle est globale
    let __cont = /^\{(.*)\}(g?)$/.exec(__rule);
    __valeurs.global = __cont[2] === "g";

    // s'il y a deux valeurs explicites
    if (__cont[1].indexOf(",") > -1) {
      __valeurs.min = Number(__cont[1].split(",")[0]);
      __valeurs.max = Number(__cont[1].split(",")[1]);
      // si la valeur max n'est pas fixée ('*', '+' ou chaîne vide)
      if (/^$|^[*+]$/.test(__cont[1].split(",")[1])) __valeurs.max = -1;
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

  const esp = reglements.filter((rgl) => rgl.moyen === "especes");

  if (esp.length > 0 && moyen === "especes") {
    const newvaleur = esp[0].valeur + valeur;
    return {
      ...esp[0],
      valeur: newvaleur,
    };
  }

  return {
    reglementId: _newReglementId(),
    moyen: moyen,
    valeur: valeur,
    info: info,
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
    valeur: valeur,
  };
}

function addComment(payload, comments) {
  const { item, ingredient, texte } = payload;

  return {
    comment_id: _newCommentId(),
    item: item,
    ingredient: ingredient,
    texte: texte,
  };
}

function addModificateur(payload, modificateurs) {
  
  const { 
    item, 
    ingredient, 
    valeur, 
    nom, 
    type = 'discount', 
    operation = -1 
  } = payload;

  return {
    modificateur_id: _newModificateurId(),
    item: item,
    ingredient: ingredient,
    valeur: valeur,
    nom: nom,
    type: type,
    operation: operation
  };
}






function saveCommande(commande, catalogueReducer) {
  logger.info("CmdSrv.saveCommande()", commande);

  let items = [];

  // on met tous les produits dans le même array
  let produits = [];
  // for (let [key, value] of Object.entries(catalogueReducer.catalogue)) {
  Object.values(catalogueReducer.catalogue).forEach((value) => {
    produits = [...produits, ...value.produits];
  });

  // on ajoute les infos de tva à chaque item de la commande
  commande.items.forEach((itm) => {
    let ingrd = [];
    // on ajoute les infos de tva à chaque ingrédient de chaque item de la commande
    if (itm.ingredients.length > 0) {
      itm.ingredients.forEach((ing) => {
        const ingr = catalogueReducer.ingredients[ing.ingredient];
        ingrd.push({
          ...ing,
          tva: {
            id: ingr.tva_id,
            code: catalogueReducer.tva[ingr.tva_id].code,
            valeur: catalogueReducer.tva[ingr.tva_id].valeur,
          },
        });
      });
      itm.ingredients = ingrd;
    }

    const prd = produits.find((p) => p.id === itm.produitid);
    items.push({
      ...itm,
      tva: {
        id: prd.tva_id,
        code: catalogueReducer.tva[prd.tva_id].code,
        valeur: catalogueReducer.tva[prd.tva_id].valeur,
      },
    });
  });

  const __c = {
    ...commande,
    items,
    total: _getCommandeTotal(commande.items, commande.modificateurs),
  };


  const __commandeVentilee = _getVentilation(__c);

  return emit("dbCommandePersist", { commande: __commandeVentilee });
}


// si la commande est confirmée,
// on ventile la TVA au sein de chaque item et au sein de la commande
// et on récapitule les Discounts
function _getVentilation(commande) {

  let __cmd = commande;

  if (commande.status==="confirmed") {


    let __ventilation = {};
    let __basecmd = 0;

    // pour chaque item de commande
    __cmd.items.forEach( (itm, i) => {

      // (le TTC = pu (prix unique) * quantite)
      let __ttc = itm.pu * itm.quantite;
      let __ht = itm.puht * itm.quantite;
      // le prix correspond au montant du produit avec les ingrédients
      let __baseprix = itm.prix * itm.quantite;
      
      if (!__cmd.centimes) {
        __ttc = Math.round(__ttc * 100);
        __ht = Math.round(__ht * 100);
        __baseprix = Math.round(__baseprix * 100);
      } 
      
      __basecmd += __baseprix;

      // on récupère la tva de l'item et on déduit les montants HT, TVA et TTC au niveau de l'item
      const __tx = Number(itm.tva.valeur);
      let __itmventil = {
        [itm.tva.id]: {
          taux: __tx,
          code: itm.tva.code,
          ttc: __ttc,
          ht: __ht,
          tva: __ttc - __ht
          // ht: Math.round(__ttc / (1 + __tx)),
          // tva: Math.round((__ttc / (1 + __tx)) * __tx)
        }
      };

      // s'il y a au moins un ingredient
      itm.ingredients.forEach(ing => {

        // on récupère la tva de l'ingredient et on déduit les montants HT, TVA et TTC
        // (le TTC = supplement)
        const __itx = Number(ing.tva.valeur);
        const __ittc = (!__cmd.centimes) ? Math.round(ing.supplement * 100) : ing.supplement;
        const __iht = (!__cmd.centimes) ? Math.round(ing.supplementht * 100) : ing.supplementht;

        if (__ittc>0) {

          if (!__itmventil.hasOwnProperty(ing.tva.id)) {
            __itmventil[ing.tva.id] = {
              taux: __itx,
              code: ing.tva.code,
              ttc: 0,
              ht: 0,
              tva: 0
            };
          }
        
          Object.assign(__itmventil[ing.tva.id], {
            ttc: __itmventil[ing.tva.id].ttc + __ittc,
            ht: __itmventil[ing.tva.id].ht + __iht,
            tva: __itmventil[ing.tva.id].tva + (__ittc - __iht)
            // ht: __itmventil[ing.tva.id].ht + Math.round(__ittc / (1 + __itx)),
            // tva: __itmventil[ing.tva.id].tva + Math.round((__ittc / (1 + __itx)) * __itx)
          });
        
        }

      });


      // s'il y a un modificateur au niveau de l'item, on l'applique à la ventilation
      const moditem = _getModificateurForItem(__cmd.modificateurs, itm.itemid);
      if (moditem) {
        console.log('modificateur item '+itm.itemid);
        const __itm_modif = _applyModificateur(moditem, __itmventil, __baseprix, !__cmd.centimes);
        __itmventil = __itm_modif.ventilation;
        __cmd.items[i].discount = __itm_modif.discount;
      }


      __cmd.items[i].ventilation = __itmventil;

      Object.entries(__itmventil).forEach(([k,v]) => {
        if (!__ventilation.hasOwnProperty(k)) {
          __ventilation[k] = {
            taux: v.taux,
            code: v.code,
            ttc: 0,
            ht: 0,
            tva: 0
          };
        }
        Object.assign(__ventilation[k], {
          ttc: __ventilation[k].ttc + v.ttc,
          ht: __ventilation[k].ht +v.ht,
          tva: __ventilation[k].tva +v.tva
        });
      }); 

    });  

    // s'il y a un modificateur au niveau de la commande, on l'applique à la ventilation
    const modcmd = _getModificateurForCmd(__cmd.modificateurs);
    if (modcmd) {
      console.log('modificateur commande');
      const __cmd_modif = _applyModificateur(modcmd, __ventilation, __basecmd, !__cmd.centimes);   
      __ventilation = __cmd_modif.ventilation;
      __cmd.discount = __cmd_modif.discount;
    }
    __cmd.ventilation = __ventilation;

  }

  return __cmd;


}


function _getModificateurForItem(modificateurs, itemid) {
  return modificateurs.find(mod => mod.item===itemid);
}

function _getModificateurForCmd(modificateurs) {
  return modificateurs.find(mod => mod.item===null);
}


/**
 * 
 * @param {*} modificateur 
 * @param {*} ventilation 
 * @param {*} ttc       montant total de la commande en centimes
 * @param {*} useeuros  si les montants sont enregistrés en euros, il faut convertir le montant du modificateur
 * @returns 
 */
function _applyModificateur(modificateur, ventilation, ttc, useeuros) {
  // is percentage?
  const ispc = String(modificateur.valeur).substr(-1,1)==='%';
  // recup valeur numérique
  let val = Math.abs(Number(String(modificateur.valeur).slice(0,-1)));

  let taux = 1;

  // si le modificateur est en pourcentage, on traduit le taux en facteur
  if (ispc) {
    taux = modificateur.operation>0 ? (100 + val) / 100 : (100 - val) / 100;
  } 
  // si le modificateur est en numéraire, on calcule le facteur en comparant le total TTC avec la valeur du modificateur
  else {
    if (useeuros) {
      val *= 100;
    }
    taux = modificateur.operation<0 ? (ttc - val) / ttc : (ttc + val) / ttc;
  }

  let __modventil = {};
  Object.entries(ventilation).forEach(([k,v]) => {
    __modventil[k] = {
      taux: v.taux,
      code: v.code,
      ttc: Math.round(v.ttc * taux),
      ht: Math.round(v.ht * taux),
      tva: Math.round(v.tva * taux)
    };
  });

  return {
    ventilation: __modventil, 
    discount: {
      base: ttc, 
      montant: ttc - Math.round(ttc * taux), 
      taux: (modificateur.operation>0?'+':'-') + (100 - (taux * 100)).toFixed(1) + '%'
    }
  };
}






function persistCommande(commande) {
  return emit("dbCommandePersist", { commande: commande });
}

function archiveCommands(commandesid, clotureId) {
  return emit("dbCommandeArchive", { ids: commandesid, clotureId: clotureId });
}
function setSyncedCommands(commandesid, datetime) {
  return emit("dbCommandeSetSynced", { ids: commandesid, datetime: datetime });
}

function setCommandeFromOrder(data, catalogueReducer, parametres, numero) {
  const commande = getNewCommande(data);
  commande.centre_revenu = "uber";
  commande.status = "confirmed"; // "standby" ou "confirmed"
  commande.mode = "livraison"; // "emporter", "surplace" ou "livraison"
  commande.numero = numero; //getNewNumero(parametres, numero);

  // on met tous les produits dans le même array
  let produits = [];
  // for (let [key, value] of Object.entries(catalogueReducer.catalogue)) {
  Object.values(catalogueReducer.catalogue).forEach((value) => {
    produits = [...produits, ...value.produits];
  });

  data.cart.items.forEach((itm) => {
    // infos du produit issues du catalogue
    const prd = produits.find((p) => p.id === itm.id);

    if (prd) {
      // steps de personnalisation du produit issus du catalogue
      let steps = catalogueReducer.steps[itm.id];
      let steps_list = [];
      if (steps) {
        steps.forEach((step) => {
          steps_list.push({
            id: step.step_id,
            completed: true,
            validated: true,
          }); // <-- "completed=true" parce que commande terminée
        });
      } else {
        steps = [];
      }

      // récupérations des ingrédients de la composition à partir de la valeur de la propriété 'composition'
      let complist = [];
      if (prd.composition && !Array.isArray(prd.composition)) {
        complist = Object.entries(prd.composition).map(([ingid, qte]) => {
          const c_ing = catalogueReducer.ingredients[ingid];
          return {
            ingredient: ingid,
            type: c_ing.type,
            qte: qte,
            prix: Number(c_ing.supplement),
            nom: c_ing.nom,
            fromStep: null,
          };
        });
      }

      // création de l'item (produit dans la commande)
      const item = {
        produitid: itm.id,
        nom: prd.nom,
        //        prix: itm.quantity*Number(prd.prix),
        prix: Number(itm.price.unit_price.amount / 100),
        pu: Number(itm.price.unit_price.amount / 100),
        tva: { ...catalogueReducer.tva[prd.tva_id] },
        composition: complist,
        ingredients: [],
        steps: steps_list,
        stepslength: steps.length,
        quantite: itm.quantity,
        itemid: _newCommandeItemId(),
        status: "completed",
      };

      // ajout commentaire sur item
      if (itm.special_instructions && itm.special_instructions !== "") {
        commande.comments.push(
          addComment(
            {
              item: item.itemid,
              ingredient: null,
              texte: itm.special_instructions,
            },
            null
          )
        );
      }

      // ajout des ingrédients (personnalisation)
      if (itm.selected_modifier_groups) {
        itm.selected_modifier_groups.forEach((mod) => {
          mod.selected_items.forEach((ing) => {
            // infos de l'ingrédient issues du catalogue
            const ingredient = catalogueReducer.ingredients[ing.id];

            logger.info(ing.id, ingredient);

            if (ingredient) {
              logger.info("steps", steps);

              const ingredient_step = steps.find((st) => {
                let __istype = false;
                st.regles.forEach((str) => {
                  logger.info(str.type, ingredient.type);
                  if (str.type === ingredient.type) __istype = true;
                });
                return __istype;
              });

              item.ingredients.push({
                ingredient: ing.id,
                type: ingredient.type,
                qte: ing.quantity,
                prix: Number(ing.price.unit_price.amount / 100),
                nom: ingredient.nom,
                fromStep: ingredient_step.step_id,
              });
              // item.ingredients.push({ingredient: ing.id, type: ingredient.type, qte: ing.quantity, prix: Number(ing.price.unit_price.amount/100), nom: ingredient.nom });
            }
          });
        });
      }

      if (catalogueReducer.steps[item.produitid]) {
        item.ingredients = _ventilationIngredientsSteps(
          item,
          catalogueReducer.steps[item.produitid]
        );
      }
      item.prix = Number((itm.price.total_price.amount / itm.quantity ) / 100);
      commande.items.push(item);
    }
  });

  // couverts demandés ?
  if (
    data.packaging &&
    data.packaging.disposable_items &&
    data.packaging.disposable_items.should_include
  ) {
    commande.comments.push(
      addComment(
        {
          item: null,
          ingredient: null,
          texte: strings.tickets.uber.couverts,
        },
        null
      )
    );
  }

  // ajout des promotions
  if (data.payment.hasOwnProperty('promotions') && data.payment.promotions.promotions) {

    data.payment.promotions.promotions.forEach(promo => {

      commande.modificateurs.push(
        addModificateur({
          item: null,
          ingredient: null,
          valeur: `${(- Number(promo.promo_discount_value / 100))}€`
        })
      );

    });

  }

  // // ajout des charges :
  // commande.modificateurs.push(
  //   addModificateur({
  //     item: null,
  //     ingredient: null,
  //     valeur: Number(data.payment.charges.total_fee.amount)/100
  //   },null)
  // );

  commande.total = Number(data.payment.charges.sub_total.amount / 100);
  if (data.payment.hasOwnProperty('promotions')) {
    commande.total = Number(data.payment.charges.sub_total_promo_applied.amount / 100);
  }
  return commande;
}

function setCommandeFromSync(commande) {
  return emit("dbCommandePersist", { commande: commande });
}

function setCommandeFromAPI(data, catalogueReducer, parametres, numero) {
  logger.info("setCommandeFromAPI -- Commande data");
  logger.info(JSON.stringify(data));
  const commande = getNewCommande(data);
  commande.status = data.status; // "standby" ou "confirmed"
  commande.mode = data.mode; // "emporter", "surplace" ou "livraison"
  commande.numero = numero; // || getNewNumero(parametres, numero);

  // on met tous les produits dans le même array
  let produits = [];
  // for (let [key, value] of Object.entries(catalogueReducer.catalogue)) {
  Object.values(catalogueReducer.catalogue).forEach((value) => {
    produits = [...produits, ...value.produits];
  });

  commande.comments = [];
  if (data.hasOwnProperty('comments')) commande.comments = data.comments;

  data.items.forEach((itm) => {
    // infos du produit issues du catalogue
    const prd = produits.find((p) => p.id === itm.produitid);

    if (prd) {
      // steps de personnalisation du produit issus du catalogue
      let steps = catalogueReducer.steps[itm.produitid];
      let steps_list = [];
      if (steps) {
        steps.forEach((step) => {
          steps_list.push({
            id: step.step_id,
            completed: true,
            validated: true,
          }); // <-- "completed=true" parce que commande terminée
        });
      } else {
        steps = [];
      }

      // récupérations des ingrédients de la composition à partir de la valeur de la propriété 'composition'
      let complist = [];
      if (prd.composition && !Array.isArray(prd.composition)) {
        complist = Object.entries(prd.composition).map(([ingid, qte]) => {
          const c_ing = catalogueReducer.ingredients[ingid];
          return {
            ingredient: ingid,
            type: c_ing.type,
            qte: qte,
            prix: Number(c_ing.supplement),
            nom: c_ing.nom,
            fromStep: null,
            tva: catalogueReducer.tva[c_ing.tva_id]
          };
        });
      }

      // si le produit est customizable et qu'il est en plusieurs exemplaires,
      // on duplique l'opération de création d'item

      let __nombredefois = 1, 
          i=0, 
          __itmqte = itm.quantite
      ;
      if (steps.length>0 && itm.quantite>1) {
        __nombredefois = itm.quantite;
        __itmqte = 1;
      }

      for (i;i<__nombredefois;i++) {

        // création de l'item (produit dans la commande)
        const item = {
          produitid: itm.produitid,
          nom: prd.nom,
          prix: __itmqte * Number(prd.prix),
          pu: Number(prd.prix),
          tva: { ...catalogueReducer.tva[prd.tva_id] },
          composition: complist,
          ingredients: [],
          steps: steps_list,
          stepslength: steps.length,
          quantite: __itmqte,
          itemid: data.provider!=="clickandcollect" ? _newCommandeItemId() : (itm.itemid ? itm.itemid : _newCommandeItemId()),
          status: "completed",
        };

        // Ajout commentaires item
        if (itm.comments && itm.comments.length) {
          const commentText = itm.comments.join(", ");

          commande.comments.push({
            comment_id: _newCommentId(),
            ingredient: null,
            item: item.itemid,
            texte: commentText,
          });
        }

        // ajout des ingrédients (personnalisation)
        itm.ingredients.forEach((ing) => {
          // infos de l'ingrédient issues du catalogue
          const ingredient = catalogueReducer.ingredients[ing.ingredient];
          if (ingredient) {
            const ingredient_step = steps.find((st) => {
              let __istype = false;
              st.regles.forEach((str) => {
                if (str.type === ingredient.type) __istype = true;
              });
              return __istype;
            });

            item.ingredients.push({
              ingredient: ing.ingredient,
              type: ingredient.type,
              qte: ing.qte,
              prix: Number(ingredient.supplement),
              supplement: Number(ingredient.supplement),
              nom: ingredient.nom,
              fromStep: ingredient_step ? ingredient_step.step_id : null,
              tva: catalogueReducer.tva[ingredient.tva_id],
            });

            // Ajout commentaires ingredients
            if (ing.comments && ing.comments.length) {
              ing.comments.forEach((comment) => {
                const commentText = ing.comments.join(", ");

                commande.comments.push({
                  comment_id: _newCommentId(),
                  ingredient: ing.ingredient,
                  item: item.itemid,
                  texte: commentText,
                });
              });
            }
          }
        });

        if (catalogueReducer.steps[itm.produitid]) {
          item.ingredients = _ventilationIngredientsSteps(
            item,
            catalogueReducer.steps[itm.produitid]
          );
        }

        item.prix = _getPrix(item, steps);
        commande.items.push(item);
      }
    }
  });

  commande.total = _getCommandeTotal(commande.items, []);
  return commande;
}

function checkMarketing(commande, reglescatalogue) {

  // liste des règles actives
  const regles_actives = reglescatalogue.filter(r => {
    let active = true;
    const now = new Date().getTime();
    // si le mode de commande ne correspond pas à la promo...
    if (r.mode!=='all' && commande.mode!==r.mode) active = false;
    // si la promo n'est pas commencée...
    if (r.start>now) active = false;
    // s'il y a une date de fin et qu'elle est passée...
    if (r.end>r.start && r.end<now) active = false;
    return active;
  });

  logger.info('checkMarketing', "regles actives : ",regles_actives.length);
  logger.info('checkMarketing', "items : ",commande.items.length);

  // let produits_concernes = [];
  // regles_actives.forEach(r => {
  //   produits_concernes = [...produits_concernes, ...r.produits];
  // });
  // // liste dédoublonnée
  // const liste_produits = Array.from(new Set(produits_concernes));

  let modifiers = [];

  // POUR CHAQUE PROMO :
  regles_actives.forEach(promo => {

    let produits = {};
    // 1. COMPTE DES PRODUITS CONCERNÉS PAR LA PROMO

    logger.info('checkMarketing', 'promo :', JSON.stringify(promo));


    // si la promo concerne des produits
    if (promo.produits.length>0) {

      // pour chaque produit de la commande...
      commande.items.forEach((itm) => {

        // si le produit est concerné par la promo
        if (promo.produits.includes(itm.produitid)) {

          // si la règle est sur plusieurs exemplaires d'un même produit
          if (promo.selection==="one") {
            if (!Object.keys(produits).includes(itm.produitid)) produits[itm.produitid] = {qte: 0, itemid: itm.itemid};
            produits[itm.produitid].qte += itm.quantite;
          }
          // on si la règle est sur plusieurs exemplaires de tous les prd de la liste
          else {
            if (!Object.keys(produits).includes('qte')) produits = {qte: 0, items:[]};
            // on précise la quantité d'items (pour gagner du temps)
            produits.qte += itm.quantite;
            // et on mets tous les produits dans un tableau (une ligne par item unique)
            for(let i=0; i<itm.quantite; i++) {
              produits.items.push({itemid: itm.itemid, pu: itm.pu});
            }
          }
        }
      });

      // 2. COMPARAISON AVEC LES QUANTITÉS DE LA PROMO
      // si la règle est sur plusieurs exemplaires d'un même produit
      if (promo.selection==="one") {


        // Récup. de la quantité des produits concernés par la promo
        Object.entries(produits).forEach(([produitid, prd]) => {

          let qte_promo = 0;

          // combien de produits en promo par tranche de produits :
          const appl = promo.max - (promo.min - 1);
          // quantité de produits concernés par la promo (par tranche complète)
          qte_promo = Math.floor(prd.qte/promo.max) * appl;
          // reste de produits qui ne complètent pas de tranche
          let reste = prd.qte % promo.max;

          // s'il reste des produits qui ne complètent pas de tranche 
          // mais qui sont concernés par la promo
          if (reste && (reste - (promo.min - 1) > 0)) {
            // on ajoute ces produits à la quantité de produits concernés
            qte_promo += reste - (promo.min - 1);
          }


          // si la promo limite le nombre de produits concernés :
          if (promo.quantite>0) {
            qte_promo = Math.min(promo.quantite, qte_promo);
          }

          logger.info('checkMarketing','qte_promo', qte_promo);


          // Récup. de l'id de l'item sur lequel appliquer la promo
          if (qte_promo>0) {

            const item = commande.items.find(i=>i.itemid===prd.itemid)
            let item_prix = item.pu * qte_promo;

            // calcul de la valeur :
            const ispc = String(promo.valeur).substr(-1, 1) === "%";
            const val = Math.abs(
              Number(String(promo.valeur).slice(0, -1))
            );
      
            const promoval = ispc
              ? Number(Math.round((item_prix * (val / 100))+'e2')+'e-2')
              : val;


            modifiers.push({
              type: "catalogue",
              item: prd.itemid,
              ingredient: null,
              nom: promo.nom+" "+promo.valeur,
              operation: promo.operation,
              valeur: promoval+'€'
            });
          }

        });




      }
      // on si la règle est sur plusieurs exemplaires de tous les prd de la liste
      else {

        // on classe la liste des produits par prix (croissant)
        if (produits.hasOwnProperty('items') && produits.items.length>0) produits.items.sort((a,b)=>a.pu-b.pu);


        // combien de produits en promo par tranche de produits :
        const appl = promo.max - (promo.min - 1);
        // quantité de produits concernés par la promo (par tranche complète)
        let qte_promo = Math.floor(produits.qte/promo.max) * appl;
        // reste de produits qui ne complètent pas de tranche
        let reste = produits.qte % promo.max;

        // s'il reste des produits qui ne complètent pas de tranche 
        // mais qui sont concernés par la promo
        if (reste && (reste - (promo.min - 1) > 0)) {
          // on ajoute ces produits à la quantité de produits concernés
          qte_promo += reste - (promo.min - 1);
        }


        // si la promo limite le nombre de produits concernés :
        if (promo.quantite>0) {
          qte_promo = Math.min(promo.quantite, qte_promo);
        }

        if (qte_promo>0) {

          // on dépile la liste des produits pour créer les modifiers
          for (let i=0;i<qte_promo;i++) {
            let item = produits.items.shift();
            let item_prix = item.pu;

            // calcul de la valeur :
            const ispc = String(promo.valeur).substr(-1, 1) === "%";
            const val = Math.abs(
              Number(String(promo.valeur).slice(0, -1))
            );
      
            const promoval = ispc
              ? Number(Math.round((item_prix * (val / 100))+'e2')+'e-2')
              : val;


            

            modifiers.push({
              type: "catalogue",
              item: item.itemid,
              ingredient: null,
              nom: promo.nom+" "+promo.valeur,
              operation: promo.operation,
              valeur: promoval+'€'
            });
          }

        }

      }
    }
    // si la promo concerne la commande entière
    else {
  
      modifiers.push({
        type: "catalogue",
        item: null,
        ingredient: null,
        nom: promo.nom,
        operation: promo.operation,
        valeur: promo.valeur
      });
    }

  });
  
 

  logger.info('checkMarketing', modifiers);

  return modifiers;
}

function sendTicketId(ticketId, numero, response) {
  logger.info(`commandeServices.sendTicketId(${ticketId}, ${numero})`);
  return emit("sendTicketId", { ticketId, numero, response });
}

function getCommandesToSync(limit = null) {
  return emit("dbCommandeGetToSync", { limit: limit });
}


function createLot(secteur, expiration) {
  const __now = new Date(); 
  return {
    lot_id: _newLotId(),
    secteur: secteur,
    commandes: [],
    createdAt: __now,
    expiredAt: add(__now, {minutes: expiration})
  };
}

function getLot(lot_id) {
  return emit('dbSecteursGetLot', {lot_id: lot_id});
}

function getAllLots() {
  return emit('dbSecteursGetLot', {});
}

function saveLot(lot) {
  return emit('dbSecteursPersistLot', {lot:lot});
}

function deleteLot(lot_id) {
  return emit('dbSecteursDeleteLot', {lot_id: lot_id});
}



const _newCommandeId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};
const _newReglementId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};
const _newRenduId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};
const _newCommandeItemId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};
const _newCommentId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};
const _newModificateurId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};
const _newLotId = () => {
  // let __d = new Date();
  // return __d.getTime().toString();
  return LodashId.createId();
};

const _getCommandeTotal = (items, modificateurs) => {
  // montant à payer (somme des items)
  let __total = 0;
  let articletotal = 0;
  let __modificateur = null;

  if (undefined !== items) {
    items.forEach((itm) => {
      articletotal = itm.quantite * itm.prix;

      // modificateurs pour l'article
      __modificateur = modificateurs.find(
        (m) => m.item === itm.itemid && m.ingredient === null
      );
      //  let amodtx = 1;
      //  let __montant = 0;
      if (__modificateur) {
        // total += Number(__modificateur.valeur);

        const ispc = String(__modificateur.valeur).substr(-1, 1) === "%";
        const val = Math.abs(
          Number(String(__modificateur.valeur).slice(0, -1))
        );
        //  let __montant = ispc ? articletotal*(val/100) : val;

        // conversion du modificateur en coefficient
        // let amodtx = (ispc) ? (100 - val) / 100 : 1 - (val/articletotal);

        if (ispc) {
          // articletotal *= (100 - val) / 100;
          articletotal *= __modificateur.operation>0 ? (100 + val) / 100 : (100 - val) / 100;
        } else {
          // articletotal -= val;
          articletotal = __modificateur.operation>0 ? articletotal + val : articletotal - val;
        }
      }

      __total += articletotal;
    });
  }

  // modificateurs pour la commande
  __modificateur = modificateurs.find(
    (c) => c.item === null && c.ingredient === null
  );
  if (__modificateur) {
    const ispc = String(modificateurs[0].valeur).substr(-1, 1) === "%";
    const val = Math.abs(Number(String(modificateurs[0].valeur).slice(0, -1)));
    if (ispc) {
      // __total *= (100 - val) / 100;
      __total *= __modificateur.operation>0 ? (100 + val) / 100 : (100 - val) / 100;
    } else {
      // __total -= val;
      __total = __modificateur.operation>0 ? articletotal + val : articletotal - val;
    }
  }

  return __total;
};
