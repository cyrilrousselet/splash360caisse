import {emit} from 'eiphop';

export const catalogueServices = {
  getAllActive,
  getAll,
  updateProduit,
  updateIngredient,
  updateGroupe,
  updateIngredientType,
  replaceDatabase
 };

function getAllActive() {
  return getAll();
}
function getAll() {
  return emit('dbCatalogueGetAll', {from: 'services/catalogueService'});
}
function updateProduit(produit) {
  return emit('dbCatalogueUpdateProduit', {produit:produit});
}
function updateIngredient(ingredient) {
  return emit('dbCatalogueUpdateIngredient', {ingredient:ingredient});
}
function updateGroupe(produits, groupe) {
  return emit('dbCatalogueUpdateGroupe', {produits:produits, groupe:groupe});
}
function updateIngredientType(type) {
  return emit('dbCatalogueUpdateIngredientType', {type:type});
}
function replaceDatabase(database) {
  return emit('dbCatalogueReplaceDatabase', {data:database});
}