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





import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';


import fs from 'fs';
import {remote} from 'electron';
import mkdirp from 'mkdirp';
import { LEVEL, MESSAGE }  from 'triple-beam';

const {app} = remote;
const { combine, timestamp, printf, colorize, label } = format;

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





let consoleOut = format.combine(
  errors({stack: true}),
  colorize({
  }),
  timestamp({
      format:"HH:MM:SS.SSS"
  }),
  label({label:'[REND.]'}),
  printf(
      info => `${info.timestamp} ${info.label} >  ${info.level} : ${info.message}${(info.stack ? ' - '+info.stack : '')}`
  )
);
const fileOut = format.combine(
  errors({stack: true}),
  timestamp(),
  label({label:'[REND.]'}),
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




const winstonlogger = createLogger({
  transports: [
    outTransport,
    errorTransport
  ]
});


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
  },
  info:  (...args) => { winstonlogger.info(...args)  },
  warn:  (...args) => { winstonlogger.warn(...args)  },
  error: (...args) => { winstonlogger.error(...args) },
  profile: (...args) => { winstonlogger.profile(...args) },
  startTimer: (...args) => { winstonlogger.startTimer(...args) },
  done: (...args) => { winstonlogger.done(...args) },
  winston: () => winstonlogger,
}


export default logger;