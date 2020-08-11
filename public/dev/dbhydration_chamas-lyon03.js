const catalogue = require('./catalogue_chamas.json');

const hydration = {

  ...catalogue,
 
   commandes: [],
   clients: [],
   clotures: [],
   users: [],
   pointages: [],
   shifts: [],
   timeadjusts: [],
 
   imprimantes: [
     { printer_id: 'imp1', nom: 'POS Printer', connexion: 'usb', param: null, encoding: 'Cp850', pardefaut: true },
     { printer_id: 'imp2', nom: 'Network1', connexion: 'usb', param: null, encoding: 'Cp850', pardefaut: false }//,
   ],
 
   tickets: [
     { ticket_id: 'tck1', nom: 'Commande', template: 'commande', imprimantes: ['imp1'], weight: 1 },
     { ticket_id: 'tck2', nom: 'Sac', template: 'principal', imprimantes: ['imp1'], weight: 2 },
     { ticket_id: 'tck3', nom: 'Cuisine', template: 'partiel', imprimantes: ['imp2'], weight: 3 },
     { ticket_id: 'tck4', nom: 'ClotureX', template: 'cloture_x', imprimantes: ['imp1'], weight: 4 },
     { ticket_id: 'tck5', nom: 'ClotureZ', template: 'cloture_z', imprimantes: ['imp1'], weight: 5 },
     { ticket_id: 'tck6', nom: 'Ticket 3', template: 'partiel', imprimantes: [], weight: 6 },
     { ticket_id: 'tck7', nom: 'Ticket 4', template: 'partiel', imprimantes: [], weight: 7 },
     { ticket_id: 'tck8', nom: 'Ticket 5', template: 'partiel', imprimantes: [], weight: 8 },
     { ticket_id: 'tck9', nom: 'Ticket 6', template: 'partiel', imprimantes: [], weight: 9 },
     { ticket_id: 'tck10', nom: 'Ticket 7', template: 'partiel', imprimantes: [], weight: 10 },
     { ticket_id: 'tck11', nom: 'Ticket 8', template: 'partiel', imprimantes: [], weight: 11 },
     { ticket_id: 'tck12', nom: 'Ticket 9', template: 'partiel', imprimantes: [], weight: 12 },
     { ticket_id: 'tck13', nom: 'Ticket 10', template: 'partiel', imprimantes: [], weight: 13 },
     { ticket_id: 'tck14', nom: 'Avoir', template: 'avoir', imprimantes: ['imp1'], weight: 14 }
   ],

   avoirs: [],
   reglespanier: [],
   reglescatalogue: [],
 
   parametres: [
    { domaine: 'options', cle: 'first_start', valeur: false },
    { domaine: 'entreprise', cle: 'restaurant_id', valeur: '5_4l2xryhllxyc08g8ssos88go4cco0gsk004cskw4cggo8oo00k' },
    { domaine: 'entreprise', cle: 'restaurant_secret', valeur: '37gf8ehyswmc0okk4o0swgss08ggs8cs4wwsccksk80goggc48' },
    { domaine: 'options', cle: 'role', valeur: null},
    { domaine: 'options', cle: 'primary', valeur: null},
    { domaine: 'entreprise', cle: 'denomination', valeur: 'MW FOOD'},
    { domaine: 'entreprise', cle: 'enseigne', valeur: ''},
    { domaine: 'entreprise', cle: 'adresse', valeur: '63 rue Dauphine'},
    { domaine: 'entreprise', cle: 'code_postal', valeur: '69003'},
    { domaine: 'entreprise', cle: 'ville', valeur: 'LYON'},
    { domaine: 'entreprise', cle: 'telephone', valeur: ''},
    { domaine: 'entreprise', cle: 'siret', valeur: '840593357'},
    { domaine: 'entreprise', cle: 'rcs', valeur: 'LYON'},
    { domaine: 'entreprise', cle: 'ape', valeur: '5610C'},
     { domaine: 'entreprise', cle: 'tva', valeur: ''},
     { domaine: 'entreprise', cle: 'site_web', valeur: 'www.chamas-tacos.com'},
     { domaine: 'entreprise', cle: 'heure_fin', valeur: '00:00' },
     { domaine: 'entreprise', cle: 'avoirs', valeur: true },
     { domaine: 'financier', cle: 'fidelite_activation', valeur: false},
     { domaine: 'peripheriques', cle: 'impression', valeur: [{ticket:'tck1',groupes:['cat15','cat16','cat17','cat18','cat19','cat20','cat21','cat22','cat23','cat24','cat25','cat26','cat27','cat28','cat29','cat30'], types:['icat29','icat31','icat32','icat33','icat34','icat35','icat36','icat37']},{ticket:'tck2',groupes:['cat15','cat16','cat17','cat18','cat19','cat20','cat21','cat22','cat23','cat24','cat25','cat26','cat27','cat28','cat29','cat30'], types:['icat29','icat31','icat32','icat33','icat34','icat35','icat36','icat37']},{ticket:'tck3',groupes:['cat15','cat16','cat17','cat18','cat19','cat20','cat21','cat22','cat23','cat24','cat25','cat26','cat27','cat28','cat29','cat30'], types:['icat29','icat31','icat32','icat33','icat34','icat35','icat36','icat37']}]},
     { domaine: 'commandes', cle: 'numerotation_start', valeur: '0'},
     { domaine: 'commandes', cle: 'numerotation_max', valeur: '200'},
     { domaine: 'commandes', cle: 'numerotation_hex', valeur: false},
     { domaine: 'commandes', cle: 'comment_predefini', valeur:[{id:0,message:'SANS FRITE'}, {id:1,message:'SANS SAUCE'}, {id:2,message:'BIEN CUIT'}]},
     { domaine: 'commandes', cle: 'discount_predefini', valeur:[]},
     { domaine: 'commandes', cle: 'auto_accept_order', valeur: false},
     { domaine: 'commandes', cle: 'store_id', valeur: null},
     { domaine: 'commandes', cle: 'pos_integration_enabled', valeur: false},
     { domaine: 'options', cle: 'caisse', valeur: {id: 'cash0', nom: 'Caisse 1'} },
     { domaine: 'options', cle: 'canaux', valeur: [{ids: ['cash0','cash1'], nom: 'caisse'}, {ids: ['borne1'], nom: 'borne'}, {ids: ['wf1'], nom: 'wifi-order'}] },
     { domaine: 'planning', cle: 'shifttypes', valeur: [{id:'st01', nom:'cuisine', couleur: 'bleu', tps: true}, {id:'st02', nom:'caisse', couleur: 'vert', tps: true}, {id:'st03', nom:'salle', couleur: 'jaune', tps: true}, {id:'st04', nom:'livraison', couleur: 'orange', tps: true}, {id:'st05', nom:'fermeture', couleur: 'rose', tps: true}, {id:'st06', nom:'repos heb.', couleur: 'gris', tps: false}] }
   ]
 };
 
 
 module.exports = hydration;