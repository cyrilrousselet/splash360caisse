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
      log.info(`getUberOrder STATUS: ${response.statusCode}`);
      log.info(`getUberOrder HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {

        __order.push(chunk);

        log.info(`getUberOrder BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('getUberOrder: end')
        res.send({order: JSON.parse(__order.join(''))});
      });
    });

    __request.end();

  },

  acceptUberOrder: (req, res) => {

    const { url, access_token } = req.payload;

    var __acceptObject = {reason: 'Commande acceptée'};

    let __confirmation = [];

    const __request = net.request({
      url: url,
      method: 'post'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify(__acceptObject));

    __request.on('response', (response) => {
      log.info(`acceptUberOrder STATUS: ${response.statusCode}`);
      log.info(`acceptUberOrder HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        __confirmation.push(chunk);
        log.info(`acceptUberOrder BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('acceptUberOrder: end');
        // res.send({confirm: JSON.parse(__confirmation.join(''))});
        res.send({confirm: true});
      });
    });

    __request.end();

  },

  updateUberPOS: (req, res) => {

    const { url, access_token, integration } = req.payload;

    var __updateObject = {
      pos_integration_enabled: integration,
      order_release_enabled: true
    };

    let __confirmation = [];

    const __request = net.request({
      url: url,
      method: 'patch'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify(__updateObject));

    __request.on('response', (response) => {
      log.info(`updateUberPOS STATUS: ${response.statusCode}`);
      log.info(`updateUberPOS HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        __confirmation.push(chunk);
        log.info(`updateUberPOS BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('updateUberPOS: end');
        // res.send({confirm: JSON.parse(__confirmation.join(''))});
        res.send({confirm: true});
      });
    });

    __request.end();

  },

  denyUberOrder: (req, res) => {

    const { url, access_token } = req.payload;

    var __denyObject = {reason:{explanation:'Erreur de commande'}};

    let __confirmation = [];

    const __request = net.request({
      url: url,
      method: 'post'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify(__denyObject));

    __request.on('response', (response) => {
      log.info(`denyUberOrder STATUS: ${response.statusCode}`);
      log.info(`denyUberOrder HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        log.info(`denyUberOrder BODY: ${chunk}`)
        __confirmation.push(chunk);
      });
      response.on('end', () => {
        log.info('denyUberOrder: end')
        // res.send({confirm: JSON.parse(__confirmation.join(''))});
        res.send({confirm: true});
      });
    });

    __request.end();

  },

  getSplashToken: (req,res) => {

    const {params} = req.payload;

    let __confirmation = [];

    const __request = net.request({
      url: params,
      method: 'get'
    });
  //  __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.on('response', (response) => {
      log.info(`getSplashToken STATUS: ${response.statusCode}`);
      log.info(`getSplashToken HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        __confirmation.push(chunk);
        log.info(`getSplashToken BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('getSplashToken: end');
        res.send({splash_token: JSON.parse(__confirmation.join(''))});
        // res.send({confirm: true});
      });
    });

    __request.end();

  },

  getDatabase: (req,res) => {

    const {url, access_token} = req.payload;

    let __database = [];

    const __request = net.request({
      url: url,
      method: 'get'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.on('response', (response) => {
      log.info(`getDatabase STATUS: ${response.statusCode}`);
      log.info(`getDatabase HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        __database.push(chunk);
        log.info(`getDatabase BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('getDatabase: end');
        res.send({database: JSON.parse(__database.join(''))});
        // res.send({confirm: true});
      });
    });

    __request.end();

  },

  syncCommandesBO: (req,res) => {
    const { url, access_token, commandes } = req.payload;

    let __syncedCommandes = [];

    const __request = net.request({
      url: url,
      method: 'post'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify({commandes:commandes}));

    __request.on('response', (response) => {
      response.on('data', (chunk) => {
        __syncedCommandes.push(chunk);
        log.info(`syncCommandesBO BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('syncCommandesBO: end');
        res.send({confirm: JSON.parse(__syncedCommandes.join(''))});
        // res.send({confirm: true});
      });
    });

    __request.end();

  },


  syncCloturesBO: (req,res) => {
    const { url, access_token, clotures } = req.payload;

    let __syncedClotures = [];

    const __request = net.request({
      url: url,
      method: 'post'
    });
    __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    __request.write(JSON.stringify({clotures:clotures}));

    __request.on('response', (response) => {
      response.on('data', (chunk) => {
        __syncedClotures.push(chunk);
        log.info(`syncCloturesBO BODY: ${chunk}`)
      });
      response.on('end', () => {
        log.info('syncCloturesBO: end');
        res.send({confirm: JSON.parse(__syncedClotures.join(''))});
        // res.send({confirm: true});
      });
    });

    __request.end();

  }


}



module.exports = {
  ...sse,
  ...actions
};