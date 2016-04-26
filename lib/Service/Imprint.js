(function() {
  var EventEmitter, Imprint, MSG2DCACK, MSG2HSNEXTIMPRINT, Message, MessageBuffer, Server,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message').Message;

  MessageBuffer = require('../FP/MessageBuffer').MessageBuffer;

  MSG2HSNEXTIMPRINT = require('../FP/MSG2HSNEXTIMPRINT').MSG2HSNEXTIMPRINT;

  MSG2DCACK = require('../FP/MSG2DCACK').MSG2DCACK;

  Server = require('net').Server;

  module.exports = Imprint = (function(superClass) {
    extend(Imprint, superClass);

    function Imprint() {
      this.timeout = 60000;
      this.port = 4445;
      this.server = null;
      this.client = null;
    }

    Imprint.prototype.setPort = function(val) {
      return this.port = val;
    };

    Imprint.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Imprint.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Imprint.prototype.open = function() {
      var options;
      if (this.server === null) {
        options = {
          allowHalfOpen: false,
          pauseOnConnect: false
        };
        this.server = net.createServer(options, (function(_this) {
          return function(client) {
            return _this.onClientConnect(client);
          };
        })(this));
        this.server.on('error', (function(_this) {
          return function(err) {
            return _this.onServerError(err);
          };
        })(this));
        this.server.on('close', (function(_this) {
          return function() {
            return _this.onServerClose();
          };
        })(this));
        return this.server.listen(this.port, (function(_this) {
          return function() {
            return _this.onServerBound();
          };
        })(this));
      }
    };

    Imprint.prototype.onServerError = function(err) {
      return console.error(err);
    };

    Imprint.prototype.onServerBound = function() {
      this.address = this.server.address();
      this.resetTimeoutTimer();
      return this.emit("open");
    };

    Imprint.prototype.onClientConnect = function(client) {
      if (this.client === null) {
        this.client = client;
        this.client.on('data', function(data) {
          return this.onClientData(data);
        });
        this.client.on('end', function(data) {
          return this.onClientData(data);
        });
        this.client.on('error', function(err) {
          return this.onClientError(err);
        });
        return this.client.on('close', function() {
          return this.onClientClose();
        });
      } else {
        return console.error('onClientConnect', 'there is a client allready');
      }
    };

    Imprint.prototype.onClientData = function(data) {
      var ack, message;
      console.log('client data', data.toString(16));
      message = Message.getMessageObject(data);
      console.log('message', message);
      if (message.type_of_message === Message.SERVICE_NEXT_IMPRINT) {
        this.emit('imprint', message);
        ack = new MSG2DCACK;
        ack.setApplictiondata();
        return this.client.write(ack.app_data);
      } else if (message.type_of_message === Message.SERVICE_NEXT_IMPRINT) {
        ack = new MSG2DCACK;
        ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
        ack.setApplictiondata();
        return this.client.write(ack.app_data);
      } else if (message.type_of_message === Message.TYPE_OPEN_SERVICE) {
        ack = new MSG2DCACK;
        ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
        ack.setApplictiondata();
        return this.client.write(ack.app_data);
      } else {
        return console.log('message', 'not expected imprint messages');
      }
    };

    Imprint.prototype.onClientClose = function() {
      return this.client = null;
    };

    Imprint.prototype.onClientError = function(err) {
      return console.error('client error', err);
    };

    Imprint.prototype.close = function() {
      if (this.client !== null) {
        this.client.close();
      }
      return this.server.close();
    };

    Imprint.prototype.onServerClose = function() {
      this.stopTimeoutTimer();
      return this.emit("closed");
    };

    return Imprint;

  })(EventEmitter);

}).call(this);
