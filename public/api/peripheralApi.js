const log = require('electron-log');
const escpos = require('escpos');



const actions = {

  printTest: (req,res) => {
    const device = new escpos.USB();
    const options = {};
    const printer = new escpos.Printer(device, options);

    const { payload } = req;
    const msg = payload.msg!=='' ? payload.msg : 'rien';

    log.debug('printTest start');
    
    device.open(function() {
      printer
      .font('A')
      .align('CT')
      .size(1,1)
      .text('Test impression')
      .text('Pour tester, quoi !')
      .text('-> '+msg+' <-')
      .cut()
      .close()
    });

    log.debug('printTest end');

    res.send({msg: 'test printed'});
  }
}

module.exports = actions;