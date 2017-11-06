(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUGETSTATUS, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Sequence, Status,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUGETSTATUS = require('../FP/MSG2CUGETSTATUS');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = Status = (function(superClass) {
    extend(Status, superClass);

    function Status() {
      return Status.__super__.constructor.apply(this, arguments);
    }

    Status.prototype.run = function() {
      this.once('message', (function(_this) {
        return function(message) {
          return _this.onOpenService(message);
        };
      })(this));
      return this.sendOpenService(Message.SERVICE_STATUS);
    };

    Status.prototype.onOpenService = function(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log(message);
      }
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_STATUS) {
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onGetStatus(message);
          };
        })(this));
        if (process.env.DEBUG_BBS_STATUS === '1') {
          console.log('sendBBSStatusLight');
        }
        return this.sendBBSStatus();
      }
    };

    Status.prototype.onCloseService = function(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log('onCloseService', message, Message.SERVICE_STATUS);
      }
      return this.end();
    };

    Status.prototype.onGetStatus = function(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log('onGetStatus', message, Message.TYPE_BBS_GET_STATUS_RESPONSE);
      }
      if (message.type_of_message === Message.TYPE_BBS_GET_STATUS_RESPONSE) {
        this.message = message;
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onCloseService(message);
          };
        })(this));
        return this.sendCloseService();
      } else {

      }
    };

    Status.prototype.sendBBSStatus = function() {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUGETSTATUS;
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    };

    return Status;

  })(Sequence);

}).call(this);
