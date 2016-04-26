(function() {
  var Controller, EventEmitter, MSG2CUCLOSESERVICE, MSG2CUGETSTATUSLIGHT, MSG2CUOPENSERVICE, MSG2DCACK, Message, MessageBuffer, Net,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageBuffer = require('../FP/MessageBuffer');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUGETSTATUSLIGHT = require('../FP/MSG2CUGETSTATUSLIGHT');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  Net = require('net');

  module.exports = Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      this.timeout = 60000;
      this.ip = "127.0.0.1";
      this.port = 4444;
      this.client = null;
      this.closingService = false;
    }

    Controller.prototype.setPort = function(val) {
      return this.port = val;
    };

    Controller.prototype.setIP = function(val) {
      return this.ip = val;
    };

    Controller.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Controller.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Controller.prototype.open = function() {
      console.log('open controller', this.client);
      if (this.client === null) {
        console.log('open controller');
        return this.client = Net.createConnection(this.port, this.ip, (function(_this) {
          return function() {
            return _this.onConnect();
          };
        })(this));
      }
    };

    Controller.prototype.onConnect = function() {
      this.resetTimeoutTimer();
      this.emit("open");
      this.client.on('end', (function(_this) {
        return function() {
          return _this.onClose();
        };
      })(this));
      this.client.on('data', (function(_this) {
        return function(data) {
          return _this.onData(data);
        };
      })(this));
      return this.sendOpenBBSStatusLight();
    };

    Controller.prototype.onData = function(data) {
      var message;
      message = Message.getMessageObject(data);
      if (message.type_of_message === Message.TYPE_ACK) {
        return this.handleACK(message);
      } else if (message.type_of_message === Message.TYPE_BBS_RETURN_STATUS_LIGHT) {
        this.emit("status light", message);
        console.log("emitted status light", message);
        this.closingService = true;
        return this.sendCloseService();
      } else {
        return console.log('unkown message');
      }
    };

    Controller.prototype.handleACK = function(message) {
      if (message.serviceID === Message.SERVICE_STATUS_LIGHT) {
        if (this.closingService === true) {
          return console.log('closing service');
        } else {
          this.closingService = false;
          return this.sendBBSStatusLight();
        }
      } else {
        return console.log('unkown message');
      }
    };

    Controller.prototype.onClose = function() {
      this.stopTimeoutTimer();
      this.emit("closed");
      return this.client = null;
    };

    Controller.prototype.close = function() {
      if (this.client !== null) {
        return this.client.close();
      }
    };

    Controller.prototype.sendCloseService = function() {
      var message;
      message = new MSG2CUCLOSESERVICE;
      return this.client.write(message.app_data);
    };

    Controller.prototype.sendBBSStatusLight = function() {
      var message;
      message = new MSG2CUGETSTATUSLIGHT;
      return this.client.write(message.app_data);
    };

    Controller.prototype.sendOpenBBSStatusLight = function() {
      var message;
      message = new MSG2CUOPENSERVICE;
      message.setServiceID(Message.SERVICE_STATUS_LIGHT);
      return this.client.write(message.app_data);
    };

    return Controller;

  })(EventEmitter);

}).call(this);
