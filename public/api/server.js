const express = require('express');
const xpr = express();
const log = require('electron-log');
const cors = require('cors');

const http = require('http').Server(xpr);
const io = require('socket.io')(http);

const connectedSlaves = [];


const allowedOrigins = [
  'http://127.0.0.1',
  'http://localhost',
  'http://192.168.1.185'
  //'*'
];

let responses = [];

const server = {
  init: (webContents) => {

    log.info('server.init()');


    // xpr.use(cors({
    //   origin: function(origin, callback){
    //     // allow requests with no origin
    //     // (like mobile apps or curl requests)
    //     if(!origin) return callback(null, true);
    //     if(allowedOrigins.indexOf(origin) === -1){
    //       var msg = 'The CORS policy for this site does not ' +
    //                 'allow access from the specified Origin.';
    //       return callback(new Error(msg), false);
    //     }
    //     return callback(null, true);
    //   }
    // }));
    xpr.use(cors({origin: "*"}));

    xpr.use(express.urlencoded({extended: false})).use(express.json());
    xpr.get('/', (req,res) => {
      log.info('GET : '+req.query.fui);
      let __d = new Date();
      res.json({status:'success', commandeid: 'c'+__d.getTime().toString()});
    });
    xpr.post('/', (req,res) => {
      log.info('POST : '+req.body.data);
      let __d = new Date();
      res.json({status:'success', commandeid: 'c'+__d.getTime().toString()});
    });
    // ajout / mise à jour de commande depuis les caisses esclaves ou les bornes
    xpr.post('/setcommande', (req,res) => {
      log.info('POST setcommande', req.body.data);
      
      const response_id = responses.push(res) - 1;
      webContents.send('setCommande', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de client depuis les caisses esclaves
    xpr.post('/setclient', (req, res) => {
      log.info('POST setclient', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setClient', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour d'avoirs depuis les caisses esclaves
    xpr.post('/setavoir', (req, res) => {
      log.info('POST setavoir', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setAvoir', {data: req.body.data, response: response_id});
    });
    xpr.listen(3300, () => {
      log.info('server écoute le port 3300');
    })
  }
}

const actions = {
  sendTicketId: (req, res) => {

    
    const { ticketId, response } = req.payload;
   // log.info(response);
    responses[response].json({status:'success', commandeid: ticketId});
    
    log.info('ticketID : '+ticketId);

    res.send({msg: 'ticketID sent'});
  }
};


    
module.exports = {
  ...server,
  ...actions
};
