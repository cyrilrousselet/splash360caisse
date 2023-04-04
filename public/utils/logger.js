const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, label, errors } = format;
require('winston-daily-rotate-file');

const { app } = require('electron');
const fs = require('fs');
const mkdirp = require('mkdirp')
const isDev = require('electron-is-dev');



const checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}

checkDirectorySync(`${app.getPath('userData')}/logs`);

let consoleOut = format.combine(
  errors({stack: true}),
  colorize({}),
  timestamp({
      format:"HH:MM:SS.SSS"
  }),
  label({label:'[MAIN]'}),
  printf(
      info => `${info.timestamp} ${info.label} >  ${info.level} : ${info.message}${(info.stack ? ' - '+info.stack : '')}`
  )
);
const fileOut = format.combine(
  errors({stack: true}),
  timestamp(),
  label({label:'[MAIN]'}),
  printf(
      info => `${info.timestamp} ${info.label} >  ${info.level} : ${info.message}${(info.stack ? ' - '+info.stack : '')}`
  )
);

const outTransport = new transports.DailyRotateFile({
  filename: '%DATE%-stdout.log',
  dirname: `${app.getPath('userData')}/logs`,
  datePattern: 'YYDDDD',
  zippedArchive: true,
  maxSize: '20m',
  format: fileOut
});

const errorTransport = new transports.DailyRotateFile({
  filename: '%DATE%-stderr.log',
  dirname: `${app.getPath('userData')}/logs`,
  datePattern: 'YYDDDD',
  zippedArchive: true,
  maxSize: '20m',

  level: 'error',
  format: fileOut
});




const logger = isDev 
? createLogger({
  transports: [
    outTransport,
    errorTransport
  ]
})
: createLogger()
;

// if (process.env.NODE_ENV !== 'production') {
if (isDev) {
  logger.add(new transports.Console({
    format: combine(colorize(), consoleOut)
  }));
}

module.exports = logger;