//Load and initialize the database with callhistory and caller names
var config = require('../config')
  , log = require("bunyan").createLogger({name: config.get('serverName')})
  , Datastore = require('nedb')
  , modemListener = require('../libs/modemlistener')
;

//Make certain functions available for the rest of the program
module.exports = {
  setCaller: function (phoneNumber, name){
    setCaller(phoneNumber, name);
  },
  addCallerToHistory: function(phoneNumber){
    addCallerToHistory(phoneNumber);
  },
  verifyPhone: function(phoneNumber){
    verifyPhone(phoneNumber);
  }
};

//Main function for handling incoming calls.
function receiveCall(phoneNumber){
  addCallerToHistory(phoneNumber);
}

//Add a caller to the history of recently called
function addCallerToHistory(phoneNumber, name, action){
  var currentTime = new Date().getTime();
  var doc = { _id: currentTime
            ,  phoneNumber: phoneNumber
            ,  name: name
            ,  action: action
      };
    db.callHistory.insert(doc);
}

//Return the call history, with limit on amount of returned records sorted on newest first.
function verifyPhone(phoneNumber){
  log.error('TODO: Phone verify');
}

//Insert a name for a number
function setCaller(phoneNumber, name){

  log.warn('Checking caller '+name+' with phone '+phoneNumber);
  var currentTime = new Date().getTime();

  db.callers.find({_id: phoneNumber}).exec(function (err, doc) {
    log.warn('Caller '+name+' with phone '+phoneNumber+' is new. Adding now.');

    var numberOfResults = doc.length;
    if (numberOfResults == 0) {

      var caller = { _id: phoneNumber, name: name, status: null, calls: [currentTime] };
      db.callers.insert(caller, function (err, newDoc) {
        if (err) { log.error(err) };
      });
    } else {
      // update call log
      log.warn('Caller '+name+' with phone '+phoneNumber+' Has called before. Checking access and updating logs.');
      db.callers.update({ _id: phoneNumber }, { $push: { calls: currentTime } }) //, {}, function () {

      // Figure out what to do.
      switch (doc[0].status) {
        case 'deny':
          modemListener.hangTheFuckUp();
          addCallerToHistory(phoneNumber, name, 'deny');
          break;

        case 'allow':
          log.warn('Caller '+name+' with phone '+phoneNumber+' marked as allow. ');
          addCallerToHistory(phoneNumber, name, 'allow');
          break;

        default:
          verifyPhone(phoneNumber);
          addCallerToHistory(phoneNumber, name, 'verify');
          break;
      }
    }
  });
}

