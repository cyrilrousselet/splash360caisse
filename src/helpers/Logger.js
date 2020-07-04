import fs from 'fs';
import {remote} from 'electron';
import { Console } from 'console';
import mkdirp from 'mkdirp';
import {formatISO9075, format} from 'date-fns';
import util from 'util';

const {app} = remote;

const checkDirectorySync = (directory) => {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}

checkDirectorySync(`${app.getPath('userData')}/logs`);


const output = fs.createWriteStream(`${app.getPath('userData')}/logs/${format(new Date(),'yyDDD')}_stdout.log`, {flags : 'a'});
const errorOutput = fs.createWriteStream(`${app.getPath('userData')}/logs/${format(new Date(),'yyDDD')}_stderr.log`, {flags : 'a'});


class Logger {
  
    constructor() {

        this.cns = new Console(output, errorOutput);
    }

    log(...args) {
        console.log(util.format(...args));
        this.cns.log(formatISO9075(new Date()), '-', util.format(...args));
    }

    error(...args) {
        console.error(util.format(...args));
        this.cns.error(formatISO9075(new Date()), '-', util.format(...args));
    }
}

export default Logger;