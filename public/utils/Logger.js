const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const electron = require('electron');

const { app } = electron;
// const path = require('path');
// const os = require('os');
const fs = require('fs');
const mkdirp = require('mkdirp')
const stringify = require('fast-safe-stringify');
const _ = require('lodash');

const checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}

checkDirectorySync(`${app.getPath('userData')}/logs`);

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(info => {
      const extra = stringify(
        _.omit(info, ['timestamp', 'level', 'message']),
        null,
        2,
      );
      return `${info.timestamp} ${info.level}: ${info.message} ${ (extra==='{}' ? '' : extra) }`;
  }),
);

const stderrTransport = new DailyRotateFile({
  dirname: `${app.getPath('userData')}/logs/`,
  filename: `stderr-%DATE%.log`,
  datePattern: 'YYDDDD',
  zippedArchive: true,
  maxSize: '20m',
  level: 'error'
});
const stdoutTransport = new DailyRotateFile({
  dirname: `${app.getPath('userData')}/logs/`,
  filename: `stdout-%DATE%.log`,
  datePattern: 'YYDDDD',
  zippedArchive: true,
  maxSize: '20m',
});

const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console(
      {
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      }
    ),
    stderrTransport,
    stdoutTransport,
  ],
});


// module.exports = logger;