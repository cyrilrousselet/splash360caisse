const express = require('express');
const api_server = express();
const sync_server = express();
const log = require('electron-log');
const cors = require('cors');

const http = require('http').Server(sync_server);
const io = require('socket.io')(http);
const ioclient = require('socket.io-client');

const connectedSlaves = [];

let socket = null;

const API_PORT = 3300;
const SYNC_PORT = 3340;



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
    api_server.use(cors({origin: "*"}));

    api_server.use(express.urlencoded({extended: false})).use(express.json());
    api_server.get('/', (req,res) => {
      log.info('GET : '+req.query.fui);
      let __d = new Date();
      res.json({status:'success', commandeid: 'c'+__d.getTime().toString()});
    });
    api_server.post('/', (req,res) => {
      log.info('POST : '+req.body.data);
      let __d = new Date();
      res.json({status:'success', commandeid: 'c'+__d.getTime().toString()});
    });
    // ajout de commande depuis les bornes
    api_server.post('/setcommande', (req,res) => {
      log.info('POST setcommande', req.body.data);
      
      const response_id = responses.push(res) - 1;
      webContents.send('setCommande', {data: req.body.data, response: response_id});
    });
    

    // SYNCHRO slaves -> master

    // ajout / mise à jour de commande depuis les caisses esclaves
    api_server.post('/synccommande', (req, res) => {
      log.info('POST synccommande', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setCommandeSync', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de client depuis les caisses esclaves
    api_server.post('/syncclient', (req, res) => {
      log.info('POST syncclient', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setClientSync', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de ticket restaurant depuis les caisses esclaves
    api_server.post('/syncticketrestaurant', (req, res) => {
      log.info('POST syncticketrestaurant', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setTicketRestaurantSync', {data: req.body.data, response: response_id});
    });
    // ajout / mise à jour de pointages depuis les caisses esclaves
    api_server.post('/syncpointage', (req, res) => {
      log.info('POST syncpointage', req.body.data);

      const response_id = responses.push(res) - 1;
      webContents.send('setPointageSync', {data: req.body.data, response: response_id});
    });


    api_server.listen(API_PORT, () => {
      log.info( `api_server listening on *:${API_PORT}` );
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
  },

  // on lance la connexion au master (si la caisse est "slave")
  syncConnectToMaster: (req, res) => {
    const { url, caisse } = req.payload;

    log.info('syncConnectToMaster', req.payload);

    socket = ioclient(url, {
      transports: ['websocket'],
    });

    
    socket.on('sync', data => {
      log.info('on sync', data);
    });
    res.send({msg:'connection sent to master'})
  },

  // déconnexion du master
  syncDisconnectFromMaster: (req, res) => {
    if (socket) socket.disconnect();
    res.send({msg:'disconnected from master'});
  },

  // lancement du webservice (si la caisse est "master")
  syncStartMaster: (req, res) => {


    sync_server.use(cors({origin: "*"}));

    io.on('connection', (sock) => {
      connectedSlaves.push(sock.id);
      log.info('socket connected', sock.id);
      io.to(sock).emit('sync',{type:'syncinit'});

      sock.on('sync', (action)=>{
        
        log.info('sync', action);
     //   io.to(sock).emit('connect');
      })
    

      sock.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          sock.connect();
        } 
        // else the socket will automatically try to reconnect
        connectedSlaves.forEach((device, i) => {
          // console.log("device", device)
          if (device == socket.id) {
            // console.log("socket", socket.id)
            connectedSlaves.splice(i, 1)
          }
        })
      });



    });

    http.listen(SYNC_PORT, function(){
      log.info( `sync_server listening on *:${SYNC_PORT}` );
      res.send({msg:'master wait for slaves'});
    });

  },

  syncDispatchToSlaves: (req,res) => {
    const { db, data } = req.payload;

    connectedSlaves.forEach(sock => {
      io.to(sock).emit('sync', {db:db, data:data);
    });

    log.info(`syncDispatchToSlaves() [${db}] to ${connectedSlaves.length} slaves`);
    res.send({msg:`'sync to ${connectedSlaves.length} slaves`});
  }

};


    
module.exports = {
  ...server,
  ...actions
};
