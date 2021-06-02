import {emit} from 'eiphop';

export const catalogueServices = {
  getAllActive,
  getAll,
  updateProduit,
  updateIngredient,
  updateMultipleProduits,
  updateMultipleIngredients,
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
function updateMultipleProduits(produits) {
  return emit('dbCatalogueUpdateMultipleProduits', {produits:produits});
}
function updateMultipleIngredients(ingredients) {
  return emit('dbCatalogueUpdateMultipleIngredients', {ingredients:ingredients});
}
function updateGroupe(groupe) {
  return emit('dbCatalogueUpdateGroupe', {groupe:groupe});
}
function updateIngredientType(type) {
  return emit('dbCatalogueUpdateIngredientType', {type:type});
}
function replaceDatabase(database) {
  return emit('dbCatalogueReplaceDatabase', {data:database});
}