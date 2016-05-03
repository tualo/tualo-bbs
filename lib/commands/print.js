(function() {
  var Command, Controller, Imprint, Net, Print, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Imprint = require('../Service/Imprint');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = Print = (function(superClass) {
    extend(Print, superClass);

    function Print() {
      return Print.__super__.constructor.apply(this, arguments);
    }

    Print.commandName = 'print';

    Print.commandArgs = ['ip'];

    Print.commandShortDescription = 'starts a print job on the machine';

    Print.options = [];

    Print.help = function() {
      return "";
    };

    Print.prototype.action = function(options, args) {
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

    Print.prototype.onImprintOpen = function() {
      this.ctrl = new Controller;
      this.ctrl.setIP(this.args.ip);
      this.ctrl.on('ready', (function(_this) {
        return function() {
          return _this.onReady();
        };
      })(this));
      return this.ctrl.open();
    };

    Print.prototype.onReady = function() {
      var seq;
      seq = this.ctrl.getStartPrintjob();
      seq.init();
      console.log(this.imprint);
      seq.setImprintChannelPort(4445);
      seq.setImprintChannelIP(this.imprint.getIP());
      seq.on('end', (function(_this) {
        return function(message) {
          return _this.onSequenceEnd(message);
        };
      })(this));
      return seq.run();
    };

    Print.prototype.onSequenceEnd = function(message) {
      return console.log(message);
    };

    return Print;

  })(Command);

}).call(this);
