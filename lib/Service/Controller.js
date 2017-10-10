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
      return null;
    };

    Controller.prototype.stopPingTimer = function() {
      return null;
    };

    Controller.prototype.ping = function() {
      return null;
    };

    Controller.prototype.resetTimeoutTimer = function() {
      return null;
    };

    Controller.prototype.stopTimeoutTimer = function() {
      return null;
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
        this.client.on('timeout', function(err) {
          if (process.env.DEBUG_BBS_CONTROLLER === '1') {
            console.log('controller socket timeout');
          }
          me.emit('error', {
            msg: 'socket timeout',
            code: 'ETIMEDOUT',
            address: me.ip
          });
          return me.onEnd();
        });
        this.client.on('error', function(err) {
          console.trace(err);
          me.emit('error', err);
          return me.onEnd();
        });
        this.client.on('close', function() {
          return me.emit('closed', me.closeEventName);
        });
        this.client.on('end', function() {
          if (process.env.DEBUG_BBS_CONTROLLER === '1') {
            console.log('controller end');
          }
          return me.emit('ended');
        });
        if (process.env.DEBUG_BBS_CONTROLLER === '1') {
          return console.log('-----');
        }
      }
    };

    Controller.prototype.onConnect = function() {
      if (process.env.DEBUG_BBS_CONTROLLER === '1') {
        console.log('onConnect');
      }
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
      this.seq = new StatusLight(this.client);
      this.seq.on('close', (function(_this) {
        return function(message) {
          return _this.onStatusLight(message);
        };
      })(this));
      return this.seq;
    };

    Controller.prototype.onStatusLight = function(message) {
      this.seq.removeAllListeners();
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
      return this.emit('stopPrintJob', message);
    };

    Controller.prototype.onEnd = function() {
      if (process.env.DEBUG_BBS_CONTROLLER === '1') {
        console.log('onEnd');
      }
      if (typeof this.client !== 'undefined' && this.client !== null) {
        this.lasteventname = this.client.closeEventName;
        this.client.destroy();
        return this.client = null;
      }
    };

    Controller.prototype.onClose = function() {
      this.emit("closed", this.lasteventname);
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
