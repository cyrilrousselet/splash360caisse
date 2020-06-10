const EventSource = require('eventsource');
const log = require('electron-log');
const {net} = require('electron');

// const externalUrls = require('../../src/constants/externalUrls.json');

let _webContents = null;


const sse = {
  init: (webContents) => {

    _webContents = webContents;

    log.info('sse.init()');

    // const es = new EventSource('http://api.splash360.fr:3030/.well-known/mercure?topic=819b4b71-bb93-4a91-9503-3c7af1e4e622');

    // es.onmessage = (evt) => {
    //   log.info('onmessage', evt);
    //   _webContents.send('getNotification', {data: evt.data});
    // }
    // es.onerror = (err) => {
    //   log.info('es.onerror', err);
    // }
  }
}


const actions = {

  sseInit: (req, res) => {

    if (_webContents==null) res.error({msg: 'SSE not initialized'});


    const { restaurant_id } = req.payload;

    log.info('sseInit', "http://api.splash360.fr:3030/.well-known/mercure?topic=" + restaurant_id);

    // const es = new EventSource('http://api.splash360.fr:3030/.well-known/mercure?topic=819b4b71-bb93-4a91-9503-3c7af1e4e622');
    const es = new EventSource("http://api.splash360.fr:3030/.well-known/mercure?topic=" + restaurant_id);

    es.onmessage = (evt) => {
      log.info('onmessage', evt);
      const data = JSON.parse(evt.data);
      _webContents.send('getNotification', {...data});
    }
    es.onerror = (err) => {
      log.info('es.onerror', err.message);
      res.send({msg: 'ca va pas'});
      es.close();
    }
    res.send({msg:'sse listening'});
  },


  getUberOrder: (req, res) => {

    const { url, access_token } = req.payload;

    let __order = [];

    const __request = net.request({
      url: url,
      method: 'get'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.on('response', (response) => {
      log.info(`STATUS: ${response.statusCode}`);
      log.info(`HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {

        __order.push(chunk);

        log.info(`BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('Plus de données reçues.')
        res.send({order: JSON.parse(__order.join(''))});
      });
    });

    __request.end();

  },

  acceptUberOrder: (req, res) => {

    const { url, access_token } = req.payload;

    var __acceptObject = {reason: 'Commande acceptée'};

    const __request = net.request({
      url: url,
      method: 'post'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify(__acceptObject));

    __request.on('response', (response) => {
      log.info(`STATUS: ${response.statusCode}`);
      log.info(`HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        log.info(`BODY: ${chunk}`)
        res.send({order: chunk});
      });
      response.on('end', () => {
        log.info('Plus de données reçues.')
      });
    });

    __request.end();

  },

  denyUberOrder: (req, res) => {

    const { url, access_token } = req.payload;

    var __denyObject = {reason:{explanation:'Erreur de commande'}};

    const __request = net.request({
      url: url,
      method: 'post'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify(__denyObject));

    __request.on('response', (response) => {
      log.info(`STATUS: ${response.statusCode}`);
      log.info(`HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        log.info(`BODY: ${chunk}`)
        res.send({order: chunk});
      });
      response.on('end', () => {
        log.info('Plus de données reçues.')
      });
    });

    __request.end();

  }
}


module.exports = {
  ...sse,
  ...actions
};