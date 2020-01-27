const log = require('electron-log');
const escpos = require('escpos');
const path = require('path');



const actions = {


  printTicket: (req, res) => {

    const { imprimante, template, contenu } = req.payload;

    // déclaration de l'imprimante
    let device;
    if (imprimante.connexion=='usb') {
      device = new escpos.USB();
    } else if (imprimante.connexion=='network') {
      device = new escpos.Network(imprimante.param); 
    }
    const options = {encoding: imprimante.encoding};
    const printer = new escpos.Printer(device, options);


    // composition du ticket en fonction du template :
    
    // const company = [
    //   {style:'B', string: 'LE RESTAURANT'},
    //   {style:'NORMAL', string: '5 place de la ville'},
    //   {style:'NORMAL', string: '75011 PARIS'},
    //   {style:'NORMAL', string: 'Tél. 01 02 03 04 05'},
    //   {style:'NORMAL', string: 'E-mail : paris@le-restaurant.fr'},
    //   {style:'NORMAL', string: 'www.le-restaurant.fr'},
    //   {style:'NORMAL', string: 'SIRET 123 456 789 00012'},
    //   {style:'NORMAL', string: 'CODE NAF 5610C'},
    //   {style:'NORMAL', string: 'TVA FR12 123 456 789'}
    // ];
    // const commande = {
    //   id: 'COMMANDE N° 12312',
    //   date: 'du 21 janv. 2020 à 12h43',
    //   header: {qte: 'QTE', designation: 'ARTICLE', pu: 'P.U.', montant: 'TOTAL', codetva: 'T'},
    //   articles: [
    //     {qte: '1', nom: 'POKÉ COMPOSÉ', pu:'12,95',  prix: '12,95', codetva: 'B', detail:[
    //       {qte: '1', nom: 'Riz vinaigré', pu:'',  prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Saumon', pu:'', prix: '', codetva: 'B'},
    //       {qte: '2', nom: 'Avocat', pu: '1.00', prix: '2.OO', codetva: 'B'},
    //       {qte: '1', nom: 'Chou blanc', pu:'', prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Chou rouge', pu:'', prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Parmesan', pu:'', prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Gingembre', pu:'', prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Nachos', pu:'', prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Sce piquante', pu:'', prix: '', codetva: 'B'}
    //     ]},
    //     {qte: '1', nom: 'CRUNCHY TUNA', pu:'12,95', prix: '12,95', codetva: 'B', detail:[
    //       {qte: '1', nom: 'Feuille de soja', pu:'', prix: '', codetva: 'B'},
    //       {qte: '1', nom: 'Coca Cola', pu:'', prix: '1.00', codetva: 'B'},
    //       {qte: '1', nom: 'Fondant chocolat', pu:'', prix: '2.00', codetva: 'B'}
    //     ]},
    //     {qte: '3', nom: 'CRISTALINE FRAISE', pu:'3,00', prix: '3,00', codetva: 'B', detail:[]},
    //     {qte: '1', nom: 'ROSÉ', pu:'9,00', prix: '9,00', codetva: 'C', detail:[]}
    //   ],
    //   reglement: {
    //     soustotal: '42,90 EUR',
    //     reduction: '0,00 EUR'
    //   },
    //   total: {
    //     total: '42,90 EUR',
    //     tva: [
    //       {code: 'A', nom: 'TVA 5,5%', montant: '0,21'},
    //       {code: 'B', nom: 'TVA 10%', montant: '1,56'},
    //       {code: 'C', nom: 'TVA 20%', montant: '0,47'}
    //     ]
    //   },
    //   encaissement: [
    //     {moyen: 'Espèces', montant: '20,00 EUR'},
    //     {moyen: 'Carte', montant: '22,90 EUR'}
    //   ]
    // }; 

    // const message = [
    //   {style:'NORMAL', string: 'Notre restaurant est ouvert'},
    //   {style:'NORMAL', string: 'Du lundi au samedi'},
    //   {style:'NORMAL', string: 'De 11h à 14h et de 18h à 22h30'},
    //   {style:'NORMAL', string: 'Et le dimanche'},
    //   {style:'NORMAL', string: 'de 18h à 22h30'},
    //   {style:'NORMAL', string: 'MERCI ET BON APPÉTIT !'},
    // ]

    log.debug('printTicketCommande start');

    const tux = path.join(__dirname, 'default_logo.png');
    log.debug('img : '+tux);



    log.debug('device opened');

    // s'il y a un logo au début du ticket
    if (template[0]==='logo') {
      log.debug('Image.load -> print');
    
      // on charge le logo
      escpos.Image.load(tux, function(image){

        // on ouvre la connexion à l'imprimante
        device.open(async function() {
          log.debug('print logo');
          // center logo
          printer.align('CT');
          // impression logo
          let printimage = await _printImage(printer, image);

          // une fois le logo chargé on lance l'impression des sections du tickets
          if (printimage) {
           _launchPrint(template, printer, contenu);
          }

        });

      });
  
    } else {

      // on ouvre la connexion à l'imprimante
      // et on lance l'impression des sections du tickets
      device.open(function() {
        _launchPrint(template, printer, contenu);
      });
    }
      

    log.debug('printTicketCommande end');

    res.send({msg: 'ticket printed'});
  },



  /**
   * Ouverture du tiroir 
   * connecté à l'imprimante passée en paramètre
   */
  openDrawer: (req,res) => {

    const { imprimante } = req.payload;

    log.debug('openDrawer');

    // déclaration de l'imprimante
    let device;
    if (imprimante.connexion=='usb') {
      device = new escpos.USB();
    } else if (imprimante.connexion=='network') {
      device = new escpos.Network(imprimante.param); 
    }
    const options = {encoding: imprimante.encoding};
    const printer = new escpos.Printer(device, options);

    device.open(async function() {
        
      printer
        .cashdraw()
        .close();
    });

    res.send({msg: 'drawer open'});

  },

  /**
   * Impression d'un ticket de test passant en revue certaines fonctionnalités de l'imprimante
   */
  printTest: (req,res) => {
    const device = new escpos.USB();
    const options = {};
    const printer = new escpos.Printer(device, options);

    const { payload } = req;
    const msg = payload.msg!=='' ? payload.msg : 'rien';

    log.debug('printTest start');

    const tux = path.join(__dirname, 'default_logo.png');
    log.debug('img : '+tux);
    escpos.Image.load(tux, function(image){
    

      device.open(async function() {
        
        
         printer
          .font('A')
          .align('CT');

        let printimage = await _printImage(printer, image);

        if (printimage) {

          printer
            .feed(1)
            .size(1,1)
            .text('Test impression :')
            .text('-> '+msg+' <-')
            .drawLine()
            .feed(1)
            .text('test QR code (aqua-forte.net)')
            .cashdraw()
            .feed(1)
            .text('EAN13 barcode example')
            .barcode('123456789012', 'EAN13') // code length 12
          //  .barcode('109876543210') // default type 'EAN13'
          //  .barcode('7654321', 'EAN8') // The EAN parity bit is automatically added.
            .feed(2)
            .cut()
            .close();
        }
         
      });
    });

    log.debug('printTest end');

    res.send({msg: 'test printed'});
  }
}




