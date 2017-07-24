(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2CUSTOPPRINTJOB, MSG2DCACK, Message, MessageWrapper, Sequence, StopPrintjob,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUSTOPPRINTJOB = require('../FP/MSG2CUSTOPPRINTJOB');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = StopPrintjob = (function(superClass) {
    extend(StopPrintjob, superClass);

    function StopPrintjob() {
      return StopPrintjob.__super__.constructor.apply(this, arguments);
    }

    StopPrintjob.prototype.run = function() {
      this.stop_message = new MSG2CUSTOPPRINTJOB;
      this.once('message', (function(_this) {
        return function(message) {
          return _this.onOpenService(message);
        };
      })(this));
      return this.sendOpenService(Message.SERVICE_BBS_PRINTJOB);
    };

    StopPrintjob.prototype.onOpenService = function(message) {
      console.log('MSG2CUSTOPPRINTJOB', 'onOpenService', message.type_of_message, message.serviceID);
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_BBS_PRINTJOB) {
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onStopPrintJob(message);
          };
        })(this));
        return this.stopPrintJob();
      } else {
        return this.unexpected(message);
      }
    };

    StopPrintjob.prototype.onCloseService = function(message) {
      console.log('MSG2CUSTOPPRINTJOB', 'onCloseService', message.type_of_message);
      if (message.type_of_message === Message.TYPE_ACK) {
        return this.end();
      }
    };

    StopPrintjob.prototype.onStopPrintJob = function(message) {
      console.log('MSG2CUSTOPPRINTJOB', 'onStopPrintJob', message, 'Message.TYPE_BBS_STOP_PRINTJOB', Message.TYPE_BBS_STOP_PRINTJOB);
      this.message = message;
      this.once('message', (function(_this) {
        return function(message) {
          return _this.onCloseService(message);
        };
      })(this));
      return this.sendCloseService();
    };

    StopPrintjob.prototype.stopPrintJob = function() {
      var sendbuffer, sizemessage;
      console.log('MSG2CUSTOPPRINTJOB', 'stopPrintJob');
      sendbuffer = this.stop_message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    };

    return StopPrintjob;

  })(Sequence);

}).call(this);
