import {emit} from 'eiphop';
import { eachMonthOfInterval } from 'date-fns';

export const catalogueServices = {
  getAllActive,
  getAll,
  updateProduit,
  updateIngredient,
  updateGroupe,
  updateIngredientType
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
function updateGroupe(groupe) {
  return emit('dbCatalogueUpdateGroupe', {groupe:groupe});
}
function updateIngredientType(type) {
  return emit('dbCatalogueUpdateIngredientType', {type:type});
}