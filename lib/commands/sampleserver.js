(function() {
  var Command, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Net, Sampleserver, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Net = require('net');

  MessageWrapper = require('../FP/MessageWrapper');

  Message = require('../FP/Message');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  MSG2DCACK = require('../FP/MSG2DCACK');

  module.exports = Sampleserver = (function(superClass) {
    extend(Sampleserver, superClass);

    function Sampleserver() {
      return Sampleserver.__super__.constructor.apply(this, arguments);
    }

    Sampleserver.commandName = 'sampleserver';

    Sampleserver.commandArgs = ['port'];

    Sampleserver.commandShortDescription = 'sample port';

    Sampleserver.options = [];

    Sampleserver.help = function() {
      return "";
    };

    Sampleserver.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Sampleserver.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Sampleserver.prototype.action = function(options, args) {
      this.timeout = 60000 * 5;
      this.client = null;
      if (args.port) {
        options = {
          allowHalfOpen: false,
          pauseOnConnect: false
        };
        this.server = Net.createServer(options, (function(_this) {
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
        return this.server.listen(args.port, (function(_this) {
          return function() {
            return _this.onServerBound();
          };
        })(this));
      }
    };

    Sampleserver.prototype.onServerError = function(err) {
      return console.error(err);
    };

    Sampleserver.prototype.onServerClose = function() {
      return console.log('close');
    };

    Sampleserver.prototype.onServerBound = function() {
      this.address = this.server.address();
      return this.resetTimeoutTimer();
    };

    Sampleserver.prototype.onClientConnect = function(client) {
      this.client = client;
      this.client.on('data', (function(_this) {
        return function(data) {
          return _this.onClientData(data);
        };
      })(this));
      this.client.on('end', (function(_this) {
        return function(data) {
          return _this.onClientData(data);
        };
      })(this));
      this.client.on('error', (function(_this) {
        return function(err) {
          return _this.onClientError(err);
        };
      })(this));
      return this.client.on('close', (function(_this) {
        return function() {
          return _this.onClientClose();
        };
      })(this));
    };

    Sampleserver.prototype.onClientData = function(data) {
      var message, response, sendbuffer, sizemessage;
      if (data != null) {
        message = MessageWrapper.getMessageObject(data);
        if (message === -1 || (message.type_of_message === 4 && message.interface_of_message === 5)) {
          return;
        }
        if (message.interface_of_message === 0 && message.serviceID === 1003) {
          console.log('open service');
          response = new MSG2DCACK;
          response.setServiceID(message.serviceID);
          sendbuffer = response.toFullByteArray();
          sizemessage = new MSG2CUPREPARESIZE;
          sizemessage.setMessageInterface(5);
          sizemessage.setMessageType(Message.TYPE_ACK);
          sizemessage.setSize(sendbuffer.length);
          console.log(sizemessage.getBuffer());
          this.client.write(sizemessage.getBuffer());
          console.log(sendbuffer);
          return this.client.write(sendbuffer);
        } else {
          return console.log('client data', message);
        }
      }
    };

    Sampleserver.prototype.onClientClose = function() {
      return this.client = null;
    };

    Sampleserver.prototype.onClientError = function(err) {
      return console.error('client error', err);
    };

    Sampleserver.prototype.close = function() {
      if (this.client !== null) {
        this.client.close();
      }
      return this.server.close();
    };

    return Sampleserver;

  })(Command);

}).call(this);
