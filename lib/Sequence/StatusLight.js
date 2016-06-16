(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUGETSTATUSLIGHT, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Sequence, StatusLight,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUGETSTATUSLIGHT = require('../FP/MSG2CUGETSTATUSLIGHT');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = StatusLight = (function(superClass) {
    extend(StatusLight, superClass);

    function StatusLight() {
      return StatusLight.__super__.constructor.apply(this, arguments);
    }

    StatusLight.prototype.run = function() {
      this.once('message', (function(_this) {
        return function(message) {
          return _this.onOpenService(message);
        };
      })(this));
      return this.sendOpenService(Message.SERVICE_STATUS_LIGHT);
    };

    StatusLight.prototype.onOpenService = function(message) {
      console.log(message);
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_STATUS_LIGHT) {
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onGetStatusLight(message);
          };
        })(this));
        console.log('sendBBSStatusLight');
        return this.sendBBSStatusLight();
      }
    };

    StatusLight.prototype.onCloseService = function(message) {
      console.log('onCloseService', message, Message.SERVICE_STATUS_LIGHT);
      return this.end();
    };

    StatusLight.prototype.onGetStatusLight = function(message) {
      console.log('onGetStatusLight', message, Message.TYPE_BBS_RETURN_STATUS_LIGHT);
      if (message.type_of_message === Message.TYPE_BBS_RETURN_STATUS_LIGHT) {
        this.message = message;
        this.once('message', (function(_this) {
          return function(message) {
            return _this.onCloseService(message);
          };
        })(this));
        return this.sendCloseService();
      }
    };

    StatusLight.prototype.sendBBSStatusLight = function() {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUGETSTATUSLIGHT;
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    };

    return StatusLight;

  })(Sequence);

}).call(this);
