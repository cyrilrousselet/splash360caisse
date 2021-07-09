const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');
// const log = require('../utils/Logger');



const actions = {
  dbCatalogueGetAll: async (req,res) => {
    // const {payload} = req;

    (await db.categories)._.mixin(lodashId);
    (await db.groupes)._.mixin(lodashId);
    (await db.tva)._.mixin(lodashId);
    (await db.ingredienttypes)._.mixin(lodashId);
    (await db.ingredients)._.mixin(lodashId);
    (await db.produits)._.mixin(lodashId);
    (await db.steps)._.mixin(lodashId);

    log.info("dbCatalogueGetAllActive() in API");

    const proxies = await _getAll();
      
  //  log.info(proxies);
    res.send(proxies);

  },

  dbCatalogueReplaceDatabase: async (req,res) => {
    const {data} = req.payload;

    (await db.categories)._.mixin(lodashId);
    (await db.groupes)._.mixin(lodashId);
    (await db.tva)._.mixin(lodashId);
    (await db.ingredienttypes)._.mixin(lodashId);
    (await db.ingredients)._.mixin(lodashId);
    (await db.produits)._.mixin(lodashId);
    (await db.steps)._.mixin(lodashId);

    const confirm = await _replaceAll(data.database);

    res.send(confirm);
  },

  dbCatalogueUpdateProduit: async (req,res) => {
    const {payload} = req;

    (await db.produits)._.mixin(lodashId);
    const prd = await _persistProduit(payload.produit);

    res.send(prd);
  },

  dbCatalogueUpdateIngredient: async (req,res) => {
    const {payload} = req;

    (await db.ingredients)._.mixin(lodashId);
    const ing = await _persistIngredient(payload.ingredient);

    res.send(ing);
  },

  dbCatalogueUpdateMultipleProduits: async (req,res) => {
    const {payload} = req;
    (await db.produits)._.mixin(lodashId);
    (await db.groupes)._.mixin(lodashId);
    const prds = []

    for (const prd of payload.produits) {
      const produit = await _persistProduit(prd);
      prds.push(produit);
    }
    
    res.send(prds);
  },

  dbCatalogueUpdateMultipleIngredients: async (req,res) => {
    const {payload} = req;
    (await db.ingredients)._.mixin(lodashId);
    (await db.ingredienttypes)._.mixin(lodashId);
    const ings = [];

    for (const ing of payload.ingredients) {
      const ingredient = await _persistIngredient(ing);
      ings.push(ingredient);
    }

    res.send(ings);
  },

  dbCatalogueUpdateGroupe: async (req,res) => {
    const {payload} = req;

    (await db.groupes)._.mixin(lodashId);
    const grp = await _persistGroupe(payload.groupe);

    res.send(grp);
  },

  dbCatalogueUpdateIngredientType: async (req,res) => {
    const {payload} = req;

    (await db.ingredienttypes)._.mixin(lodashId);
    const typ = await _persistIngredientType(payload.type);

    res.send(typ);
  },

  dbGetItems: async (itemtype, ids) => {
    let response = [];
    if (itemtype==="categories") {
      (await db.categories)._.mixin(lodashId);
      response = await (await db.categories).get('categories')
                                              .filter( c => ids.includes(c.categorie_id) )
                                              .value();
    }
    else if (itemtype==="groupes") {
      (await db.groupes)._.mixin(lodashId);
      response = await (await db.groupes).get('groupes')
                                         .filter( g => ids.includes(g.groupe_id) )
                                         .value();
    }
    else if (itemtype==="tva") {
      (await db.tva)._.mixin(lodashId);
      response = await (await db.tva).get('tva')
                                     .filter( t => ids.includes(t.tva_id) )
                                     .value();
    }
    else if (itemtype==="types") {
      (await db.types)._.mixin(lodashId);
      response = await (await db.types).get('types')
                                       .filter( t => ids.includes(t.type_id) )
                                       .value();
    }
    else if (itemtype==="ingredients") {
      (await db.ingredients)._.mixin(lodashId);
      response = await (await db.ingredients).get('ingredients')
                                             .filter( i => ids.includes(i.ingredient_id) )
                                             .value();
    }
    else if (itemtype==="produits") {
      (await db.produits)._.mixin(lodashId);
      response = await (await db.produits).get('produits')
                                          .filter( p => ids.includes(p.produit_id) )
                                          .value();
    }
    else if (itemtype==="steps") {
      (await db.steps)._.mixin(lodashId);
      response = await (await db.steps).get('steps')
                                       .filter( s => ids.includes(s.step_id) )
                                       .value();
    }

    return response;
  },

  dbCatalogueSummary: async (stationid) => {

    (await db.categories)._.mixin(lodashId);
    (await db.groupes)._.mixin(lodashId);
    (await db.tva)._.mixin(lodashId);
    (await db.ingredienttypes)._.mixin(lodashId);
    (await db.ingredients)._.mixin(lodashId);
    (await db.produits)._.mixin(lodashId);
    (await db.steps)._.mixin(lodashId);


    const _cat = await (await db.categories).get('categories')
                                            .filter( c => {
                                              return (c.localsync === undefined) || !c.localsync.includes(stationid);
                                            })
                                            .value();

    const _grp = await (await db.groupes).get('groupes')
                                         .filter( g => {
                                           return (g.localsync === undefined) || !g.localsync.includes(stationid);
                                         })
                                         .value();

    const _tva = await (await db.tva).get('tva')
                                     .filter( t => {
                                       return (t.localsync === undefined) || !t.localsync.includes(stationid);
                                     })
                                     .value();

    const _typ = await (await db.ingredienttypes).get('types')
                                                 .filter( t => {
                                                   return (t.localsync === undefined) || !t.localsync.includes(stationid);
                                                 })
                                                 .value();

    const _ing = await (await db.ingredients).get('ingredients')
                                             .filter( i => {
                                               return (i.localsync === undefined) || !i.localsync.includes(stationid);
                                             })
                                             .value();

    const _prd = await (await db.produits).get('produits')
                                          .filter( p => {
                                            return (p.localsync === undefined) || !p.localsync.includes(stationid);
                                          })
                                          .value();

    const _stp = await (await db.steps).get('steps')
                                        .filter( s => {
                                          return (s.localsync === undefined) || !s.localsync.includes(stationid);
                                        })
                                        .value();

    return {
      categorie: _cat,
      groupe: _grp,
      tva: _tva,
      type: _typ,
      ingredient: _ing,
      produit: _prd,
      step: _stp
    };
  },

  syncConfirm: async (db, ids, from) => {
    const _n = await _addLocalSync(db,ids,from);
    return _n;
  },
}


