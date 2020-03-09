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

    log.debug('printTicket start');

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
      

    log.debug('printTicket end');

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

    device.open(function() {

      log.debug('device open -> cashdraw()');
      printer.cashdraw().cashdraw().close();
      // setTimeout(() => {
      //   printer.close();
      // }, 200);
          
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
      _printEntreprise(printer, contenu.entreprise, contenu.strings);
    }
    else if ('commande' === section) {
      _printCommande(printer, contenu.commande, contenu.strings);
    }
    else if ('message' === section) {
      _printMessage(printer, contenu.message, contenu.strings);
    }
    else if ('legal' === section) {
      _printLegal(printer, contenu.legal, contenu.strings);
    }
    else if ('periode_x' === section) {
      _printPeriodeX(printer, contenu.periode, contenu.strings)
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
function _printEntreprise(printer, data, strings) {
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
function _printCommande(printer, data, strings) {

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


function _printPeriodeX(printer, data, strings) {

  // EN-TÊTE:
    printer
      .drawLine()
      .align('LT')
      .text(strings.periode.titre)
      .text(data.debut+'  ->  '+data.fin)
      .text(strings.editeur+data.editeur.nom+' ('+data.editeur.id+')')
      .feed(1)
      ;
    // vendeur(s) :
    if (data.vendeurs.length>1) {
      printer.text(strings.vendeurs[1]+strings.vendeurs_all);
    } else {
      printer.text(strings.vendeurs[0]+data.vendeurs[0].nom+' ('+data.vendeurs[0].id+')');
    }
    // caisse(s) :
    if (data.caisses.length>1) {
      printer.text(strings.caisses[1]+strings.caisses_all)
             .feed(1);
    } else {
      printer.text(strings.caisses[0]+data.caisses[0].nom+' ('+data.caisses[0].id+')')
             .feed(1);
    }
    // récap montants :
    printer
      .tableCustom([
        {text: strings.depenses, cols:30, align:'LEFT'},
        {text: Number(data.depenses).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.remboursements, cols:30, align:'LEFT'},
        {text: Number(data.remboursements).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.encaissements, cols:30, align:'LEFT'},
        {text: Number(data.ventes).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.mtcaisse, cols:30, align:'LEFT'},
        {text: Number(data.mtcaisse).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
      ])
      .feed(1);

  // CORPS
    // titre0
    printer
      .drawLine()
      .align('CT')
      .style('B')
      .text(strings.titre.x)
      .drawLine();
    
    // recap :
    printer
    .style('NORMAL')
    .tableCustom([
      {text: strings.caption.ventes, cols:25, align:'LEFT'},
      {text: Number(data.ventes).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
      {text: '2#', cols:8, align:'RIGHT'}
    ])
    .tableCustom([
      {text: strings.caption.remboursements, cols:25, align:'LEFT'},
      {text: "-"+Number(data.remboursements).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
      {text: '1#', cols:8, align:'RIGHT'}
    ])
    .drawLine()
    .tableCustom([
      {text: strings.caption.ca, cols:25, align:'LEFT'},
      {text: "-"+Number(data.ca).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
      {text: '3#', cols:8, align:'RIGHT'}
    ])
    .feed(1)
    .tableCustom([
      {text: '', cols:5, align:'LEFT'},
      {text: strings.caption.numtickets, cols:20, align:'LEFT'},
      {text: data.numtickets, cols:15, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .tableCustom([
      {text: '', cols:5, align:'LEFT'},
      {text: strings.caption.ticket_moyen, cols:20, align:'LEFT'},
      {text: Number(data.ticket_moyen).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .drawLine()
    ;

    // ventilation par caissier
    printer
      .align('CT')
      .style('B')
      .text(strings.ventilation.vendeur)
      .drawLine();

    let vndvnt = 0;
    let vndrmb = 0;
    let vndtotal = 0;

    printer
      .tableCustom([
        {text: '', cols:21, align:'LEFT'},
        {text: strings.caption.vente_short, cols:9, align:'RIGHT'},
        {text: strings.caption.remboursements_short, cols:9, align:'RIGHT'},
        {text: strings.caption.ca_short, cols:9, align:'RIGHT'}
      ]);

    data.ventilation.vendeur.forEach(vendeur => {
      
      printer
        .style('NORMAL')
        .tableCustom([
          {text: vendeur.nom+' ('+vendeur.id+')', cols:21, align:'LEFT'},
          {text: Number(vendeur.ventes).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
          {text: '-'+Number(vendeur.remboursements).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
          {text: Number(vendeur.ventes-vendeur.remboursements).toFixed(2).replace('.',','), cols:9, align:'RIGHT'}
        ]);
        vndvnt += vendeur.ventes;
        vndrmb += vendeur.remboursements;
        vndtotal += (vendeur.ventes-vendeur.remboursements);
    });

    printer
      .feed(1)
      .tableCustom([
        {text: strings.caption.total, cols:21, align:'LEFT'},
        {text: Number(vndvnt).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
        {text: '-'+Number(vndrmb).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
        {text: Number(vndtotal).toFixed(2).replace('.',','), cols:9, align:'RIGHT'}
      ]);

    // ventilation par TVA
    printer
      .drawLine()
      .align('CT')
      .style('B')
      .text(strings.ventilation.tva)
      .drawLine();

    let tvaht = 0;
    let tvamnt = 0;
    let tvattc = 0;

    printer
      .tableCustom([
        {text: strings.caption.type, cols:9, align:'LEFT'},
        {text:'', cols:3},
        {text: strings.caption.ht, cols:10, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.caption.tva, cols:10, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.caption.ttc, cols:10, align:'RIGHT'}
      ]);

    data.ventilation.tva.forEach(tva => { 
      printer
        .style('NORMAL')
        .tableCustom([
          {text: Number(tva.taux*100).toFixed(2).replace('.',',')+'%', cols:9, align:'LEFT'},
          {text:'', cols:3},
          {text: Number(tva.ht).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(tva.montant).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(tva.ttc).toFixed(2).replace('.',','), cols:10, align:'RIGHT'}
        ]);
        tvaht += tva.ht;
        tvamnt += tva.montant;
        tvattc += tva.ttc;
    });

    printer
    .feed(1)
    .tableCustom([
      {text: strings.caption.total, cols:9, align:'LEFT'},
      {text:'', cols:3},
      {text: Number(tvaht).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
      {text:'', cols:3},
      {text: Number(tvamnt).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
      {text:'', cols:3},
      {text: Number(tvattc).toFixed(2).replace('.',','), cols:10, align:'RIGHT'}
    ]);


    // ventilation par moyen de paiement
    printer
      .drawLine()
      .align('CT')
      .style('B')
      .text(strings.ventilation.moyen)
      .drawLine();

    let moytotal = 0;

    data.ventilation.moyen.forEach(moyen => { 
      printer
        .style('NORMAL')
        .tableCustom([
          {text: strings.caption.moyens[moyen.moyen], cols:30, align:'LEFT'},
          {text: Number(moyen.valeur).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
        ]);
        moytotal += moyen.valeur;
    });

    printer
    .feed(1)
    .tableCustom([
      {text: strings.caption.total, cols:30, align:'LEFT'},
      {text: Number(moytotal).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
    ]);
        
}

// message
function _printMessage(printer, data, strings) {
  
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
function _printLegal(printer, data, strings) {
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