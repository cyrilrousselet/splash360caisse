// import fs from 'fs';
// import {remote} from 'electron';
// import { Console } from 'console';
// import mkdirp from 'mkdirp';
// import {formatISO9075, format} from 'date-fns';
// import util from 'util';
// import isDev from 'electron-is-dev';

// const {app} = remote;

// const checkDirectorySync = (directory) => {  
//   try {
//     fs.statSync(directory);
//   } catch(e) {
//     mkdirp.sync(directory);
//   }
// }

// checkDirectorySync(`${app.getPath('userData')}/logs`);


// const output = fs.createWriteStream(`${app.getPath('userData')}/logs/${format(new Date(),'yyDDD')}_stdout.log`, {flags : 'a'});
// const errorOutput = fs.createWriteStream(`${app.getPath('userData')}/logs/${format(new Date(),'yyDDD')}_stderr.log`, {flags : 'a'});


// class Logger {
  
//     constructor() {
//         this.cns = new Console(output, errorOutput);
//     }

//     log(...args) {
    
//     //  let logLineDetails = ((new Error().stack).split("at ")[3]).trim();
//       let logLineDetails = '';
//      //  let logLineDetails = this.log.caller;
//     //  console.log(util.format(...args));
//       console.groupCollapsed(util.format(...args));
//       console.trace(util.format(...args));
//       console.groupEnd();
//       if (isDev) this.cns.log(formatISO9075(new Date()), logLineDetails+' -', util.format(...args));
//     }
    
//     error(...args) {
//       // let logLineDetails = ((new Error().stack).split("at ")[3]).trim();
//       let logLineDetails = '';
//       console.error(logLineDetails, util.format(...args));
//       if (isDev) this.cns.error(formatISO9075(new Date()), logLineDetails+' -', util.format(...args));
//     }

//     time(testname='') {
//       console.time(testname);
//       if (isDev) this.cns.time(testname);
//     }
//     timeEnd(testname='') {
//       console.timeEnd(testname);
//       if (isDev) this.cns.timeEnd(testname);
//     }
// }





import { loggers, format, transports } from 'winston';
import 'winston-daily-rotate-file';
// import {getStore} from '../index.js';
import { configureStore } from '../store/configureStore';


import fs from 'fs';
import {remote} from 'electron';
import mkdirp from 'mkdirp';
import { LEVEL, MESSAGE }  from 'triple-beam';
import { journalActions } from '../services/journal/journalActions.js';


const {app} = remote;
const { combine, timestamp, printf, colorize, label } = format;

const {store} = configureStore();

const LEVELS = [ 
  "error", 
  "warn",
  "help",
  "data",
  "info",
  "debug",
  "prompt",
  "verbose",
  "input",
  "silly"
];

const checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}

checkDirectorySync(`${app.getPath('userData')}/logs`);
checkDirectorySync(`${app.getPath('userData')}/compta`);


// const errorStackTracerFormat = format(info => {
//   console.log('info.meta', info.meta);
//   if (info.meta && info.meta instanceof Error) {
//       info.message = `${info.message} ${info.meta.stack}`;
//   }
//   return info;
// });


/*
 * function errors (info)
 * If the `message` property of the `info` object is an instance of `Error`,
 * replace the `Error` object its own `message` property.
 *
 * Optionally, the Error's `stack` property can also be appended to the `info` object.
 */
const errors = format((einfo, { stack }) => {
  if (einfo instanceof Error) {
    const info = Object.assign({}, einfo, {
      level: einfo.level,
      [LEVEL]: einfo[LEVEL] || einfo.level,
      message: einfo.message,
      [MESSAGE]: einfo[MESSAGE] || einfo.message
    });

    if (stack) info.stack = einfo.stack;
    return info;
  }

  if (!(einfo.message instanceof Error)) return einfo;

  // Assign all enumerable properties and the
  // message property from the error provided.
  Object.assign(einfo, einfo.message);
  const err = einfo.message;
  einfo.message = err.message;
  einfo[MESSAGE] = err.message;

  // Assign the stack if requested.
  if (stack) einfo.stack = err.stack;
  return einfo;
});


// const getStack = format(info=>{
//   // const stack = stackTrace.get();
//   let __o = {};
//   Error.captureStackTrace(__o);
//   const __tr = __o.stack;

//   let formattedTrace = '\nStack:\n |  '+__tr;
//   // let formattedTrace = '\nStack:\n |  '+__tr[0].properties;
//   // let formattedTrace = '\nStack:\n |  '+__tr.map(t=>t.toString()).filter(s=>!s.includes('__webpack_require__')).join('\n |  ');

