(function() {
  var Controller, EventEmitter, Net, StartPrintjob, Status, StatusLight, StopPrintjob,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Net = require('net');

  StatusLight = require('../Sequence/StatusLight');

  Status = require('../Sequence/Status');

  StartPrintjob = require('../Sequence/StartPrintjob');

  StopPrintjob = require('../Sequence/StopPrintjob');

  module.exports = Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      this.timeout = 60000;
      this.ping_timeout = 45000;
      this.ip = "127.0.0.1";
      this.port = 4444;
      this.client = null;
      this.closingService = false;
      console.log(this);
    }

    Controller.prototype.setPort = function(val) {
      return this.port = val;
    };

    Controller.prototype.setIP = function(val, port) {
      this.ip = val;
      if (port) {
        return this.port = port;
      }
    };

    Controller.prototype.resetPingTimer = function() {
      this.stopPingTimer();
      return this.ping_timer = setTimeout(this.ping.bind(this), this.ping_timeout);
    };

    Controller.prototype.stopPingTimer = function() {
      if (this.ping_timer) {
        clearTimeout(this.ping_timer);
      }
      return this.ping_timer = setTimeout(this.ping.bind(this), this.ping_timeout);
    };

    Controller.prototype.ping = function() {
      return null;
    };

    Controller.prototype.resetTimeoutTimer = function() {
      this.resetPingTimer();
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
      var me;
      me = this;
      if (this.client === null) {
        console.log('PORT', this.port);
        this.client = Net.createConnection(this.port, this.ip, (function(_this) {
          return function() {
            return _this.onConnect();
          };
        })(this));
        this.closeEventName = 'unexpected_closed';
        this.client.setTimeout(2000);
        this.client.on('error', function(err) {
          console.trace(err);
          me.emit('error', err);
          return me.close();
        });
        this.client.on('close', function() {
          console.log('controller close', me.closeEventName);
          return me.emit('closed', me.closeEventName);
        });
        this.client.on('end', function() {
          console.log('controller end');
          return me.emit('ended');
        });
        return console.log('-----');
      }
    };

    Controller.prototype.onConnect = function() {
      console.log('onConnect');
      this.resetTimeoutTimer();
      this.client.setNoDelay(true);
      this.client.on('close', (function(_this) {
        return function() {
          return _this.onClose();
        };
      })(this));
      this.client.on('end', (function(_this) {
        return function() {
          return _this.onEnd();
        };
      })(this));
      return this.emit('ready');
    };

    Controller.prototype.getStatusLight = function() {
      var seq;
      seq = new StatusLight(this.client);
      seq.on('close', (function(_this) {
        return function(message) {
          return _this.onStatusLight(message);
        };
      })(this));
      return seq;
    };

    Controller.prototype.onStatusLight = function(message) {
      this.resetTimeoutTimer();
      return this.emit('statusLight', message);
    };

    Controller.prototype.getStatus = function() {
      var seq;
      seq = new Status(this.client);
      seq.on('close', (function(_this) {
        return function(message) {
          return _this.onStatus(message);
        };
      })(this));
      return seq;
    };

    Controller.prototype.onStatus = function(message) {
      this.resetTimeoutTimer();
      return this.emit('status', message);
    };

    Controller.prototype.getStartPrintjob = function() {
      var seq;
      seq = new StartPrintjob(this.client);
      seq.on('close', (function(_this) {
        return function(message) {
          return _this.onStartPrintjob(message);
        };
      })(this));
      return seq;
    };

    Controller.prototype.onStartPrintjob = function(message) {
      this.resetTimeoutTimer();
      return this.emit('startPrintJob', message);
    };

    Controller.prototype.getStopPrintjob = function() {
      var seq;
      seq = new StopPrintjob(this.client);
      seq.on('close', (function(_this) {
        return function(message) {
          return _this.onStopPrintjob(message);
        };
      })(this));
      return seq;
    };

    Controller.prototype.onStopPrintjob = function(message) {
      this.resetTimeoutTimer();
      return this.emit('stopPrintJob', message);
    };

    Controller.prototype.onEnd = function() {};

    Controller.prototype.onClose = function() {
      this.stopTimeoutTimer();
      this.emit("closed", this.client.closeEventName);
      return this.client = null;
    };

    Controller.prototype.close = function() {
      if (typeof this.client !== 'undefined' && this.client !== null) {
        return this.client.end();
      }
    };

    return Controller;

  })(EventEmitter);

}).call(this);
