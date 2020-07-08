const express = require('express');
const api_server = express();
const sync_server = express();
const log = require('electron-log');
const cors = require('cors');
const {net} = require('electron');

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
    api_server.post('/synchro', (req, res) => {
    
      const {db, data} = req.body;
      log.info('POST synchro', req.body);
      log.info('POST keys', Object.keys(req.body));
      log.info('POST db', req.body['db']);

      const response_id = responses.push(res) - 1;
      switch(db) {
        case 'commande':
          webContents.send('setCommandeSync', {data: data, response: response_id});
          break;
        case 'client':
          webContents.send('setClientSync', {data: data, response: response_id});
          break;
        case 'ticketrestaurant':
          webContents.send('setTicketRestaurantSync', {data: data, response: response_id});
          break;
        case 'pointage':
          webContents.send('setPointageSync', {data: data, response: response_id});
          break;
        case 'avoir':
          webContents.send('setAvoirSync', {data: data, response: response_id});
          break;
        case 'timeadjust':
          webContents.send('setTimeadjustSync', {data: data, response: response_id});
          break;
        case 'cloture':
          webContents.send('setClotureSync', {data: data, response: response_id});
          break;
        case 'user':
          webContents.send('setUserSync', {data: data, response: response_id});
          break;
        default:
          log.info(`POST synchro db "${db}" inconnue`);
      }
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

  // confirme la bonne réception des synchro s/m
  syncConfirm: (req, res) => {
    const { confirm, response } = req.payload;
    responses[response].json({status:('ok'===confirm)?'success':'error'});
    res.send({msg: 'sync confirm sent'});
  },

  // on lance la connexion au master (si la caisse est "slave")
  syncConnectToMaster: (req, res) => {
    const { url, caisse } = req.payload;

    log.info('syncConnectToMaster', req.payload);

    // socket = ioclient(url, {transports: ['websocket']});
    socket = ioclient(url+':'+SYNC_PORT);

    log.info('socket', socket);
    
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
      log.info(`${connectedSlaves.length} socket(s) connected. New id : `, sock.id);
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
          try {
            if (device == sock.id) {
              // console.log("socket", socket.id)
              connectedSlaves.splice(i, 1)
            }
          } catch(error) {
            log.info('sync disconnect error', error.message);
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
      io.to(sock).emit('sync', {db:db, data:data});
    });

    log.info(`syncDispatchToSlaves() [${db}] to ${connectedSlaves.length} slaves`);
    res.send({msg:`sync to ${connectedSlaves.length} slaves`});
  },

  syncDispatchToMaster: (req,res) => {

    const { db, data, url } = req.payload;

    // connectedSlaves.forEach(sock => {
    //   io.to(sock).emit('sync', {db:db, data:data});
    // });

    log.info('syncDispatchToMaster', req.payload);

    const __request = net.request({
      url: url+':'+API_PORT+'/synchro',
      method: 'post'
    });
    // __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    
    __request.write(JSON.stringify({db:db, data:data}));

    __request.on('response', (response) => {

      log.info(`syncDispatchToMaster() [${db}] to ${url}, status:`, response.statusCode);
      res.send({msg:`synchro ${db} to master`});
    //   log.info(`acceptUberOrder STATUS: ${response.statusCode}`);
    //   log.info(`acceptUberOrder HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
    //     __confirmation.push(chunk);
    //     log.info(`acceptUberOrder BODY: ${chunk}`)
      });
      response.on('end', () => {
    //     log.info('acceptUberOrder: end');
    //     // res.send({confirm: JSON.parse(__confirmation.join(''))});
    //     res.send({confirm: true});
      });
    });

    __request.end();

  }

};


    
module.exports = {
  ...server,
  ...actions
};
