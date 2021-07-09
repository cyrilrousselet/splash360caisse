const { emit, setupFrontendListener, pendingRequests } = require("eiphop");

// const getPrefix = (level) => `[${level}]`;

// const getMsg = (level, msg, dump = {}) =>
// 	// `${getPrefix(level)} ${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${JSON.stringify(dump)}` : ''}`
// 	// `${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${JSON.stringify(dump)}` : ''}`
// 	`${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${Object.keys(dump).length}` : ''}`
// ;

const logger = require('Logger.js');

const log = {
	error: (msg, dump = {}) => logger.log('error', msg, dump),
	warn: (msg, dump = {}) => logger.log('warn', msg, dump),
	info: (msg, dump = {}) => logger.log('info', msg, dump),
	// error: (msg, dump = {}) => logger.log('error', getMsg(msg, dump)),
	// warn: (msg, dump = {}) => logger.log('warn', getMsg(msg, dump)),
	// info: (msg, dump = {}) => logger.log('info', getMsg(msg, dump)),
};

const isPromise = (obj) => {
	return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};



const eiphop = {
  emit: emit, 
  setupMainHandler: (electronModule, availableActions, enableLogs = false) => {
    enableLogs && log.info('Logs enabled !');
    electronModule.ipcMain.on('asyncRequest', (event, requestId, action, payload) => {
      enableLogs && log.info(`Got new request with id = ${requestId}, action = ${action}`, payload);
  
      const res = {
        notify: (message) => event.sender.send('asyncResponseNotify', requestId, message),
        send: (result) => event.sender.send('asyncResponse', requestId, result),
        error: (err) => event.sender.send('errorResponse', requestId, err)
      };
  
      const requestedAction = availableActions[action];
  
      if (!requestedAction) {
        const error = `Action "${action}" is not available. Did you forget to define it ?`;
        log.error(error);
        res.error({msg: error});
        return;
      }
  
      try {
        const promise = requestedAction({payload}, res);
  
        if (isPromise(promise)) {
          promise.catch((e) => {
            //error in async code
            log.error(e);
            res.error({error: e.toString()});
          })
        }
      } catch (e) {
        //error inside sync code
        log.error(e);
        res.error({error: e.toString()});
      }
    })
  }, 
  setupFrontendListener: setupFrontendListener, 
  pendingRequests : pendingRequests
};


// module.exports =  eiphop;