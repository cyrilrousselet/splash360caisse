const express = require('express');
const log = require('electron-log');
const cors = require('cors');


const allowedOrigins = [
  'http://127.0.0.1',
  'http://localhost',
  'http://192.168.1.185'
  //'*'
];

const server = {
  init: () => {
    const xpr = express();

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
    xpr.post('/setcommande', (req,res) => {
      log.info('POST : '+req.body.data);
      let __d = new Date();
      res.json({status:'success', commandeid: 'c'+__d.getTime().toString()});
    });
    xpr.listen(3300, () => {
      log.info('server écoute le port 3300');
    })
  }
}

module.exports = server;
