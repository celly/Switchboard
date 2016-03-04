var nconf = module.exports = require('nconf');

nconf.argv({
  'webPort': {
    alias: 'webPort',
    describe: 'port for http server to listen on'
  }, 
  'modemPort': {
    alias: 'modemPort',
    describe: 'port for modem'
  }, 
}).env().file({ file: './config.json' });
