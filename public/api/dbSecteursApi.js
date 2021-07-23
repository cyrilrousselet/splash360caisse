const db = require('../db.js');
const log = require('electron-log');


const actions = {
  dbSecteursGetAll: async (req,res) => {
    // const {payload} = req;
    log.info("dbSecteursGetAll() in API");
    
    const proxies = await _getAllZip();
      
    res.send(proxies);
  },

  dbSecteursFindZip: async (req, res) => {

    const {payload} = req;
    log.info("dbSecteursFindZip("+payload+") in API");
    const proxies = await _findZip(payload);
    log.info("dbSecteursFindZip", proxies);
    res.send(proxies);
  }

}



async function _getAllZip() {
  
  const __rawdata = await _findZip();
  return _parseZip(__rawdata);
}


/**
 * Get clients data from DB
 */
async function _findZip(criteriae={}) {
  log.info(criteriae);
  let _sct = [];
  if (criteriae!=={}) {

    if (criteriae.hasOwnProperty('zip')) {
      
      _sct = await (await db.secteurs).get('secteurs')
                                      .filter(sct => {
                                       return sct.zip.toString().includes(criteriae.zip);
                                      })
                                      .value();
    }
    else if (criteriae.hasOwnProperty('nom')) {
    
      _sct = await (await db.secteurs).get('secteurs')
                                      .filter(sct => {
                                        return sct.nom.includes(criteriae.nom) || sct.ligne5.includes(criteriae.nom);
                                      })
                                      .value();
    }

  } else {
    _sct = await (await db.secteurs).get('secteurs')
                                   .value();
  }
  return { secteurs: _sct };
}

function _parseZip(_rawdata) {
  // let __pointages = {};
  // _rawdata._pnt.forEach(p => {
  //   __pointages[p.pointage_id] = p;
  // });

  // return {pointageslist: __pointages};
  return {secteurslist: _rawdata._sct};
}


module.exports = actions;