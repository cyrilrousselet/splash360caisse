const db = require('../db.js');
const log = require('electron-log');
const hydration = require('../dev/dbhydration_chickenstreet.js');
const {categories, groupes, tva, types, ingredients, produits, steps} = hydration;


const actions = {
  dbCatalogueGetAll: (req,res) => {
    const {payload} = req;
    res.send({msg: 'pong'});
  },
  dbCatalogueGetAllActive: async (req,res) => {
    const {payload} = req;

    log.info("dbCatalogueGetAllActive() in API");

    const proxies = await _getAllActive();
      
  //  log.info(proxies);
    res.send(proxies);


  }
}

async function _getAllActive() {
  
  let __rawdata;
  let __prdnum = await db.produits.count();
  if (__prdnum==0) {
    log.info('dbCatalogueApi._getAllActive() : init DB');
    __rawdata = await _fillinCatalogue();
  } else {
    __rawdata = await _findCatalogue({active: 1});
  }
  return _parseCatalogue(__rawdata);
}

/** 
 * 
 * @param {object} data from DB 
 */
function _parseCatalogue(_rawdata) {

  const __tva = {};
  _rawdata._tva.forEach(t => {
    __tva[t.tva_id] = {nom: t.nom, code: t.code, valeur: t.valeur};
  })


  const __steps = {};
  _rawdata._stp.forEach(s => {
    if (!__steps.hasOwnProperty(s.produit)) {
      Object.defineProperty(__steps, s.produit, {
        value: [],
        writable: true,
        enumerable: true
      });
    }
    __steps[s.produit].push(s);
  });

  const __ingredients = {};

  _rawdata._ing.forEach(i => {
    __ingredients[i.ingredient_id] = {
      id: i.ingredient_id,
      nom: i.nom,
      tva_id: i.tva,
      supplement: i.supplement,
      type: i.type,
      weight: i.weight,
      color: i.color
    };
  });


  const __ingredientTypes = {};
  _rawdata._igt.forEach(t => {
    __ingredientTypes[t.type_id] = {nom: t.nom, ingredients: [], print: t.print};
  });

  _rawdata._ing.forEach(i => {
    __ingredientTypes[i.type].ingredients.push(i.ingredient_id);
  });


  const __catalogue = {};
  _rawdata._grp.forEach(g => {
    __catalogue[g.groupe_id] = {nom: g.nom, produits: [], print: g.print};
  });
  
  _rawdata._prd.forEach(p => {

    __catalogue[p.groupe].produits.push({
      id: p.produit_id,
      nom: p.nom,
      tva_id: p.tva,
      prix: p.prix,
      composition: p.composition,
      customizable: __steps.hasOwnProperty(p.produit_id),
      weight: p.weight,
      color: p.color
    });
  });



  return {catalogue: __catalogue, tva: __tva, steps: __steps, ingredients: __ingredients, ingredientTypes: __ingredientTypes};
//  return __catalogue;
}

/**
 * !!! DEV !!!
 * Fill in the DB with fake data from static file
 */
async function _fillinCatalogue() {
  const _cat = await db.categories.insert(categories);
  const _grp = await db.groupes.insert(groupes);
  const _tva = await db.tva.insert(tva);
  const _igt = await db.ingredienttypes.insert(types);
  const _ing = await db.ingredients.insert(ingredients);
  const _prd = await db.produits.insert(produits);
  const _stp = await db.steps.insert(steps);
  return { _cat, _grp, _tva, _igt, _ing, _prd, _stp };
}

/**
 * Get all catalogue data from DB
 */
async function _findCatalogue(prd_criteriae={}) {
  const _cat = await db.categories.find({});
  const _grp = await db.groupes.find({}).sort({ weight: 1 });
  const _tva = await db.tva.find({});
  const _igt = await db.ingredienttypes.find({});
  const _ing = await db.ingredients.find({}).sort({ weight: 1 });
  const _prd = await db.produits.find(prd_criteriae);
  const _stp = await db.steps.find({}).sort({ weight: 1 });
  return { _cat, _grp, _tva, _igt, _ing, _prd, _stp };
}

module.exports = actions;