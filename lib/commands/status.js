(function() {
  var Command, Controller, Net, Status, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = Status = (function(superClass) {
    extend(Status, superClass);

    function Status() {
      return Status.__super__.constructor.apply(this, arguments);
    }

    Status.commandName = 'status';

    Status.commandArgs = ['ip', 'port'];

    Status.commandShortDescription = 'query the machine status';

    Status.options = [];

    Status.help = function() {
      return "";
    };

    Status.prototype.action = function(options, args) {
      if (args.ip) {
        this.ctrl = new Controller;
        this.ctrl.setPort(args.port);
        this.ctrl.setIP(args.ip);
        this.ctrl.on('ready', (function(_this) {
          return function() {
            return _this.onReady();
          };
        })(this));
        this.ctrl.on('closed', (function(_this) {
          return function() {
            return _this.onCtrlClosed();
          };
        })(this));
        return this.ctrl.open();
      }
    };

    Status.prototype.onCtrlClosed = function() {
      console.log('onCtrlClosed', 'removeAllListeners');
      this.ctrl.removeAllListeners();
      delete this.ctrl;
      return process.exit();
    };

    Status.prototype.onReady = function() {
      var seq;
      console.log('onReady');
      seq = this.ctrl.getStatusLight();
      seq.on('end', (function(_this) {
        return function(message) {
          return _this.onSequenceEnd(message);
        };
      })(this));
      return seq.run();
    };

    Status.prototype.onSequenceEnd = function(message) {
      return console.log(message);
    };

    return Status;

  })(Command);

}).call(this);
