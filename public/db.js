// src/db.js

const { app } = require('electron');
const fs = require('fs');
const mkdirp = require('mkdirp')

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

// const hydration = require('./dev/dbhydration_chickenstreet.js');
// const hydration = require('./dev/dbhydration_chamas-valence.js');
// const hydration = require('./dev/dbhydration_chamas-lyon03.js');
// const hydration = require('./dev/dbhydration_chamas-lyon07.js');
const hydration = require(`./dev/dbhydration.js`);

const {categories, groupes, tva, types, ingredients, produits, steps} = hydration;
const {clients, ticketsrestau} = hydration;
const {parametres, imprimantes, tickets, secteurs, lots} = hydration;
const {users} = hydration;
const {pointages, shifts, timeadjusts} = hydration;
const {avoirs, reglescatalogue, reglespanier} = hydration;
const {salles, tables} = hydration;


const checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    // fs.mkdirSync(directory);
    mkdirp.sync(directory);
  }
}

const dbFactory = (fileName, defaultValue) => {
  
  checkDirectorySync(`${process.env.NODE_ENV === 'dev' ? '.' :  app.getPath('userData')}/data`);
  
  return low(
    new FileAsync(
      `${process.env.NODE_ENV === 'dev' ? '.' :  app.getPath('userData')}/data/${fileName}`,
      {defaultValue: defaultValue}
    )
  )
};

const db = {
 categories: dbFactory('categories.json', {categories: categories}),
 groupes: dbFactory('groupes.json', {groupes: groupes}),
 tva: dbFactory('tva.json', {tva: tva}),
 ingredienttypes: dbFactory('ingredienttypes.json', {types: types}),
 ingredients: dbFactory('ingredients.json', {ingredients: ingredients}),
 produits: dbFactory('produits.json', {produits: produits}),
 steps: dbFactory('steps.json', {steps: steps}),
 clients: dbFactory('clients.json', {clients: clients}),
 ticketsrestau: dbFactory('ticketsrestau.json', {ticketsrestau: ticketsrestau}),
 imprimantes: dbFactory('imprimantes.json', {imprimantes: imprimantes}),
 tickets: dbFactory('tickets.json', {tickets: tickets}),
 parametres: dbFactory('parametres.json', {parametres: parametres}),
 users: dbFactory('users.json', {users: users}),
 secteurs: dbFactory('secteurs.json', {secteurs: secteurs}),
 lots: dbFactory('lots.json', {lots: lots}),
 pointages: dbFactory('pointages.json', {pointages: pointages}),
 shifts: dbFactory('shifts.json', {shifts: shifts}),
 timeadjusts: dbFactory('timeadjusts.json', {timeadjusts: timeadjusts}),
 avoirs: dbFactory('avoirs.json', {avoirs: avoirs}),
 reglescatalogue: dbFactory('reglescatalogue.json', {reglescatalogue: reglescatalogue}),
 reglespanier: dbFactory('reglespanier.json', {reglespanier: reglespanier}),
 tables: dbFactory('tables.json', {salles: salles, tables: tables}),
 cmdchrono: dbFactory('cmdchrono.json',{cmdchrono:[]}),
};

module.exports = db;

//export default db;