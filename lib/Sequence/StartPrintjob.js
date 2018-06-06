(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2CUSTARTPRINTJOB, MSG2DCACK, Message, MessageWrapper, Sequence, StartPrintjob,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUSTARTPRINTJOB = require('../FP/MSG2CUSTARTPRINTJOB');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = StartPrintjob = (function(superClass) {
    extend(StartPrintjob, superClass);

    function StartPrintjob() {
      return StartPrintjob.__super__.constructor.apply(this, arguments);
    }

    StartPrintjob.prototype.setJobId = function(val) {
      return this.start_message.setJobId(parseInt(val));
    };

    StartPrintjob.prototype.setCustomerId = function(val) {
      return this.start_message.setCustomerId(parseInt(val));
    };

    StartPrintjob.prototype.setPrintDate = function(val) {
      return this.start_message.setPrintDate(parseInt(val));
    };

    StartPrintjob.prototype.setDateAhead = function(val) {
      return this.start_message.setDateAhead(parseInt(val));
    };

    StartPrintjob.prototype.setWeightMode = function(val) {
      return this.start_message.setWeightMode(parseInt(val));
    };

    StartPrintjob.prototype.setPrintOffset = function(val) {
      return this.start_message.setPrintOffset(parseInt(val));
    };

    StartPrintjob.prototype.setImageId = function(val) {
      return this.start_message.setImageId(parseInt(val));
    };

    StartPrintjob.prototype.setPrintEndorsement = function(val) {
      return this.start_message.setPrintEndorsement(parseInt(val));
    };

    StartPrintjob.prototype.setEndorsementID = function(val) {
      return this.start_message.setEndorsementID(parseInt(val));
    };

    StartPrintjob.prototype.setEndorsementText1 = function(val) {
      return this.start_message.setEndorsementText1(val);
    };

    StartPrintjob.prototype.setEndorsementText2 = function(val) {
      return this.start_message.setEndorsementText2(val);
    };

    StartPrintjob.prototype.setAdvert = function(val) {
      return this.start_message.setAdvert(val);
    };

    StartPrintjob.prototype.setAdvertHex = function(val) {
      var e, error;
      try {
        console.log('StartPrintjob setAdvertHex', val);
        return this.start_message.setAdvert(Buffer.from(val, 'base64'));
      } catch (error) {
        e = error;
        console.log('StartPrintjob setAdvertHex error', val);
        return this.start_message.setAdvert(new Buffer(val, 'base64'));
      }
    };

    StartPrintjob.prototype.setTownCircleID = function(val) {
      return this.start_message.setTownCircleID(parseInt(val));
    };

    StartPrintjob.prototype.setTownCircle = function(val) {
      return this.start_message.setTownCircle(val);
    };

    StartPrintjob.prototype.setCustomerNumber = function(val) {
      return this.start_message.setCustomerNumber(val);
    };

    StartPrintjob.prototype.setImprintChannelIP = function(val) {
      return this.start_message.setImprintChannelIP(val);
    };

    StartPrintjob.prototype.setImprintChannelPort = function(val) {
      return this.start_message.setImprintChannelPort(parseInt(val));
    };

    StartPrintjob.prototype.init = function() {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'init');
      }
      return this.start_message = new MSG2CUSTARTPRINTJOB;
    };

    StartPrintjob.prototype.run = function() {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'run');
      }
      this.once('message', (function(_this) {
        return function(message) {
          return _this.onOpenService(message);
        };
      })(this));
      return this.sendOpenService(Message.SERVICE_BBS_PRINTJOB);
    };

    StartPrintjob.prototype.onOpenService = function(message) {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'onOpenService', message);
      }
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_BBS_PRINTJOB) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'expected', message);
        }
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onStartPrintJob(message);
          };
        })(this));
        return this.startPrintJob();
      } else {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'unexpected', message);
        }
        return this.unexpected(message);
      }
    };

    StartPrintjob.prototype.onCloseService = function(message) {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'onCloseService', message);
      }
      if (message.type_of_message === Message.TYPE_ACK) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'expected', message);
        }
        return this.end();
      } else {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'unexpected', message);
        }
        return this.unexpected(message);
      }
    };

    StartPrintjob.prototype.onStartPrintJob = function(message) {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'onStartPrintJob', message);
      }
      if (message.type_of_message === Message.TYPE_BBS_START_PRINTJOB) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'TYPE_BBS_START_PRINTJOB', message);
          console.log('TYPE_BBS_START_PRINTJOB');
        }
        this.message = message;
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onCloseService(message);
          };
        })(this));
        this.sendCloseService();
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          return console.log('ok closing');
        }
      } else if (message.type_of_message === Message.TYPE_ACK) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'TYPE_ACK', message);
          console.log('TYPE_ACK');
        }
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onCloseService(message);
          };
        })(this));
        return this.sendCloseService();
      } else {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'something went wrong', message.type_of_message);
        }
        return this.unexpected(message);
      }
    };

    StartPrintjob.prototype.startPrintJob = function() {
      var sendbuffer, sizemessage;
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log("start message>", this.start_message);
      }
      sendbuffer = this.start_message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log("sizemessage> ", sizemessage.getBuffer().toString('hex'));
      }
      this.client.write(sizemessage.getBuffer());
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log("sendbuffer> ", sendbuffer.toString('hex'));
        console.log("image> ", this.start_message.advert.toString('hex'));
        console.log("image> ", this.start_message.advert.toString('base64'));
      }
      return this.client.write(sendbuffer);
    };

    return StartPrintjob;

  })(Sequence);

}).call(this);
