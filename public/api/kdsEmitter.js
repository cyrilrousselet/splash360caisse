
const cors = require('cors');
const {net} = require('electron');
const log = require('electron-log');
const e = require('express');


const KDS_PORT = 3330;

const actions = {
  setOrderToKDS: (req, res) => {
    
    const { order, url } = req.payload;
    log.info('setOrderToKDS()', order);
    

    const __request = net.request({
      url: url+':'+KDS_PORT+'/setordertokds',
      method: 'post'
    });

    __request.setHeader('Access-Control-Allow-Origin', '*')
    __request.setHeader('Content-Type', 'application/json');

    
    __request.write(JSON.stringify({order}));

    __request.on('response', (response) => {

      log.info(`setordertokds to ${url}, status:`, response.statusCode);
      res.send({msg: `set order ${order.id} in KDS`});
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

    __request.on('error', (error) => {
      log.error(error);
    })

    __request.end();
  }
};



    
module.exports = {
  ...actions
};

