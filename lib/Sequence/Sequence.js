(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Sequence,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  module.exports = Sequence = (function(superClass) {
    extend(Sequence, superClass);

    function Sequence(socket) {
      this.client = socket;
      this.client.closeEventName = 'expected';
      this.client.on('data', (function(_this) {
        return function(data) {
          return _this.onData(data);
        };
      })(this));
      this.message = null;
    }

    Sequence.prototype.run = function() {};

    Sequence.prototype.end = function() {
      this.client.removeListener('data', this.onData);
      this.client.closeEventName = 'expected';
      return this.emit('end', this.message);
    };

    Sequence.prototype.unexpected = function(message) {
      console.log('unexpected message', message);
      this.client.removeListener('data', this.onData);
      return this.emit('unexpected', message);
    };

    Sequence.prototype.onData = function(data) {
      var message;
      console.log("< ", data);
      message = MessageWrapper.getMessageObject(data);
      if (message === -1) {
        return;
      }
      return this.emit('message', message);
    };

    Sequence.prototype.sendCloseService = function() {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUCLOSESERVICE;
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      this.client.write(sendbuffer);
      return this.client.end();
    };

    Sequence.prototype.sendOpenService = function(type) {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUOPENSERVICE;
      message.setServiceID(type);
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE;
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    };

    return Sequence;

  })(EventEmitter);

}).call(this);
