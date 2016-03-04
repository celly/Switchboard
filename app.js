var config = require('./config')
  , log = require("bunyan").createLogger({name: config.get('serverName')})
  , callHandler = require('./libs/callhandler')
  , modemListener = require('./libs/modemlistener')
  , compress = require('compression')
  , express = require('express')
  , app = express()
  , Datastore = require('nedb')
  , dbtoexpress = require("db-to-express-rest")
;

app.set('query parser', 'simple');
app.set('x-powered-by', false);
app.use(compress());

app.use(function(req, res, next) {
  req.startTime = process.hrtime();
  res.set('server', config.get('serverName'));
  //log.info({ req: req }, 'Received request');
  return next();
});

// Setup DB's
db = {};
db.callers = new Datastore({ filename: 'db/callersInfo.db'});
db.callHistory = new Datastore({ filename: 'db/callHistory.db'});
db.allowList = new Datastore({ filename: 'db/allowList.db'});
db.denyList = new Datastore({ filename: 'db/denyList.db'});

// Load DB's and set api endpoints.
// Note: Using autoload breaks api endpoints.
db.callers.loadDatabase(function (err) {
  if (err) { log.warn(err); }
  app.use("/api", dbtoexpress("callers"));
});

db.callHistory.loadDatabase(function (err) {
  if (err) { log.warn(err); }
  app.use("/api", dbtoexpress("callHistory"));
});

db.allowList.loadDatabase(function (err) {
  if (err) { log.warn(err); }
  app.use("/api", dbtoexpress("allowList"));
});

db.denyList.loadDatabase(function (err) {
  if (err) { log.warn(err); }
  app.use("/api", dbtoexpress("denyList"));
});

app.use('/', express.static(__dirname + '/public'));

var server = app.listen(config.get('webPort'));
