var config = require('../config')
  , log = require("bunyan").createLogger({name: config.get('serverName')})
  , serialport = require("serialport")
  , callHandler = require('../libs/callhandler')
  , sp = new serialport.SerialPort(config.get('modemPort'), { parser: serialport.parsers.readline("\n") });

//Actively listen to the in app.js configured port.
var phoneNumber = false;
var name = false;

sp.on("open", function () {
  var callHandler = require('../libs/callhandler');

  log.info("Listening to modem on port: " + config.get('modemPort'));

  sp.write("AT+VCID=1\r", function(err, results) {
      sp.drain(console.log('Enabling CallerId nice format: ' + results));
  });

  //Respond to data received from modem
  sp.on('data', function(data) {
    log.info('Modem Says: ' + data);

    // If a ring is let thru, reset name/phone.
    if(data.indexOf("RING") > -1) {
      phoneNumber = false;
      name = false;
    }

    if(data.indexOf("NMBR =") > -1) {
      phoneNumber = data.replace(/\D/g,'');
      log.info('Callers number: ' + phoneNumber);
    }

    if(data.indexOf("NAME =") > -1) {
      name = data.replace('NAME =','');
      log.info('Callers name: ' + name);
    }

    if (phoneNumber && name) {
      // set the caller
      callHandler.setCaller(phoneNumber, name);

      // Reset the trigger variables.
      phoneNumber = false;
      name = false;
    }
  });
});

//Make listPorts function available to other parts of the program.
module.exports = {
  hangTheFuckUp: function() {
    hangTheFuckUp();
  }
};

function hangTheFuckUp() {
  log.warn('Caller marked as DENY. Hanging up on caller.');
  sp.write("ATH1\r", function(err, results) {
    setTimeout(function() { sp.write("ATH0\r") }, 1000);
  });
}
