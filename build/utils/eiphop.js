const logger = require('./logger');


const getMsg = (msg, dump = {}) =>
	// `${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${JSON.stringify(dump)}` : ''}`
	`${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${JSON.stringify(dump, null, 2)}` : ''}`
;

const log = {
	error: (msg, dump = {}) => logger.error(getMsg(msg, dump)),
	warn: (msg, dump = {}) => logger.warn(getMsg(msg, dump)),
	info: (msg, dump = {}) => logger.info(getMsg(msg, dump)),
};

const isPromise = (obj) => {
	return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

const setupMainHandler = (electronModule, availableActions, enableLogs = false) => {
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
};




module.exports = {setupMainHandler};