async function _printImage(printer, image) {

  await printer.image(image);
  return true;

}



function _launchPrint(template, printer, contenu) {

  log.debug('_launchPrint()');

  template.forEach((section,i,arr) => {

    log.debug(section);

    if ('entreprise' === section) { 
      _printEntreprise(printer, contenu.entreprise);
    }
    else if ('commande' === section) {
      _printCommande(printer, contenu.commande);
    }
    else if ('message' === section) {
      _printMessage(printer, contenu.message);
    }
    else if ('legal' === section) {
      _printLegal(printer, contenu.legal);
    }
    // fin du ticket
    if (i === arr.length-1) {
      printer.feed(2)
       .cut()
       .close();
    }
  });
}






// informations Company
function _printEntreprise(printer, data) {
    printer
      .font('A')
      .feed(1)
      .align('CT')
    ;
    // nom
    printer.style('B').text(data.nom);
    // coordonnées
    data.coordonnees.forEach((string) => {
      printer.style('NORMAL').text(string);
    });
    // fiscal
    data.fiscal.forEach((string) => {
      printer.style('NORMAL').text(string);
    });
    printer.feed(1);
}

// impression des informations de commande
function _printCommande(printer, data) {

  printer
    .drawLine()
    .font('A')
    .style('NORMAL')
    .text(data.id)
    .text(data.date)
    .drawLine()
    ;

  // articles
  // header
  printer
    .style('B')
    .tableCustom([
      {text:'QTE', cols:3, align:'RIGHT'},
      {text:'', cols:1},
      {text:'ARTICLE', cols:28, align:'LEFT'},
      {text:'', cols:1},
      {text:'P.U.', cols:6, align:'RIGHT'},
      {text:'', cols:1},
      {text:'TOTAL', cols:6, align:'RIGHT'},
      {text:'', cols:1},
      {text:'T', cols:1}
    ])
    .drawLine();

  // articles :
  printer
    .style('NORMAL');

    let _linecount = 0;

      
    data.articles.forEach((article) => {
      printer.style('B').tableCustom([
        {text: article.qte, cols:3, align:'RIGHT'},
        {text:'', cols:1},
        {text: article.nom, cols:28, align:'LEFT'},
        {text:'', cols:1},
        {text: article.pu, cols:6, align:'RIGHT'},
        {text:'', cols:1},
        {text: article.prix, cols:6, align:'RIGHT'},
        {text:'', cols:1},
        {text: article.codetva, cols:1}
      ]);
      _linecount++;

    if (article.ingredients.length>0) {
      article.ingredients.forEach((ingredient) => {
        printer.style('NORMAL').tableCustom([
          {text: ingredient.qte, cols:3, align:'RIGHT'},
          {text:'', cols:1},
          {text: '  '+ingredient.nom, cols:28, align:'LEFT'},
          {text:'', cols:1},
          {text: ingredient.pu, cols:6, align:'RIGHT'},
          {text:'', cols:1},
          {text: ingredient.prix, cols:6, align:'RIGHT'},
          {text:'', cols:1},
          {text: ingredient.codetva, cols:1}
        ]);
        _linecount++;
      });
    }
  });
  
  printer
    .drawLine()
    .align('RT')
    .size(1,2)
    .text('TOTAL TTC   '+data.total.total.replace('.',','))
    .size(1,1)
    .drawLine();

  printer
    .align('LT')
    .font('A')
    .text('Nombre de lignes : '+_linecount);

  // tva
  printer
    .drawLine();

  // header
  printer
    .style('B')
    .tableCustom([
      {text:'CODE', cols:4, align:'LEFT'},
      {text:'', cols:2},
      {text:'TAUX', cols:9, align:'RIGHT'},
      {text:'', cols:2},
      {text:'TVA', cols:9, align:'RIGHT'},
      {text:'', cols:2},
      {text:'H.T.', cols:9, align:'RIGHT'},
      {text:'', cols:2},
      {text:'TTC', cols:9, align:'RIGHT'}
    ])
    .style('NORMAL')

  for (let [key, value] of Object.entries(data.total.tva)) {
    printer.tableCustom([
      {text:key, cols:4, align:'LEFT'},
      {text:'', cols:2},
      {text:value.taux, cols:9, align:'RIGHT'},
      {text:'', cols:2},
      {text:value.montant.toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
      {text:'', cols:2},
      {text:value.ht.toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
      {text:'', cols:2},
      {text:value.ttc.toFixed(2).replace('.',','), cols:9, align:'RIGHT'}
    ]);
  }


  // reglements
  printer
    .drawLine()
    .style('NORMAL').text('REGLEMENT :');

    data.reglements.forEach(reglement => {
      printer.style('NORMAL').tableCustom([
        {text:'', cols:1},
        {text: reglement.moyen, cols:34, align:'LEFT'},
        {text:'', cols:1},
        {text: `${reglement.valeur.toFixed(2).replace('.',',')} EUR`, cols:12, align:'RIGHT'}
      ]);
    });

  // rendu monnaie
  if (data.rendus.length>0) {
    printer
      .drawLine()
      .style('NORMAL').text('RENDU :');

    data.rendus.forEach(rendu => {
      printer.style('NORMAL').tableCustom([
        {text:'', cols:1},
        {text: rendu.moyen, cols:34, align:'LEFT'},
        {text:'', cols:1},
        {text: `${rendu.valeur.toFixed(2).replace('.',',')} EUR`, cols:12, align:'RIGHT'}
      ]);
    });
  }

  



}

// message
function _printMessage(printer, data) {
  
    printer
      .drawLine()
      .feed(1)
      .align('CT')

    data.forEach((string) => {
      printer.style('NORMAL').text(string);
    });

    printer
      .feed(1)
      .drawLine()
      .feed(1)
}

// mentions légales sur le ticket
function _printLegal(printer, data) {
  printer
    .align('LT')
    .text(`Opération : ${data.type}`)
    .text(`Vendeur : ${data.vendeur}`)
    .text(`Caisse : ${data.caisse}`)
    .text(`C.Paiement : ${data.centre}`)
    .text(`Version : ${data.version}`)
    .text(`ticket : ${data.ticketid}`)
    .text(`Nombre d'impressions : ${data.printid}`)
    .align('CT')
    .text(data.date);
}



module.exports = actions;