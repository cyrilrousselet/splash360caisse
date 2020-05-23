const EventSource = require('eventsource');
const log = require('electron-log');

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
      webContents.send('getNotification', {data: evt.data});
    }
    es.onerror = (err) => {
      log.info('es.onerror', err.message);
      res.send({msg: 'ca va pas'});
      es.close();
    }
    res.send({msg:'sse listening'});
  }
}


module.exports = {
  ...sse,
  ...actions
};