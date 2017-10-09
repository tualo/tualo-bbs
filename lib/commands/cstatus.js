(function() {
  var CStatus, Command, Controller, Net, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = CStatus = (function(superClass) {
    extend(CStatus, superClass);

    function CStatus() {
      return CStatus.__super__.constructor.apply(this, arguments);
    }

    CStatus.commandName = 'cstatus';

    CStatus.commandArgs = ['ip'];

    CStatus.commandShortDescription = 'query the machine common status';

    CStatus.options = [];

    CStatus.help = function() {
      return "";
    };

    CStatus.prototype.action = function(options, args) {
      if (args.ip) {
        this.ctrl = new Controller;
        this.ctrl.setPort(4444);
        this.ctrl.setIP(args.ip);
        this.ctrl.on('ready', (function(_this) {
          return function() {
            return _this.onReady();
          };
        })(this));
        return this.ctrl.open();
      }
    };

    CStatus.prototype.onReady = function() {
      var seq;
      console.log('onReady');
      seq = this.ctrl.getStatus();
      seq.on('end', (function(_this) {
        return function(message) {
          return _this.onSequenceEnd(message);
        };
      })(this));
      return seq.run();
    };

    CStatus.prototype.onSequenceEnd = function(message) {
      return console.log(message);
    };

    return CStatus;

  })(Command);

}).call(this);
