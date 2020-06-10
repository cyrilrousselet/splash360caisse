const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');



const actions = {
  dbCatalogueGetAll: (req,res) => {
    const {payload} = req;
    res.send({msg: 'pong'});
  },
  dbCatalogueGetAllActive: async (req,res) => {
    const {payload} = req;

    (await db.categories)._.mixin(lodashId);
    (await db.groupes)._.mixin(lodashId);
    (await db.tva)._.mixin(lodashId);
    (await db.ingredienttypes)._.mixin(lodashId);
    (await db.ingredients)._.mixin(lodashId);
    (await db.produits)._.mixin(lodashId);
    (await db.steps)._.mixin(lodashId);

    log.info("dbCatalogueGetAllActive() in API");

    const proxies = await _getAllActive();
      
  //  log.info(proxies);
    res.send(proxies);


  }
}


async function _getAllActive() {
  
  let __rawdata = await _findCatalogue({active: 1});
  
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
    __ingredientTypes[t.type_id] = {nom: t.nom, ingredients: [], noprint: t.noprint, weight: t.weight};
  });

  _rawdata._ing.forEach(i => {
    __ingredientTypes[i.type].ingredients.push(i.ingredient_id);
  });


  // s'il y a plusieurs catégories, la première est celle par défaut
  const __grp = _rawdata._cat.length>1 
              ? _rawdata._grp.filter(g => g.categorie==_rawdata._cat[0].categorie_id)
              : _rawdata._grp
              ;


  const __categories = _rawdata._cat;


  const __catalogue = {};
  _rawdata._grp.forEach(g => {
    __catalogue[g.groupe_id] = {nom: g.nom, categorie: g.categorie, produits: [], noprint: g.noprint, weight: g.weight};
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



  return {catalogue: __catalogue, tva: __tva, steps: __steps, ingredients: __ingredients, ingredientTypes: __ingredientTypes, categories: __categories};
//  return __catalogue;
}


/**
 * Get all catalogue data from DB
 */
async function _findCatalogue(prd_criteriae={}) {
  const _cat = await (await db.categories).get('categories').value();
  const _grp = await (await db.groupes).get('groupes').sortBy('weight').value();
  const _tva = await (await db.tva).get('tva').value();
  const _igt = await (await db.ingredienttypes).get('types').value();
  const _ing = await (await db.ingredients).get('ingredients').sortBy('weight').value();
  const _prd = await (await db.produits).get('produits').filter(prd_criteriae).value();
  const _stp = await (await db.steps).get('steps').sortBy('weight').value();
  return { _cat, _grp, _tva, _igt, _ing, _prd, _stp };
}

module.exports = actions;