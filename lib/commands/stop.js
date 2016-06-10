(function() {
  var Command, Controller, Imprint, Net, Stop, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Imprint = require('../Service/Imprint');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = Stop = (function(superClass) {
    extend(Stop, superClass);

    function Stop() {
      return Stop.__super__.constructor.apply(this, arguments);
    }

    Stop.commandName = 'stop';

    Stop.commandArgs = ['ip'];

    Stop.commandShortDescription = 'starts a print job on the machine';

    Stop.options = [];

    Stop.help = function() {
      return "";
    };

    Stop.prototype.action = function(options, args) {
      this.args = args;
      if (this.args.ip) {
        this.imprint = new Imprint;
        this.imprint.on('open', (function(_this) {
          return function() {
            return _this.onImprintOpen();
          };
        })(this));
        return this.imprint.open();
      }
    };

    Stop.prototype.onImprintOpen = function() {
      this.ctrl = new Controller;
      this.ctrl.setIP(this.args.ip);
      this.ctrl.on('ready', (function(_this) {
        return function() {
          return _this.onReady();
        };
      })(this));
      return this.ctrl.open();
    };

    Stop.prototype.onReady = function() {
      var seq;
      seq = this.ctrl.getStopPrintjob();
      seq.on('end', (function(_this) {
        return function(message) {
          return _this.onSequenceEnd(message);
        };
      })(this));
      return seq.run();
    };

    Stop.prototype.onSequenceEnd = function(message) {
      return console.log(message);
    };

    return Stop;

  })(Command);

}).call(this);
