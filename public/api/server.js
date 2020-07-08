const express = require('express');
const xpr = express();
const log = require('electron-log');
const cors = require('cors');

const http = require('http').Server(xpr);
const io = require('socket.io')(http);
const ioclient = require('socket.io-client');

const connectedSlaves = [];

let socket = null;


xpr.listen(3300, () => {
  log.info('server écoute le port 3300');
})


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
    // ajout de commande depuis les bornes
    xpr.post('/setcommande', (req,res) => {
      log.info('POST setcommande', req.body.data);
      
      const response_id = responses.push(res) - 1;
      webContents.send('setCommande', {data: req.body.data, response: response_id});
    });
    

    // SYNCHRO slaves -> master

    // ajout / mise à jour de commande depuis les caisses esclaves
    xpr.post('/synccommande', (req, res) => {
      log.info('POST synccommande', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setCommandeSync', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de client depuis les caisses esclaves
    xpr.post('/syncclient', (req, res) => {
      log.info('POST syncclient', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setClientSync', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de ticket restaurant depuis les caisses esclaves
    xpr.post('/syncticketrestaurant', (req, res) => {
      log.info('POST syncticketrestaurant', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setTicketRestaurantSync', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de pointages depuis les caisses esclaves
    xpr.post('/syncpointage', (req, res) => {
      log.info('POST syncpointage', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setPointageSync', {data: req.body.data, response: response_id});
    });
  }
}

const actions = {
  sendTicketId: (req, res) => {

    
    const { ticketId, response } = req.payload;
   // log.info(response);
    responses[response].json({status:'success', commandeid: ticketId});
    
    log.info('ticketID : '+ticketId);

    res.send({msg: 'ticketID sent'});
  },
  syncConnectToMaster: (req, res) => {
    const { url, caisse } = req.payload;

    log.info('syncConnectToMaster', req.payload);

    socket = ioclient(url, {
      transports: ['websocket'],
    });

    socket.on('connect', function() {
      logger.log('on connect');
    });
    
    socket.on('sync', data => {
      logger.log('on sync', data);
    });
    res.send({msg:'connection sent to master'})
  },
  syncDisconnectFromMaster: (req, res) => {
    if (socket) socket.disconnect();
    res.send({msg:'disconnected from master'});
  },
  syncStartMaster: (req, res) => {
    io.on('connection', (sock) => {
      connectedSlaves.push(sock.id);
      log.info('caisse connected', sock);
      io.to(sock).emit('connect');
    });
    res.send({msg:'master wait for slaves'});
  }
};


    
module.exports = {
  ...server,
  ...actions
};
