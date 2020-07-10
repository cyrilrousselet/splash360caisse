const express = require('express');
const api_server = express();
const sync_server = express();
const log = require('electron-log');
const cors = require('cors');
const {net} = require('electron');

const http = require('http').Server(sync_server);
const io = require('socket.io')(http);
const ioclient = require('socket.io-client');

const connectedSecondaries = {};

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
    

    // SYNCHRO secondary -> primary

    // ajout / mise à jour de commande depuis les caisses secondary
    api_server.post('/synchro', (req, res) => {
    
      const {db, data, emitter} = req.body;
      log.info('POST synchro', req.body);
      log.info('POST db', req.body['db'], `from ${emitter.nom}`);

      const response_id = responses.push(res) - 1;

      synchroTreatment(webContents, db, data, emitter);

      // switch(db) {
      //   case 'commande':
      //     webContents.send('setCommandeSync', {data, emitter, response: response_id});
      //     break;
      //   case 'archivecommandes':
      //     webContents.send('archiveCommandesSync', {data, emitter, response: response_id});
      //     break;
      //   case 'client':
      //     webContents.send('setClientSync', {data, emitter, response: response_id});
      //     break;
      //   case 'ticketrestaurant':
      //     webContents.send('setTicketRestaurantSync', {data, emitter, response: response_id});
      //     break;
      //   case 'pointage':
      //     webContents.send('setPointageSync', {data, emitter, response: response_id});
      //     break;
      //   case 'avoir':
      //     webContents.send('setAvoirSync', {data, emitter, response: response_id});
      //     break;
      //   case 'timeadjust':
      //     webContents.send('setTimeadjustSync', {data, emitter, response: response_id});
      //     break;
      //   case 'cloture':
      //     webContents.send('setClotureSync', {data, emitter, response: response_id});
      //     break;
      //   case 'user':
      //     webContents.send('setUserSync', {data, emitter, response: response_id});
      //     break;
      //   default:
      //     log.info(`POST synchro db "${db}" inconnue`);
      // }
    });



    api_server.listen(API_PORT, () => {
      log.info( `api_server listening on *:${API_PORT}` );
    })

  }
}


const synchroTreatment = (wcnt, db, data, emitter=null) => {

  log.info('synchroTreatment()', db, emitter);

  switch(db) {
    case 'commande':
      wcnt.send('setCommandeSync', {data, emitter, response: response_id});
      break;
    case 'archivecommandes':
      wcnt.send('archiveCommandesSync', {data, emitter, response: response_id});
      break;
    case 'client':
      wcnt.send('setClientSync', {data, emitter, response: response_id});
      break;
    case 'ticketrestaurant':
      wcnt.send('setTicketRestaurantSync', {data, emitter, response: response_id});
      break;
    case 'pointage':
      wcnt.send('setPointageSync', {data, emitter, response: response_id});
      break;
    case 'avoir':
      wcnt.send('setAvoirSync', {data, emitter, response: response_id});
      break;
    case 'timeadjust':
      wcnt.send('setTimeadjustSync', {data, emitter, response: response_id});
      break;
    case 'cloture':
      wcnt.send('setClotureSync', {data, emitter, response: response_id});
      break;
    case 'user':
      wcnt.send('setUserSync', {data, emitter, response: response_id});
      break;
    default:
      log.info(`POST synchro db "${db}" inconnue`);
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

  // on lance la connexion au "primary" (si la caisse est "secondary")
  syncConnectToPrimary: (req, res) => {
    const { url, caisse } = req.payload;

    log.info('syncConnectToPrimary', req.payload);

    // socket = ioclient(url, {transports: ['websocket']});
    socket = ioclient(url+':'+SYNC_PORT);
    socket.on('connect', () => {
      socket.emit('register',caisse);
    });

    log.info('socket', socket);
    
    // écouteur de synchro de la part du primary
    socket.on('sync', payload => {
      log.info('on sync', payload);

      synchroTreatment(payload.db, payload.data);

    });
    res.send({msg:'connection sent to primary'})
  },

  // déconnexion du primary
  syncDisconnectFromPrimary: (req, res) => {
    if (socket) socket.disconnect();
    res.send({msg:'disconnected from primary'});
  },

  // lancement du webservice (si la caisse est "primary")
  syncStartPrimary: (req, res) => {


    sync_server.use(cors({origin: "*"}));

    io.on('connection', (sock) => {
      
      log.info(`${Object.keys(connectedSecondaries).length} socket(s) connected. New id : `, sock.id);
      // on signale l'initialisation de la communication descendante (entre le primary et le secondary)
      io.to(sock).emit('sync',{type:'syncinit'});

      // écouteur d'événement 'register' :
      // le secondary envoie son identité afin que le primary le stocke dans un objet
      sock.on('register', data => {
        log.info('secondary register', data);

        Object.defineProperty(connectedSecondaries, sock.id, {
          value: data,
          writable: false,
          enumerable: true,
          configurable: true
        });
      });

      sock.on('sync', (action)=>{
        
        log.info('sync', action);
     //   io.to(sock).emit('connect');
      })
    

      // à la déconnexion du secondary, on le supprime de l'objet de référence
      sock.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          sock.connect();
        } 
        // else the socket will automatically try to reconnect
        Object.entries(connectedSecondaries).forEach(([sockid, device]) => {
          // console.log("device", device)
          try {
            if (sockid == sock.id) {
              // console.log("socket", socket.id)
              delete connectedSecondaries[sockid];
            }
          } catch(error) {
            log.info('sync disconnect error', error.message);
          }
        })
      });



    });

    http.listen(SYNC_PORT, function(){
      log.info( `sync_server listening on *:${SYNC_PORT}` );
      res.send({msg:'primary waits for secondaries'});
    });

  },

  // émission de la synchro du primary en direction des secondaries
  syncDispatchToSecondaries: (req,res) => {
    const { db, data, emitter } = req.payload;

    // on envoie la synchro à tous les secondaries, 
    // sauf celui qui est à l'origine de la synchro
    Object.entries(connectedSecondaries).forEach(([sockid, secondary]) => {
      if (emitter!==secondary.id) io.to(sockid).emit('sync', req.payload);
    });

    log.info(`syncDispatchToSecondaries() [${db}] to ${Object.keys(connectedSecondaries).length} secondaries`);
    res.send({msg:`sync to ${Object.keys(connectedSecondaries).length} secondaries`});
  },

  syncDispatchToPrimary: (req,res) => {

    const { db, data, emitter, url } = req.payload;

    log.info('syncDispatchToPrimary', req.payload);

    const __request = net.request({
      url: url+':'+API_PORT+'/synchro',
      method: 'post'
    });
    // __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    
    __request.write(JSON.stringify({db, data, emitter}));

    __request.on('response', (response) => {

      log.info(`syncDispatchToPrimary() [${db}] to ${url}, status:`, response.statusCode);
      res.send({msg:`synchro ${db} to primary`});
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
