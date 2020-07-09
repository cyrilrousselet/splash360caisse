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
    
    //  let logLineDetails = ((new Error().stack).split("at ")[3]).trim();
     let logLineDetails = '';
     //  let logLineDetails = this.log.caller;
    //  console.log(logLineDetails, util.format(...args));
     console.trace(util.format(...args));
     this.cns.log(formatISO9075(new Date()), logLineDetails+' -', util.format(...args));
    }
    
    error(...args) {
      // let logLineDetails = ((new Error().stack).split("at ")[3]).trim();
      let logLineDetails = '';
      console.error(logLineDetails, util.format(...args));
      this.cns.error(formatISO9075(new Date()), logLineDetails+' -', util.format(...args));
    }
}

export default Logger;