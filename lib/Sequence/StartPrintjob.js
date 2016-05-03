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
      return this.start_message.setJobId(val);
    };

    StartPrintjob.prototype.setCustomerId = function(val) {
      return this.start_message.setCustomerId(val);
    };

    StartPrintjob.prototype.setPrintDate = function(val) {
      return this.start_message.setPrintDate(val);
    };

    StartPrintjob.prototype.setDateAhead = function(val) {
      return this.start_message.setDateAhead(val);
    };

    StartPrintjob.prototype.setWeightMode = function(val) {
      return this.start_message.setWeightMode(val);
    };

    StartPrintjob.prototype.setPrintOffset = function(val) {
      return this.start_message.setPrintOffset(val);
    };

    StartPrintjob.prototype.setImageId = function(val) {
      return this.start_message.setImageId(val);
    };

    StartPrintjob.prototype.setPrintEndorsement = function(val) {
      return this.start_message.setPrintEndorsement(val);
    };

    StartPrintjob.prototype.setEndorsementID = function(val) {
      return this.start_message.setEndorsementID(val);
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

    StartPrintjob.prototype.setTownCircleID = function(val) {
      return this.start_message.setTownCircleID(val);
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
      return this.start_message = new MSG2CUSTARTPRINTJOB;
    };

    StartPrintjob.prototype.run = function() {
      this.once('message', (function(_this) {
        return function(message) {
          return _this.onOpenService(message);
        };
      })(this));
      return this.sendOpenService(Message.SERVICE_BBS_PRINTJOB);
    };

    StartPrintjob.prototype.onOpenService = function(message) {
      console.log('on onOpenService');
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_BBS_PRINTJOB) {
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onStartPrintJob(message);
          };
        })(this));
        return this.startPrintJob();
      } else {
        return this.unexpected(message);
      }
    };

    StartPrintjob.prototype.onCloseService = function(message) {
      console.log('on onCloseService');
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_BBS_PRINTJOB) {
        return this.end();
      } else {
        return this.unexpected(message);
      }
    };

    StartPrintjob.prototype.onStartPrintJob = function(message) {
      console.log('on onStartPrintJob');
      if (message.type_of_message === Message.TYPE_BBS_START_PRINTJOB) {
        this.message = message;
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onCloseService(message);
          };
        })(this));
        this.sendCloseService();
        return console.log('ok closing');
      } else if (message.type_of_message === Message.TYPE_ACK) {
        return this.sendCloseService();
      } else {
        return this.unexpected(message);
      }
    };

    StartPrintjob.prototype.startPrintJob = function() {
      var sendbuffer, sizemessage;
      sendbuffer = this.start_message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    };

    return StartPrintjob;

  })(Sequence);

}).call(this);
