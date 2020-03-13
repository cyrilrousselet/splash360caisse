// src/db.js
const { app } = require('electron');
const Datastore = require('nedb-promises');

const dbFactory = (fileName) => Datastore.create({
 filename: `${process.env.NODE_ENV === 'dev' ? '.' :  app.getPath('userData')}/data/${fileName}`,
 timestampData: true,
 autoload: true
});

const db = {
 categories: dbFactory('categories.db'),
 groupes: dbFactory('groupes.db'),
 tva: dbFactory('tva.db'),
 ingredienttypes: dbFactory('ingredienttypes.db'),
 ingredients: dbFactory('ingredients.db'),
 produits: dbFactory('produits.db'),
 steps: dbFactory('steps.db'),
 settings: dbFactory('settings.db'),
 commandes: dbFactory('commandes.db'),
 imprimantes: dbFactory('imprimantes.db'),
 tickets: dbFactory('tickets.db'),
 parametres: dbFactory('parametres.db')
};

module.exports = db;

//export default db;