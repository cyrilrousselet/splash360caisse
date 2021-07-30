const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
require('winston-daily-rotate-file');

const { app } = require('electron');
const fs = require('fs');
const mkdirp = require('mkdirp')



const checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}

checkDirectorySync(`${app.getPath('userData')}/logs`);

let consoleOut = format.combine(
  colorize({
  }),
  timestamp({
      format:"HH:MM:SS.SSS"
  }),
  printf(
      info => `${info.timestamp}  >  ${info.level} : ${info.message}`
  )
);
const fileOut = format.combine(
  timestamp(),
  printf(
      info => `${info.timestamp}  >  ${info.level} : ${info.message}`
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




const logger = createLogger({
  transports: [
    outTransport,
    errorTransport
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(colorize(), consoleOut)
  }));
}

module.exports = logger;