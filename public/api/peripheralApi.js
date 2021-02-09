const log = require('electron-log');
const electron = require('electron');
const { app } = electron;
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');
escpos.SerialPort = require('escpos-serialport');
const statuses = require('escpos/statuses');

const {PrinterStatus,OfflineCauseStatus,ErrorCauseStatus,RollPaperSensorStatus} = statuses;
const _ = require('escpos/commands');
const path = require('path');
const fs = require('fs');

const getPixels = require('get-pixels');

const QRCode = require('qrcode');

let printerOpen = false;
let waitInterval = null;

let printSpool = [];


const actions = {

  quitApp: (req,res) => {
    log.info('QUIT APP');
    app.quit();
  },


  printTicket: (req, res) => {

    const { imprimante, template, contenu } = req.payload;

    log.info('printerOpen',printerOpen, 'actions.printTicket()');

    _spoolManager({
      action: _doPrintTicket,
      imprimante: imprimante,
      template: template,
      contenu: contenu
    });

    // if (printerOpen) {
    //   clearInterval(waitInterval);
    //   waitInterval = setInterval(function() {
    //     log.info('wait for printer close', printerOpen, 'actions.printTicket()');
    //     if (!printerOpen) {
    //       log.info('at last, printer closed', printerOpen, 'actions.printTicket()');
    //       clearInterval(waitInterval);
    //       _doPrintTicket(imprimante, template, contenu);
    //     }
    //   },200);
    // }
    // else {
    //   _doPrintTicket(imprimante, template, contenu);
    // }

   

    res.send({msg: 'ticket printed'});
  },



  /**
   * Ouverture du tiroir 
   * connecté à l'imprimante passée en paramètre
   */
  openDrawer: (req,res) => {

    const { imprimante } = req.payload;

  //  log.debug('openDrawer', imprimante);

    _spoolManager({
      action: _openDrawer,
      imprimante: imprimante,
      template: null,
      contenu: null
    });




    // device.open(function() {

    //   log.debug('device open -> cashdraw()');
    //   printer
    //     .cashdraw()
    //     .cashdraw();

    //     // device.write('\x1b\x70\x00\x19\xfa', data => {
    //     //   log.info("data", data);
    //     // })


    //   // device.on('data', function (data) {
    //   //     // log.debug(data);
    //   //     if (typeof data === "string") {
    //   //       log.debug(' --> ',  data.charCodeAt(0).toString(2).padStart(8, '0'));
    //   //     }
          
    //   // });
  
    //   // log.info('demande de status');
    //   // device.write(_.DLE+_.EOT+String.fromCharCode(1));
    //   // // device.write('\x1d\x72\x02');
    //   // log.info('ouverture');
    //   // device.write('\x1b\x70\x00\x19\xfa');
      
    //   // log.info('demande de status');
    //   // device.write(_.DLE+_.EOT+String.fromCharCode(1));


    //   setTimeout(() => {
    //       printer.close();
    //   }, 1000);

    // / *

    //   if (imprimante.connexion==='usb') {
    //     log.info('send "GS r 2" to printer');

    //     device.write('\x1d\x72\x02', (error,data) => {
    //       log.info('get data',data);
    //     });


    //     device.write('\x1b\x70\x00\x19\xfa', (error,data) => {
    //       log.info("open drawer data", data);
    //     });


    //   } else {
    //     printer.cashdraw();
    //     printer.getStatus(statuses.PrinterStatus.getClassName(), status => {
    //       log.info(status.toJSON());
    //     });
    //   }
    //   printer.close();
    //   // setTimeout(() => {
    //   //   printer.close();
    //   // }, 200);
    // * /  
          
    // });

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


// gestion des jobs envoyés aux imprimantes
function _spoolManager(job=null) {

  
  // on ajoute le job demandé à la liste d'attente
  if (job!==null) printSpool.push(job);


  // si l'imprimante est ouverte...
  if (printerOpen) {

    // si aucune boucle d'attente n'est déclarée...
    if (waitInterval===null) {



      // ...on déclare un nouvel intervalle
      waitInterval = setInterval(function() {
        log.info('wait for printer close', printerOpen, '_spoolManager()', 'printSpool: '+printSpool.length);
        // si l'imprimante est (enfin) fermée
        if (!printerOpen) {
          log.info('at last, printer closed', printerOpen, '_spoolManager()');
          

          // on récupère le premier job de la liste
          const firstJobi = printSpool.shift();
          // et on exécute le job
          if (firstJobi) firstJobi.action(firstJobi.imprimante, firstJobi.template, firstJobi.contenu);

          // si la liste d'attente est vide
          if (printSpool.length===0) {
            // on efface l'intervalle (et on met sa valeur à 'null')
            clearInterval(waitInterval);
            waitInterval = null;
            // et on indique que l'imprimante est fermÃ©e
            printerOpen = false;
          }
        } 
        // si l'imprimante n'est pas fermée (suite à un bug, par ex.)
        else {
          // si la liste d'attente est vide
          if (printSpool.length===0) {
            // on efface l'intervalle (et on met sa valeur à 'null')
            clearInterval(waitInterval);
            waitInterval = null;
            // et on indique que l'imprimante est fermée
            printerOpen = false;
          }
        }
      },200);
    }
  }
  // si l'imprimante est fermée...
  else {
    // si un job est déclaré dans la liste
    if (printSpool.length>0) {
      // on récupère le premier job de la liste
      const firstJobd = printSpool.shift();
      firstJobd.action(firstJobd.imprimante, firstJobd.template, firstJobd.contenu);

      // on relance le manager au cas où un autre job serait en attente dans la liste
      _spoolManager();
    }
  }
}


function _openDrawer(imprimante, template, contenu) {

  // déclaration de l'imprimante
  let device;
  if (imprimante.connexion=='usb') {
    if (imprimante.param && (typeof imprimante.param==="string") ) {
      vp = imprimante.param.split(';');
      vid = parseInt(vp[0], 16);
      pid = parseInt(vp[1], 16);
      device = new escpos.USB(vid,pid);
    } else {
      device = new escpos.USB();
    }

  } else if (imprimante.connexion=='network') {
    device = new escpos.Network(imprimante.param); 
  } else if (imprimante.connexion=='serial') {
    device = new escpos.SerialPort(imprimante.param);
  }
  
  const printer = new escpos.Printer(device);

  device.open(function(error) {
    if (error) {
      log.error(`ERREUR IMPRIMANTE->TIROIR (${imprimante.connexion}: ${imprimante.param}) =>`, e.message);
    } else {
      log.debug('device open -> cashdraw()');
      printerOpen = true;
      printer
        .cashdraw()
        .cashdraw();
        
      setTimeout(() => {
        log.debug('printer.close()', '_openDrawer() 2');
        _closePrinter(printer);
      }, 1000);
    }
  });

}


function _doPrintTicket(imprimante, template, contenu) {

  // déclaration de l'imprimante
  let device;
  const options = {encoding: imprimante.encoding, width:42};
  let printer;
  try {
    

    if (imprimante.connexion=='usb') {
      if (imprimante.param && (typeof imprimante.param==="string") ) {
        vp = imprimante.param.split(';');
          vid = parseInt(vp[0], 16);
          pid = parseInt(vp[1], 16);
          device = new escpos.USB(vid,pid);
        } else {
          device = new escpos.USB();
        }
    } else if (imprimante.connexion=='network') {
      device = new escpos.Network(imprimante.param); 
    } else if (imprimante.connexion=='serial') {
      device = new escpos.SerialPort(imprimante.param);
    }
    
    // const options = {encoding: imprimante.encoding};
    printer = new escpos.Printer(device, options);
    
  } catch(e) {
    log.error(`ERREUR IMPRIMANTE (${imprimante.connexion}: ${imprimante.param})`, e.message);
  }

  log.debug('printTicket start');

  // const tux = path.join(__dirname, 'default_logo.png');
  // log.debug('img : '+tux);

  log.debug('device opened');

  // // s'il y a un logo au début du ticket
  if (template[0]==='logo' && contenu.logo!==null) {
    log.debug('Image.load -> print');

    const imglogo = getLogoImg(contenu.logo);

    // on charge le logo
    escpos.Image.load(imglogo, function(image){

      // on ouvre la connexion à l'imprimante
      if (device) {
        
        device.open(async function(error) {

          if (error) {
            log.error(`ERREUR IMPRIMANTE (${imprimante.connexion}: ${imprimante.param})`, error.message);
          } else {
            
            printerOpen = true;

            log.debug('print logo');
            // center logo
            printer.align('CT');
            // impression logo
            let printimage = await _printImage(printer, image);

            // une fois le logo chargé on lance l'impression des sections du tickets
            if (printimage) {
            _launchPrint(template, printer, contenu);
            }
          }

        });
      } else {
        log.error('impression impossible');
      }

    });

  } else {

    log.info('launchPrint sans logo');

    // on ouvre la connexion à l'imprimante
    // et on lance l'impression des sections du tickets
    if (device) {
      device.open(function(error) {

        if (error) {
          log.error(`ERREUR IMPRIMANTE (${imprimante.connexion}: ${imprimante.param})`, error.message);
        } else {
          printerOpen = true;
          _launchPrint(template, printer, contenu);
        }
      });
    } else {
      log.error('impression impossible');
    }
  }
    

  log.debug('printTicket end');

}


async function _printImage(printer, image) {

  await printer.image(image, 'd24');
  return true;

}

function _closePrinter(printer) {
  printer.close(function() {
    printerOpen = false;
  });
}
function _printErrorHandler(error, methodName, printer) {
  log.error(`ERREUR IMPRESSION ( ${methodName}() )`, error.message);
  _closePrinter(printer);
}

function _closePrinter(printer) {
  printer.close(function() {
    printerOpen = false;
  });
}
function _printErrorHandler(error, methodName, printer) {
  log.error(`ERREUR IMPRESSION ( ${methodName}() )`, error.message);
  _closePrinter(printer);
}

function _launchPrint(template, printer, contenu) {

  log.debug('_launchPrint()');

  if (template.length==0) {
    _closePrinter(printer);
  }

  

  template.forEach(async (section,i,arr) => {

    log.debug(section);

    if ('entreprise' === section) { 
      try {
        _printEntreprise(printer, contenu.entreprise, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printEntreprise', printer);
      }
    }
    else if ('commande' === section) {
      try {
        _printCommande(printer, contenu.commande, contenu.strings.commande);
      } catch(e) {
        _printErrorHandler(e, '_printCommande', printer);
      }
    }
    else if ('message' === section) {
      try {
        _printMessage(printer, contenu.message, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printMessage', printer);
      }
    }
    else if ('legal' === section) {
      try {
        _printLegal(printer, contenu.legal, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printLegal', printer);
      }
    }
    else if ('periode_x' === section) {
      try {
        _printPeriodeX(printer, contenu.periode, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printPeriodeX', printer);
      }
    }
    else if ('periode_z' === section) {
      const __periode = contenu.periode;
   //   try {
        _printPeriodeZ(printer, {...__periode, ecarts:contenu.ecarts, comptage:contenu.comptage, prelevement:contenu.prelevement}, contenu.strings);
   //   } catch(e) {
   //     _printErrorHandler(e, '_printPeriodeZ', printer);
   //   }
    }
    else if ('mouvements' === section) {
      try {
        _printMouvements(printer, contenu.mouvements, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printMouvements', printer);
      }
    }
    else if ('prelevement' === section) {
      try {
        _printPrelevement(printer, contenu.prelevement, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printPrelevement', printer);
      }
    }
    else if ('info' === section) {
      try {
        _printInfo(printer, {info: contenu.info, nomticket: contenu.nomticket, commande:{numero: contenu.detail.numero, id:contenu.detail.id, mode:contenu.detail.mode, status:contenu.detail.status, client:contenu.detail.client, bipper: contenu.detail.bipper}}, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printInfo', printer);
      }
    }
    else if ('detail' ===  section) {
      try {
        _printDetail(printer, contenu.detail, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printDetail', printer);
      }
    }
    else if ('avoir' ===  section) {
      try {
        _printAvoir(printer, contenu.detail, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printAvoir', printer);
      }
    }
    else if ('qrcode' ===  section) {
      try {
        const pqr = await _printQRCode(printer, contenu.code);
      } catch(e) {
        _printErrorHandler(e, '_printQRCode', printer);
      }
    }
    else if ('uber' ===  section) {
      try {
        const pqr = await _printUber(printer, contenu.uber, contenu.strings.uber);
      } catch(e) {
        _printErrorHandler(e, '_printUber', printer);
      }
    } 
    else if ('recap' === section) {
      try {
        _printRecap(printer, contenu.recap, contenu.strings);
      } catch(e) {
        _printErrorHandler(e, '_printRecap', printer);
      }
    } 
    else if ('etiquette' === section) {
      try {
        _printEtiquettes(printer, contenu);
      } catch(e) {
        _printErrorHandler(e, '_printEtiquettes', printer);
      }
    }
    // else if ('logo' === section) {
    //   if (contenu.logo!==null) {
    //     const qim = await _printLogo(printer, contenu.logo);
    //   }
    // }

    // fin du ticket
    if (i === arr.length-1) {
      printer.feed(2)
       .cut();
      
      _closePrinter(printer);
    }
  });
}

function _printEtiquettes(printer, data) {


  log.info('_printEtiquette', data);

  data.articles.forEach(art => {

    const inglist = art.ingredients.map(ing => ing.qte+'x '+ing.nom.toLowerCase());

    printer
    .font('A')
    .align('CT')
    .style('B')
    .size(0,0)
    .tableCustom([
      {text:'#'+data.numero, align:'LEFT', cols:6, style:'B'},
      {text:'', cols:3},
      {text:data.mode, align:'CENTER', cols:10, style:'NORMAL'},
      {text:'', cols:2},
      {text:data.date, align:'RIGHT', cols:21, style:'NORMAL'}
    ])
    .size(1,1)
    .tableCustom([
      {text: art.nom, align:'LEFT', cols:42, style:'B'}
    ])
    .size(0.5,0.5)
    .tableCustom([
      {text: inglist.join(', '), align:'LEFT', cols:42, style:'NORMAL'}
    ])
    .feed(1)
    .cut();


  });

}

// informations commande sur le ticket
function _printInfo(printer, data, strings) {
  printer
    .font('A')
    .align('CT')
    .style('B')
    // .size(1,2)
    .size(0,1)
    .text(data.nomticket)
    // .size(1,1)
    .size(0,0)
    .drawLine()
    .style('B')
    // .size(2,2)
    .size(1,1)
    .text(`#${data.commande.numero}`)
    // .size(1,1);
    .size(0,0);

  if (data.commande.client!==null) {

    printer
      .font('A')
      // .size(1,1)
      .size(0,0)
      .feed(1)
      .style('NORMAL')
      .tableCustom([
        {text: `${strings.client.titre} ${data.commande.client.prenom} ${data.commande.client.nom}`, cols:42, align:'CENTER'}
      ]);
  }


  printer
    .drawLine()
    .style('NORMAL')
    .text(`${strings.numero}${data.commande.id}`)
    .text(`${strings.creation}${data.info.date} à ${data.info.heure}`)
    // .size(2,2)
    .size(1,1)
    .text(`*** ${strings.mode[data.commande.mode]} ***`)
    .size(0,0);

  if (data.commande.bipper) {
    printer
      .size(0,0)
      .drawLine()
      .style('NORMAL')
      .size(1,1)
      .text(`--- ${strings.bipper}${data.commande.bipper} ---`)
      .size(0,0);
  }
  if (data.commande.status==="standby") {
    printer
      .drawLine()
      .style('B')
      .size(1,0)
      .setReverseColors(true)
      .text(_completeRaw(String(strings.status[data.commande.status]).toUpperCase(), "center", {width:1}))
      .size(0,0)
      .setReverseColors(false)
      .style('NORMAL');
  }
  printer
    .size(0,1)
    .drawLine()
    .size(0,0);
}




// détail commande sur le ticket
function _printDetail(printer, data, strings) {
  printer
    .align('CT')
    // .size(1,1)
    .size(0,0)
    .style('B')
    .tableCustom([
      {text:'', cols:3},
      {text: strings.caption.quantite, cols:3},
      {text:'', cols:3},
      {text: strings.caption.articles, cols:30},
      {text:'', cols:3}
    ]);

  printer.drawLine();


  if (data.comment!=='') {
    printer.style('B').tableCustom([
      {text:'', cols:3},
      {text: '* ', cols:2, align:'RIGHT'},
      {text: data.comment, cols:32, align:'LEFT'},
      {text: ' *', cols:2, align:'RIGHT'},
      {text:'', cols:3}
    ]);
    printer.drawLine();
  }


  let numarticles = 0;
  data.articles.forEach((article) => {
    printer.style('B').tableCustom([
      {text:'', cols:3},
      {text: article.qte, cols:3, align:'RIGHT'},
      {text:'', cols:3},
      {text: article.nom, cols:30, align:'LEFT'},
      {text:'', cols:3}
    ]);
    if (article.comment!=='') {
      printer.style('B').tableCustom([
        {text:'', cols:3},
        {text: '* ', cols:2, align:'RIGHT'},
        {text: article.comment, cols:32, align:'LEFT'},
        {text: ' *', cols:2, align:'RIGHT'},
        {text:'', cols:3}
      ]);
    }

    let numingredients = 0;
    if (article.ingredients.length>0) {
      article.ingredients.forEach((ingredient) => {
        printer.style('NORMAL').tableCustom([
          {text:'', cols:3},
          {text: ingredient.qte, cols:3, align:'RIGHT'},
          {text:'', cols:3},
          {text: '  '+ingredient.nom, cols:30, align:'LEFT'},
          {text:'', cols:3}
        ]);
      //  numingredients += ingredient.qte;

        if (ingredient.comment!=='') {
          printer.style('B').tableCustom([
            {text:'', cols:3},
            {text: '* ', cols:2, align:'RIGHT'},
            {text: ingredient.comment, cols:32, align:'LEFT'},
            {text: ' *', cols:2, align:'RIGHT'},
            {text:'', cols:3}
          ]);
        }
      });

      printer.feed(1);

    }
    numarticles += numingredients>0 ? numingredients : article.qte;
  });
  
  printer
    .drawLine()
    .align('CT')
    // .size(1,2)
    .size(0,1)
    .text(`${strings.caption.num_articles}${numarticles}`);

}

// récap des autres tickets
function _printRecap(printer, recap, strings) {

  printer
    // .size(1,1)
    .size(0,0)
    .drawLine()
    ;
  recap.forEach(ticket => {
    printer
      // .size(1,2)
      .size(0,1)
      .text(`- ${ticket.nom} : ${ticket.num} ${strings.caption.articles}`);
  });


}

// informations Company
function _printEntreprise(printer, data, strings) {
    printer
      .font('A')
      // .size(1,1)
      .size(0,0)
      .feed(1)
      .align('CT')
    ;
    // nom
    printer.style('B').text(data.nom);
    // coordonnées
    data.coordonnees.forEach((string) => {
      if (string!==null ) printer.style('NORMAL').text(string);
    });
    // fiscal
    if (data.fiscal.length>0) {
      data.fiscal.forEach((string) => {
        printer.style('NORMAL').text(string);
      });
    }
    printer.feed(1);
}

function _printAvoir(printer, data, strings) {

  printer
    // .size(1,1)
    .size(0,0)
    .drawLine()
    .font('A')
    .align('CT')
    .style('B')
    // .size(1,2)
    .size(0,1)
    .text(strings.nom)
    // .size(1,1)
    .size(0,0)
    .drawLine()
  ;

  printer
    .style('NORMAL')
    // .size(1,2)
    .size(0,1)
    .tableCustom([
      {text: strings.montant, cols:25, align:'LEFT'},
      {text:'', cols:2},
      {text: '  '+data.valeur, cols:15, align:'RIGHT'}
    ])
    // .size(1,1)
    .size(0,0)
    .tableCustom([
      {text: strings.validite, cols:15, align:'LEFT'},
      {text:'', cols:2},
      {text: '  '+data.limite, cols:25, align:'RIGHT'}
    ]);

  if (data.client!==null) {

    printer.style('NORMAL').tableCustom(
      [
        {text: strings.client, cols:15, align:'LEFT'},
        {text:'', cols:2},
        {text: '  '+data.client, cols:25, align:'RIGHT'}
      ]
    );
  }

}



function getPixelsAsync(url) {
    return new Promise(function(resolve, reject) {
       getPixels(url, function(err, pixels) {
            if (err) reject(false)
            else resolve(pixels)
        })
    })
}

async function _printQRCode(printer, code) {

  printer.drawLine();
    
  const qrimg = await QRCode.toDataURL(code, {width:300});
  const pixels = await getPixelsAsync(qrimg);
  const image = new escpos.Image(pixels);
//  log.info(image);
  const printQRimage = await _printImage(printer, image);

  printer
    // .size(1,1)
    .size(0,0)
    .font('A')
    .align('CT')
    .text(code)
  ;
  
}

function getLogoImg(filePath) {

  let buff = fs.readFileSync(filePath);
  return `data:image/png;base64, ${buff.toString('base64')}`;

}

async function _printLogo(printer, imageUrl) {

  const pixels = await getPixelsAsync(getLogoImg(imageUrl));
  const image = new escpos.Image(pixels);
//  log.info(image);
  const printImage = await _printImage(printer, image);

}

// impression des informations de commande
function _printCommande(printer, data, strings) {

  printer
    .align('CT')
    .drawLine()
    .style('B')
    // .size(2,2)
    .size(1,1)
    .text(`#${data.numero}`)
    .font('A')
    // .size(1,1)
    .size(0,0)
    .style('NORMAL')
    .text(data.id)
    .text(data.date)
    ;

  printer
    .align('CT')
    .feed(1)
    .style('B')
    // .size(2,2)
    .size(1,1)
    .text(`*** ${strings.mode[data.mode]} ***`)
    .font('A')
    // .size(1,1)
    .size(0,0)
    .style('NORMAL')
    .drawLine()
    ;


  if (data.bipper) {
    printer
      .size(1,1)
      .text(`--- ${strings.bipper}${data.bipper} ---`)
      .size(0,1)
      .drawLine()
      .size(0,0);
  }


  if (data.comment!=='') {
    printer.style('B').tableCustom([
      {text:'', cols:3},
      {text: '* ', cols:2, align:'RIGHT'},
      {text: data.comment, cols:32, align:'LEFT'},
      {text: ' *', cols:2, align:'RIGHT'},
      {text:'', cols:3}
    ]);
    printer.font('A')
          // .size(1,1)
          .size(0,0)
          .style('NORMAL')
          .drawLine();
  }

  if (data.client!==null) {

    printer.font('A')
          // .size(1,1)
          .size(0,0)
          .style('NORMAL')
          .tableCustom([
            {text: `${strings.client.titre} ${data.client.prenom} ${data.client.nom}`, cols:42, align:'LEFT'}
          ])
          .tableCustom([
            {text: `(${data.client.client_id})`, cols:42, align:'LEFT'}
          ]);
    if (data.client.adresse!=='') printer.tableCustom([{text: data.client.adresse, cols:42, align:'LEFT'}]);
    if (data.client.adresse2!=='') printer.tableCustom([{text: data.client.adresse2, cols:42, align:'LEFT'}]);
    if (data.client.batiment!=='' || data.client.etage!=='') printer.tableCustom([{text: `${((data.client.batiment!=='')?strings.client.batiment+data.client.batiment:'')}${((data.client.batiment!=='' && data.client.etage!=='')?' - ':'')}${((data.client.etage!=='')?strings.client.etage+data.client.etage:'')}`, cols:42, align:'LEFT'}]);
    if (data.client.codepostal!=='' || data.client.ville!=='') printer.tableCustom([{text: `${data.client.codepostal} ${data.client.ville}`, cols:42, align:'LEFT'}]);
    if (data.client.telephone!=='' || data.client.telephone2!=='') printer.tableCustom([{text: `${strings.client.tel} ${data.client.telephone}${((data.client.telephone!=='' && data.client.telephone2!=='')?' - ':'')}${data.client.telephone2}`, cols:42, align:'LEFT'}]);
    if (data.client.commentaire!=='') printer.tableCustom([{text: `${strings.client.commentaire} ${data.client.commentaire}`, cols:42, align:'LEFT'}]);

    printer.drawLine();
  }


  // articles
  // header
  printer
    .style('B')
    .tableCustom([
      {text: strings.detail.quantite, cols:3, align:'RIGHT'},
      {text:'', cols:1},
      {text: strings.detail.articles, cols:22, align:'LEFT'},
      {text:'', cols:1},
      {text: strings.detail.prix_unitaire, cols:6, align:'RIGHT'},
      {text:'', cols:1},
      {text: strings.detail.total, cols:6, align:'RIGHT'},
      {text:'', cols:1},
      {text: strings.detail.code_tva, cols:1}
    ])
    .drawLine();

  // articles :
  printer
    .style('NORMAL');

    let _linecount = 0;

    let _subtotal = 0;

      
    data.articles.forEach((article) => {
      _subtotal += Number(article.prix);
      printer.align('CT').style('B').tableCustom([
        {text: article.qte, cols:3, align:'RIGHT'},
        {text:'', cols:1},
        {text: article.nom, cols:22, align:'LEFT'},
        {text:'', cols:1},
        {text: article.pu, cols:6, align:'RIGHT'},
        {text:'', cols:1},
        {text: (Number(article.qte)*Number(article.pu)).toFixed(2), cols:6, align:'RIGHT'},
        {text:'', cols:1},
        {text: article.codetva, cols:1}
      ]);
      if (article.comment!=='') {
        printer.align('CT').style('B').tableCustom([
          {text:'', cols:3},
          {text: '* ', cols:2, align:'RIGHT'},
          {text: article.comment, cols:32, align:'LEFT'},
          {text: ' *', cols:2, align:'RIGHT'},
          {text:'', cols:3}
        ]);
        _linecount++;
      }
      _linecount++;

    if (article.ingredients.length>0) {
      article.ingredients.forEach((ingredient) => {
        printer.align('CT').style('NORMAL').tableCustom([
          {text: ingredient.qte, cols:3, align:'RIGHT'},
          {text:'', cols:1},
          {text: '  '+ingredient.nom, cols:22, align:'LEFT'},
          {text:'', cols:1},
          {text: ingredient.pu, cols:6, align:'RIGHT'},
          {text:'', cols:1},
          {text: ingredient.prix, cols:6, align:'RIGHT'},
          {text:'', cols:1},
          {text: ingredient.codetva, cols:1}
        ]);
        if (ingredient.comment!=='') {
          printer.align('CT').style('B').tableCustom([
            {text:'', cols:3},
            {text: '* ', cols:2, align:'RIGHT'},
            {text: ingredient.comment, cols:32, align:'LEFT'},
            {text: ' *', cols:2, align:'RIGHT'},
            {text:'', cols:3}
          ]);
          _linecount++;
        }
        _linecount++;
      });
    }
    if (article.modificateur) {
      printer.align('CT').style('B').tableCustom([
        {text: '', cols:4},
        {text: strings.modificateur.discount_item, cols:22, align:'LEFT'},
        {text:'', cols:1},
        {text: article.modificateur.montant ? '' : '-'+article.modificateur.valeur, cols:6, align:'RIGHT'},
        {text:'', cols:1},
        {text: article.modificateur.montant ? '-'+article.modificateur.montant.toFixed(2) : '-'+article.modificateur.valeur, cols:6, align:'RIGHT'},
        {text:'', cols:2}
      ]);
      _linecount++;
    }
  });

  // modificateurs (charge ou discount) au niveau de la commande
  if (data.modificateur) {

    // sous-total
    printer
      .drawLine()
      .align('CT')
      // .size(1,1)
      .size(0,0)
      .tableCustom([
        {text: `${strings.detail.sous_total}   ${_subtotal.toFixed(2).toString().replace('.',',')}`, cols:42, align:'right'}
      ])
      // .size(1,1)
      .size(0,0)
      .drawLine();

      const ispc = String(data.modificateur.valeur).substr(-1,1)==='%';
      let modval = Math.abs(Number(String(data.modificateur.valeur).slice(0,-1)));
      let montant = null;
      if (!ispc) {
        modval = modval.toFixed(2).toString().replace('.',',') + ' EUR';
      } else {
        modval += ' %';
        montant = data.modificateur.montant.toFixed(2).toString().replace('.',',') + ' EUR';
      }

    if (montant) {
        
      printer
        .align('CT')
        // .size(1,1)
        .size(0,0)
        .tableCustom([
          {text: strings.modificateur.discount_panier, cols:22, align:'LEFT'},
          {text: '-'+modval, cols:10, align:'RIGHT'},
          {text: '-'+montant, cols:10, align:'RIGHT'}
        ])
        .size(0,0)
      }
      else {

      printer
      .align('CT')
      // .size(1,1)
      .size(0,0)
      .tableCustom([
        {text: strings.modificateur.discount_panier, cols:22, align:'LEFT'},
        {text: '', cols:10, align:'RIGHT'},
        {text: '-'+modval, cols:10, align:'RIGHT'}
      ])
      .size(0,0)
      }
  }

  // total
  printer
    .drawLine()
    .align('CT')
    // .size(1,2)
    .size(0,1)
    .tableCustom([
      {text: `${strings.detail.total_ttc}   ${data.total.total.replace('.',',')}`, cols:42, align:'RIGHT'}
    ])
    // .size(1,1)
    .size(0,0)
    .drawLine();

  printer
    .font('A')
    .align('CT')
    .tableCustom([
      {text: `${strings.detail.nbr_lignes} ${_linecount}`, cols:42, align:'LEFT'}
    ]);

  // tva
  printer
    .align('CT')
    .drawLine();

  // header
  printer
    .align('CT')
    .style('B')
    .tableCustom([
      {text: strings.tva.code, cols:4, align:'LEFT'},
      {text:'', cols:2},
      {text: strings.tva.taux, cols:6, align:'RIGHT'},
      {text:'', cols:2},
      {text: strings.tva.tva, cols:8, align:'RIGHT'},
      {text:'', cols:2},
      {text: strings.tva.ht, cols:8, align:'RIGHT'},
      {text:'', cols:2},
      {text: strings.tva.ttc, cols:8, align:'RIGHT'}
    ])
    .style('NORMAL')

  for (let [key, value] of Object.entries(data.total.tva)) {
    printer.tableCustom([
      {text:key, cols:4, align:'LEFT'},
      {text:'', cols:2},
      {text:value.taux, cols:6, align:'RIGHT'},
      {text:'', cols:2},
      {text:value.montant.toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
      {text:'', cols:2},
      {text:value.ht.toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
      {text:'', cols:2},
      {text:value.ttc.toFixed(2).replace('.',','), cols:8, align:'RIGHT'}
    ]);
  }


  // reglements
  if (data.reglements.length>0) {
    
    printer
      .align('CT')
      .drawLine()
      .style('NORMAL').text(strings.reglements.titre);

      data.reglements.forEach(reglement => {
        printer.style('NORMAL').tableCustom([
          {text:'', cols:1},
          {text: reglement.moyen, cols:28, align:'LEFT'},
          {text:'', cols:1},
          {text: `${reglement.valeur.toFixed(2).replace('.',',')} ${strings.reglements.monnaie}`, cols:12, align:'RIGHT'}
        ]);
      });
  }
  // ou à régler
  else {

    printer
      .align('CT')
      .drawLine()
      // .size(1,2)
      .size(0,1)
      .tableCustom([
        {text: `${strings.reglements.a_regler}   ${data.total.total.replace('.',',')}`, cols:42, align:'CENTER'}
      ])
      // .size(1,1);
      .size(0,0);
  }

  // rendu monnaie
  if (data.rendus.length>0) {
    printer
      .drawLine()
      .style('NORMAL').text(strings.rendu.titre);

    data.rendus.forEach(rendu => {
      printer.style('NORMAL').tableCustom([
        {text:'', cols:1},
        {text: rendu.moyen, cols:28, align:'LEFT'},
        {text:'', cols:1},
        {text: `${rendu.valeur.toFixed(2).replace('.',',')} ${strings.rendu.monnaie}`, cols:12, align:'RIGHT'}
      ]);
    });
  }

  printer.drawLine();
  



}


function _printPeriodeX(printer, data, strings) {

  _printPeriodeZ(printer, data, strings, true);
/*
  // EN-TÊTE:
    printer
      // .size(1,1)
      .size(0,0)
      .drawLine()
      .align('CT')
      .tableCustom([{text: strings.periode.titre, cols:42, align:'LEFT'}])
      .tableCustom([{text: data.debut+' -> '+data.fin, cols:42, align:'CENTER'}])
      .tableCustom([{text: strings.editeur+data.editeur.nom, cols:42, align:'LEFT'}])
      .feed(1)
      ;
    // vendeur(s) :
    if (data.vendeurs.length>1) {
      printer.tableCustom([
          {text: strings.vendeurs[1]+strings.vendeurs_all, cols:42, align:'LEFT'}
      ]);
    } else if (data.vendeurs.length==1){
      printer.tableCustom([
        {text: strings.vendeurs[0]+data.vendeurs[0].nom, cols:42, align:'LEFT'}
      ]);
    }
    // caisse(s) :
    if (data.caisses.length>1) {
      printer.tableCustom([
        {text: strings.caisses[1]+strings.caisses_all, cols:42, align:'LEFT'}
      ])
      .feed(1);
    } else if (data.caisses.length==1){
      printer.tableCustom([
        {text: strings.caisses[0]+data.caisses[0].nom+' ('+data.caisses[0].id+')', cols:42, align:'LEFT'}
      ]).feed(1);
    }
    // récap montants :
    printer
      .tableCustom([
        {text: strings.depenses, cols:30, align:'LEFT'},
        {text: Number(data.depenses).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.remboursements, cols:30, align:'LEFT'},
        {text: Number(data.remboursements).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.encaissements, cols:30, align:'LEFT'},
        {text: Number(data.ventes).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.mtcaisse, cols:30, align:'LEFT'},
        {text: Number(data.mtcaisse).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
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
      {text: strings.caption.ventes, cols:22, align:'LEFT'},
      {text: Number(data.ventes).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .tableCustom([
      {text: strings.caption.remboursements, cols:22, align:'LEFT'},
      {text: "-"+Number(data.remboursements).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:6, align:'RIGHT'}
    ])
    .drawLine()
    .tableCustom([
      {text: strings.caption.ca, cols:22, align:'LEFT'},
      {text: Number(data.ca).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .feed(1)
    .tableCustom([
      {text: '', cols:5, align:'LEFT'},
      {text: strings.caption.numtickets, cols:17, align:'LEFT'},
      {text: data.numtickets, cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .tableCustom([
      {text: '', cols:5, align:'LEFT'},
      {text: strings.caption.ticket_moyen, cols:17, align:'LEFT'},
      {text: Number(data.ticket_moyen).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
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
        {text: '', cols:15, align:'LEFT'},
        {text: strings.caption.vente_short, cols:9, align:'RIGHT'},
        {text: strings.caption.remboursements_short, cols:9, align:'RIGHT'},
        {text: strings.caption.ca_short, cols:9, align:'RIGHT'}
      ]);

    data.ventilation.vendeur.forEach(vendeur => {
      
      printer
        .style('NORMAL')
        .tableCustom([
          {text: vendeur.nom+' ('+vendeur.id+')', cols:15, align:'LEFT'},
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
        {text: strings.caption.total, cols:15, align:'LEFT'},
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
        {text: strings.caption.ht, cols:8, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.caption.tva, cols:8, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.caption.ttc, cols:8, align:'RIGHT'}
      ]);

    data.ventilation.tva.forEach(tva => { 
      printer
        .style('NORMAL')
        .tableCustom([
          // {text: Number(tva.taux*100).toFixed(2).replace('.',',')+'%', cols:9, align:'LEFT'},
          {text: tva.taux, cols:9, align:'LEFT'},
          {text:'', cols:3},
          {text: Number(tva.ht).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(tva.montant).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(tva.ttc).toFixed(2).replace('.',','), cols:8, align:'RIGHT'}
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
      {text: Number(tvaht).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
      {text:'', cols:3},
      {text: Number(tvamnt).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
      {text:'', cols:3},
      {text: Number(tvattc).toFixed(2).replace('.',','), cols:8, align:'RIGHT'}
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
          {text: strings.caption.moyens[moyen.moyen], cols:24, align:'LEFT'},
          {text: Number(moyen.valeur).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
        ]);
        moytotal += moyen.valeur;
    });

    printer
    .feed(1)
    .tableCustom([
      {text: strings.caption.total, cols:24, align:'LEFT'},
      {text: Number(moytotal).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
    ]);
        
    */
}
function _printPrelevement(printer, data, strings) {
  printer
      // .size(1,1)
      .size(0,0)
      .drawLine()
      .align('CT')
      .tableCustom([
        {text: strings.prelevement, cols:24, align:'LEFT'},
        {text: Number(data).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
      ]);
}

function _printMouvements(printer, data, strings) {

  if (data!==null && data.length>0) {
    printer
      .drawLine()
      .align('CT')
      .style('B')
      .setReverseColors(true)
      .text(_completeRaw(strings.mouvements.titre, "center"))
      .setReverseColors(false)
      .drawLine();

    let credit = 0;
    let debit = 0;

    printer
      .tableCustom([
        {text: strings.mouvements.type, cols:9, align:'LEFT'},
        {text:'', cols:3},
        {text: strings.mouvements.debit, cols:8, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.mouvements.credit, cols:8, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.mouvements.solde, cols:8, align:'RIGHT'}
      ]);

    data.forEach(mvt => { 
      printer
        .style('NORMAL')
        .tableCustom([
          {text: strings.mouvements.types[mvt.type], cols:9, align:'LEFT'},
          {text:'', cols:3},
          {text: (mvt.debit>0) ? '- '+Number(mvt.debit/100).toFixed(2).replace('.',',') : '---', cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: (mvt.credit>0) ? '+ '+Number(mvt.credit/100).toFixed(2).replace('.',',') : '---', cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(mvt.solde/100).toFixed(2).replace('.',','), cols:8, align:'RIGHT'}
        ]);
        debit += mvt.debit;
        credit += mvt.credit;
    });

    if (debit > 0 || credit >0) {
      printer
        .feed(1)
        .tableCustom([
          {text: strings.mouvements.total, cols:9, align:'LEFT'},
          {text:'', cols:3},
          {text: (debit>0) ? '- '+Number(debit/100).toFixed(2).replace('.',',') : '', cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: (credit>0) ? '+ '+Number(credit/100).toFixed(2).replace('.',',') : '', cols:8, align:'RIGHT'},
          {text:'', cols:11}
        ]);
    }
  }
}

function _printPeriodeZ(printer, data, strings, printx=false) {

  log.info('_printPeriodeZ data', data);

  // EN-TÊTE:
    printer
      // .size(1,1)
      .size(0,0)
      .drawLine()
      .align('CT')
      .tableCustom([{text: strings.periode.titre, cols:42, align:'LEFT'}])
      .tableCustom([{text: data.debut+' -> '+data.fin, cols:42, align:'CENTER'}])
      .tableCustom([{text: strings.editeur+data.editeur.nom, cols:42, align:'LEFT'}])
      .feed(1)
      ;
    // vendeur :
    if (data.vendeur) {
      printer.tableCustom([
        {text: strings.vendeurs[0]+data.vendeur.nom+' ('+data.vendeur.id+')', cols:42, align:'LEFT'}
      ]);
    } else {
      printer.tableCustom([
          {text: strings.vendeurs[1]+strings.vendeurs_all, cols:42, align:'LEFT'}
      ]);
    }
    // caisse :
    if (data.caisse) {
      printer.tableCustom([
        {text: strings.caisses[0]+data.caisse.nom+' ('+data.caisse.id+')', cols:42, align:'LEFT'}
      ]).feed(1);
      
    } else {
      printer.tableCustom([
        {text: strings.caisses[1]+strings.caisses_all, cols:42, align:'LEFT'}
      ]).feed(1);
    }
    // récap montants :
    printer
      .tableCustom([
        {text: strings.depenses, cols:30, align:'LEFT'},
        {text: Number(data.depenses).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.remboursements, cols:30, align:'LEFT'},
        {text: Number(data.remboursements).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      ])
      .tableCustom([
        {text: strings.encaissements, cols:30, align:'LEFT'},
        {text: Number(data.ventes).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      ])
      // .tableCustom([
      //   {text: strings.mtcaisse, cols:30, align:'LEFT'},
      //   {text: Number(data.mtcaisse).toFixed(2).replace('.',','), cols:12, align:'RIGHT'}
      // ])
      .feed(1);

  // CORPS
    // titre0
    printer
      .drawLine()
      .align('CT')
      .style('B')
      .text(printx ? strings.titre.x : strings.titre.z)
      .drawLine();
    
    // recap :
    printer
    .style('NORMAL')
    .tableCustom([
      {text: strings.caption.ventes, cols:22, align:'LEFT'},
      {text: Number(data.ventes).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .tableCustom([
      {text: strings.caption.remboursements, cols:22, align:'LEFT'},
      {text: "-"+Number(data.remboursements).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:6, align:'RIGHT'}
    ])
    .drawLine()
    .tableCustom([
      {text: strings.caption.ca, cols:22, align:'LEFT'},
      {text: Number(data.ca).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .feed(1)
    .tableCustom([
      {text: '', cols:5, align:'LEFT'},
      {text: strings.caption.numtickets, cols:17, align:'LEFT'},
      {text: data.numtickets, cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .tableCustom([
      {text: '', cols:5, align:'LEFT'},
      {text: strings.caption.ticket_moyen, cols:17, align:'LEFT'},
      {text: Number(data.ticket_moyen).toFixed(2).replace('.',','), cols:12, align:'RIGHT'},
      {text: '', cols:8, align:'RIGHT'}
    ])
    .drawLine()
    ;

    // ventilation par caissier
    printer
      .align('CT')
      .style('B')
      .setReverseColors(true)
      .text(_completeRaw(strings.ventilation.vendeur, "center"))
      .setReverseColors(false)
      .drawLine();

    let vndvnt = 0;
    let vndrmb = 0;
    let vndtotal = 0;

    printer
      .tableCustom([
        {text: '', cols:15, align:'LEFT'},
        {text: strings.caption.vente_short, cols:9, align:'RIGHT'},
        {text: strings.caption.remboursements_short, cols:9, align:'RIGHT'},
        {text: strings.caption.ca_short, cols:9, align:'RIGHT'}
      ]);

    data.ventilation.vendeur.forEach(vendeur => {
      
      printer
        .style('NORMAL')
        .tableCustom([
          {text: vendeur.nom+' ('+vendeur.id+')', cols:15, align:'LEFT'},
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
        {text: strings.caption.total, cols:15, align:'LEFT'},
        {text: Number(vndvnt).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
        {text: '-'+Number(vndrmb).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
        {text: Number(vndtotal).toFixed(2).replace('.',','), cols:9, align:'RIGHT'}
      ]);

    // ventilation par TVA
    printer
      .drawLine()
      .align('CT')
      .style('B')
      .setReverseColors(true)
      .text(_completeRaw(strings.ventilation.tva, "center"))
      .setReverseColors(false)
      .drawLine();

    let tvaht = 0;
    let tvamnt = 0;
    let tvattc = 0;

    printer
      .tableCustom([
        {text: strings.caption.type, cols:9, align:'LEFT'},
        {text:'', cols:3},
        {text: strings.caption.ht, cols:8, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.caption.tva, cols:8, align:'RIGHT'},
        {text:'', cols:3},
        {text: strings.caption.ttc, cols:8, align:'RIGHT'}
      ]);

    data.ventilation.tva.forEach(tva => { 
      printer
        .style('NORMAL')
        .tableCustom([
       //   {text: Number(tva.taux*100).toFixed(2).replace('.',',')+'%', cols:9, align:'LEFT'},
          {text: tva.taux, cols:9, align:'LEFT'},
          {text:'', cols:3},
          {text: Number(tva.ht).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(tva.montant).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
          {text:'', cols:3},
          {text: Number(tva.ttc).toFixed(2).replace('.',','), cols:8, align:'RIGHT'}
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
      {text: Number(tvaht).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
      {text:'', cols:3},
      {text: Number(tvamnt).toFixed(2).replace('.',','), cols:8, align:'RIGHT'},
      {text:'', cols:3},
      {text: Number(tvattc).toFixed(2).replace('.',','), cols:8, align:'RIGHT'}
    ]);


    // ventilation par moyen de paiement

    printer
      .drawLine()
      .align('CT')
      .style('B')
      .setReverseColors(true)
      .text(_completeRaw(strings.ventilation.moyen, "center"))
      .setReverseColors(false)
      .drawLine();

    let moytotal = 0;
    let ecarttotal = 0;


    // en-tête
    printer
      .style('NORMAL')
      .tableCustom([
        {text: strings.caption.moyens_th.moyen, col:14, align:'LEFT'},
        {text: strings.caption.moyens_th.theorique, col:10, align:'RIGHT'},
        {text: strings.caption.moyens_th.comptage, col:10, align:'RIGHT'},
        {text: strings.caption.moyens_th.ecart, col:8, align:'RIGHT'},
      ]);


    data.ventilation.moyen.forEach(moyen => { 

      let __moy = moyen.moyen;
      let __val = moyen.valeur;

      // on déduit le montant des avoirs émis du total des TR
      if (moyen.moyen==='ticket') __val -= data.emission;

      const __moy_ecart = (data.ecarts.hasOwnProperty(__moy) && data.ecarts[__moy]!==null) ? data.ecarts[__moy].valeur : 0;

      moytotal += __val;
      ecarttotal += __moy_ecart;

      printer
        .style('NORMAL')
        .tableCustom([
          {text: strings.caption.moyens[moyen.moyen], col:14, align:'LEFT'},
          {text: Number(__val).toFixed(2).replace('.',','), col:10, align:'RIGHT'},
          {text: Number(data.comptage[__moy]).toFixed(2).replace('.',','), col:10, align:'RIGHT'},
          __moy_ecart===0 ? {text: '', col:8} : {text: `${(Number(__moy_ecart)>0) ? '+':''}${ Number(__moy_ecart).toFixed(2).replace('.',',') }`, cols:8, align:'RIGHT'}
        ]);
      if (__moy_ecart!==0) {
        printer
          .tableCustom([
            {text: ` * ${strings.caption.ecart.motif}`, cols:18, align:'LEFT'},
            {text: data.ecarts[__moy].motif, cols:20, align:'LEFT'},
            {text: ' *', cols:4, align:'LEFT'}
          ])
          .feed(1);
      }

   });

    const cpttotal = (data.comptage && data.comptage.hasOwnProperty('total')) ? data.comptage.total: 0;

    printer
      .feed(1)
      .style('NORMAL')
      .tableCustom([
        {text: strings.caption.total, col:14, align:'LEFT'},
        {text: Number(moytotal).toFixed(2).replace('.',','), col:10, align:'RIGHT'},
        {text: Number(cpttotal).toFixed(2).replace('.',','), col:10, align:'RIGHT'},
        {text: Number(ecarttotal).toFixed(2).replace('.',','), col:8, align:'RIGHT'},
      ]);

    // émission d'avoirs
    if (data.emission>0) {
      printer
        .feed(1)
        .drawLine()
        .tableCustom([
          {text: strings.caption.emission, cols:24, align:'LEFT'},
          {text: Number(data.emission).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
        ]);
    }
        
}

// complete la ligne avec des espaces
function _completeRaw(string, alignment='left') {

    const __sp = 42 - String(string).length;
    let __str = "";
    switch(alignment) {
      case "center":
         __str = (new Array(Math.floor(__sp/2)+1)).join(' ') + string + (new Array(Math.floor(__sp/2)+1+(__sp%2))).join(' ');
         break;
      case "right":
         __str = (new Array(__sp+1)).join(' ') + string;
         break;
      default:
        __str = string + (new Array(__sp+1)).join(' ');
    }
    return __str;
}


// complete la ligne avec des espaces
function _completeRaw(string, alignment='left', options={}) {


  const __width = options.hasOwnProperty('width') ? 42/(options.width+1) : 42;

  const __sp = __width - String(string).length;
  let __str = "";
  switch(alignment) {
    case "center":
       __str = (new Array(Math.floor(__sp/2)+1)).join(' ') + string + (new Array(Math.floor(__sp/2)+1+(__sp%2))).join(' ');
       break;
    case "right":
       __str = (new Array(__sp+1)).join(' ') + string;
       break;
    default:
      __str = string + (new Array(__sp+1)).join(' ');
  }
  return __str;
}


function _printUber(printer, data, strings) {
  printer
    // .size(1,1)
    .size(0,0)
    .drawLine()
    .align('CT')
    .style('B')
    // .size(2,2)
    .size(1,1)
    .text(strings.titre)
    .text('#'+data.display_id)
    .font('A')
    // .size(1,1)
    .size(0,0)
    .style('NORMAL')
    .feed(1)
    .text(`${strings.client} ${data.eater.first_name} ${data.eater.last_name}` )
    // .size(1,1)
    .size(0,0)
    .drawLine()
    // .size(2,2)
    .size(1,1)
    .text(strings.texte + data.heure)
    // .size(1,1);
    .size(0,0);
}

// message
function _printMessage(printer, data, strings) {
  
    printer
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