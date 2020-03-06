const express = require('express');
const log = require('electron-log');

const server = {
  init: () => {
    const xpr = express();
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