async function _getAll() {
  
  let __rawdata = await _findCatalogue();
  
  return _parseCatalogue(__rawdata);
}

async function _addLocalSync(db, ids, store_id) {

  if (db==='categories') {
    await (await db.categories)
      .get("categories")
      .filter(s => ( ids.includes(s.categorie_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  else if (db==='groupes') {
    await (await db.ingredienttypes)
      .get("ingredienttypes")
      .filter(s => ( ids.includes(s.type_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  else if (db==='types') {
    await (await db.groupes)
      .get("groupes")
      .filter(s => ( ids.includes(s.groupe_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  else if (db==='ingredients') {
    await (await db.ingredients)
      .get("ingredients")
      .filter(s => ( ids.includes(s.ingredient_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  else if (db==='produits') {
    await (await db.produits)
      .get("produits")
      .filter(s => ( ids.includes(s.produit_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  else if (db==='tva') {
    await (await db.tva)
      .get("tva")
      .filter(s => ( ids.includes(s.tva_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  else if (db==='steps') {
    await (await db.steps)
      .get("steps")
      .filter(s => ( ids.includes(s.step_id) && !s.localsync.includes(store_id)) )
      .get('localsync')
      .push(store_id)
      // .assign({localsync: [...localsync, store_id]})
      .write();
  }
  return ids.length;
}



/** 
 * 
 * @param {object} data from DB 
 */
function _parseCatalogue(_rawdata) {

  const __tva = {};
  _rawdata._tva.forEach(t => {
    // __tva[t.tva_id] = {nom: t.nom, code: t.code, valeur: t.valeur};
    __tva[t.tva_id] = t;
  })


  const __steps = {};
  _rawdata._stp.sort((a,b)=>a.weight-b.weight);
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
    // __ingredients[i.ingredient_id] = {
    //   id: i.ingredient_id,
    //   nom: i.nom,
    //   tva_id: i.tva,
    //   supplement: i.supplement,
    //   type: i.type,
    //   weight: i.weight,
    //   color: i.color,
    //   active: i.hasOwnProperty('active') ? i.active : 1
    // };
    __ingredients[i.ingredient_id] = {...i, id: i.ingredient_id, tva_id: i.tva, active:i.hasOwnProperty('active') ? i.active : 1}
  });


  const __ingredientTypes = {};
  // on ajoute la propriété 'ingredients' aux ingredientTypes
  _rawdata._igt.forEach(t => {
    // __ingredientTypes[t.type_id] = {nom: t.nom, ingredients: [], noprint: t.noprint, weight: t.weight};
    __ingredientTypes[t.type_id] = {...t, ingredients: []};
  });

  _rawdata._ing.forEach(i => {
    __ingredientTypes[i.type].ingredients.push(i.ingredient_id);
  });


  // // s'il y a plusieurs catégories, la première est celle par défaut
  // const __grp = _rawdata._cat.length>1 
  //             ? _rawdata._grp.filter(g => g.categorie===_rawdata._cat[0].categorie_id)
  //             : _rawdata._grp
  //             ;


  const __categories = _rawdata._cat;


  const __catalogue = {};
  _rawdata._grp.forEach(g => {
    // __catalogue[g.groupe_id] = {nom: g.nom, categorie: g.categorie, produits: [], noprint: g.noprint, weight: g.weight};
    __catalogue[g.groupe_id] = {...g, produits: []};
  });
  
  _rawdata._prd.forEach(p => {

    // __catalogue[p.groupe].produits.push({
    //   id: p.produit_id,
    //   nom: p.nom,
    //   tva_id: p.tva,
    //   prix: p.prix,
    //   composition: p.composition,
    //   customizable: __steps.hasOwnProperty(p.produit_id),
    //   weight: p.weight,
    //   color: p.color,
    //   active: p.active
    // });
    __catalogue[p.groupe].produits.push({
      ...p, 
      customizable: __steps.hasOwnProperty(p.produit_id), 
      tva_id: p.tva, 
      id: p.produit_id
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

async function _replaceAll(data) {

  await (await db.categories).get('categories').remove().write();
  data.categories.forEach(async (cat) => {
    await (await db.categories).get('categories').insert(cat).write();
  });

  await (await db.groupes).get('groupes').remove().write();
  data.groupes.forEach(async (grp) => {
    await (await db.groupes).get('groupes').insert(grp).write();
  });

  await (await db.tva).get('tva').remove().write();
  data.tva.forEach(async (tva) => {
    await (await db.tva).get('tva').insert(tva).write();
  });

  await (await db.ingredienttypes).get('types').remove().write();
  data.types.forEach(async (igt) => {
    await (await db.ingredienttypes).get('types').insert(igt).write();
  });

  await (await db.ingredients).get('ingredients').remove().write();
  data.ingredients.forEach(async (ing) => {
    await (await db.ingredients).get('ingredients').insert(ing).write();
  });

  await (await db.produits).get('produits').remove().write();
  data.produits.forEach(async (prd) => {
    await (await db.produits).get('produits').insert(prd).write();
  });

  await (await db.steps).get('steps').remove().write();
  data.steps.forEach(async (stp) => {
    await (await db.steps).get('steps').insert(stp).write();
  });

  return true;

}


async function _persistProduit(payload) {

  const __now = new Date().getTime();
  let _prd = await (await db.produits).get('produits')
                                      .find({produit_id: payload.produit_id})
                                      .value();
  log.info(_prd);
  if (_prd) {
    log.info('prd existe, donc on update');
    let __upd = {..._prd, ...payload, updatedAt: __now};
    _prd = await (await db.produits).get('produits')
                                    .find({produit_id: payload.produit_id})
                                    .assign(__upd)
                                    .write();
  }
  else {
    log.info('pas de prd donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _prd = await (await db.produits).get('produits')
                                    .insert(__ins)
                                    .write();
  }

  return _prd;
}


async function _persistIngredient(payload) {

  const __now = new Date().getTime();
  let _ing = await (await db.ingredients).get('ingredients')
                                         .find({ingredient_id: payload.ingredient_id})
                                         .value();
  log.info(_ing);
  if (_ing) {
    log.info('_ing existe, donc on update');
    let __upd = {..._ing, ...payload, updatedAt: __now};
    _ing = await (await db.ingredients).get('ingredients')
                                       .find({ingredient_id: payload.ingredient_id})
                                       .assign(__upd)
                                       .write();
  }
  else {
    log.info('pas de _ing donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _ing = await (await db.ingredients).get('ingredients')
                                       .insert(__ins)
                                       .write();
  }

  return _ing;
}


async function _persistGroupe(payload) {

  const __now = new Date().getTime();
  let _grp = await (await db.groupes).get('groupes')
                                     .find({groupe_id: payload.groupe_id})
                                     .value();
  log.info(_grp);
  if (_grp) {
    log.info('_grp existe, donc on update');
    let __upd = {..._grp, ...payload, updatedAt: __now};
    _grp = await (await db.groupes).get('groupes')
                                   .find({groupe_id: payload.groupe_id})
                                   .assign(__upd)
                                   .write();
  }
  else {
    log.info('pas de _grp donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _grp = await (await db.groupes).get('groupes')
                                   .insert(__ins)
                                   .write();
  }

  return _grp;
}


async function _persistIngredientType(payload) {

  const __now = new Date().getTime();
  let _typ = await (await db.ingredienttypes).get('types')
                                            .find({type_id: payload.type_id})
                                            .value();
  log.info(_typ);
  if (_typ) {
    log.info('_typ existe, donc on update');
    let __upd = {..._typ, ...payload, updatedAt: __now};
    _typ = await (await db.ingredienttypes).get('types')
                                          .find({type_id: payload.type_id})
                                          .assign(__upd)
                                          .write();
  }
  else {
    log.info('pas de _typ donc on insert');
    let __ins = {...payload, createdAt: __now, updatedAt: __now};
    _typ = await (await db.ingredienttypes).get('types')
                                          .insert(__ins)
                                          .write();
  }

  return _typ;
}


module.exports = actions;