//   info.stack = formattedTrace;
//   return info;
// });


let consoleOut = format.combine(
  errors({stack: true}),
  colorize({
  }),
  timestamp({
      format:"HH:MM:SS.SSS"
  }),
  label({label:'[REND.]'}),
  // getStack(),
  printf(
      info => `${info.timestamp} ${info.label} >  ${info.level} : ${info.message}${(info.stack ? ' - '+info.stack : '')}`
  )
);
const fileOut = format.combine(
  errors({stack: true}),
  timestamp(),
  label({label:'[REND.]'}),
  // getStack(),
  printf(
      info => `${info.timestamp} ${info.label} >  ${info.level} : ${info.message}${(info.stack ? ' - '+info.stack : '')}`
  )
);

const outTransport = new transports.DailyRotateFile({
  filename: '%DATE%-stdout.log',
  dirname: `${app.getPath('userData')}/logs`,
  datePattern: 'YYDDD',
  zippedArchive: true,
  maxSize: '20m',
  format: fileOut
});

const errorTransport = new transports.DailyRotateFile({
  filename: '%DATE%-stderr.log',
  dirname: `${app.getPath('userData')}/logs`,
  datePattern: 'YYDDD',
  zippedArchive: true,
  maxSize: '20m',
  level: 'error',
  format: fileOut
});


const paTransport = new transports.DailyRotateFile({
  filename: '%DATE%-pistedaudit.json',
  dirname: `${app.getPath('userData')}/compta`,
  datePattern: 'YYDDD',
  zippedArchive: true,
  maxSize: '20m',
  level: 'info',
  format: format.json()
});

paTransport.on('rotate', (oldFilename, newFilename) => {
  console.log('🔄 ROTATION PA :', oldFilename, newFilename);
  store.dispatch(journalActions.sign(oldFilename, 'pa'));
});

paTransport.on('new', (newFilename) => {
  console.log('📃 NEW PA :', newFilename);
  store.dispatch(journalActions.signPrevious('pa'));
});

const jetTransport = new transports.DailyRotateFile({
  filename: '%DATE%-jet.json',
  dirname: `${app.getPath('userData')}/compta`,
  datePattern: 'YYDDD',
  zippedArchive: true,
  maxSize: '20m',
  level: 'info',
  format: format.json()
});

jetTransport.on('rotate', (oldFilename, newFilename) => {
  console.log('🔄 ROTATION JET :', oldFilename, newFilename);
  store.dispatch(journalActions.sign(oldFilename, 'jet'));
});

jetTransport.on('new', (newFilename) => {
  console.log('📃 NEW JET :', newFilename);
  store.dispatch(journalActions.signPrevious('jet'));
});

loggers.add('winstonlogger', {
  transports: [
    outTransport,
    errorTransport
  ]
});
loggers.add('pa', {
  transports: [
    paTransport
  ]
});
loggers.add('jet', {
  transports: [
    jetTransport
  ]
});

const winstonlogger = loggers.get('winstonlogger');
const pa = loggers.get('pa');
const jet = loggers.get('jet');


if (process.env.NODE_ENV !== 'production') {
  winstonlogger.add(new transports.Console({
    format: combine(colorize(), consoleOut)
  }));
}

const logger = {
  log: (...args) => {
    if (!LEVELS.includes(String(args[0]).toLowerCase())) {
      winstonlogger.log('info', ...args);  
    } else { 
      winstonlogger.log(...args);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.trace(...args);
    }
  },
  info:  (...args) => { 
   
    winstonlogger.info(JSON.stringify([...args], null, 2));  
    if (process.env.NODE_ENV !== 'production') {
      console.trace(...args);
    }
  },
  warn:  (...args) => { 
    winstonlogger.warn(JSON.stringify(...args, null, 2));
    if (process.env.NODE_ENV !== 'production') {
      console.trace(...args);
    }
  },
  error: (...args) => { 
    winstonlogger.error(...args);
    if (process.env.NODE_ENV !== 'production') {
      console.trace(...args);
    }
  },
  profile: (...args) => { winstonlogger.profile(...args) },
  startTimer: (...args) => { winstonlogger.startTimer(...args) },
  done: (...args) => { winstonlogger.done(...args) },
  winston: () => winstonlogger,
  dump: (msg, ...args) => {
    winstonlogger.info(msg+' => '+JSON.stringify(...args, null, 2));
  },
  pa: (evt, ...args) => { pa.log('info', evt) },
  jet: (evt, ...args) => { jet.log('info', evt) },
  pasign: (sign, ...args) => { pa.log('info', sign)},
  jetsign: (sign, ...args) => { jet.log('info', sign)},
}


export default logger;