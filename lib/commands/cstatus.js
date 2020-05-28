(function() {
  var CStatus, Command, Controller, Net, fs, path;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = CStatus = (function() {
    class CStatus extends Command {
      static help() {
        return ``;
      }

      action(options, args) {
        if (args.ip) {
          this.ctrl = new Controller();
          this.ctrl.setPort(4444);
          this.ctrl.setIP(args.ip);
          this.ctrl.on('ready', () => {
            return this.onReady();
          });
          return this.ctrl.open();
        }
      }

      onReady() {
        var seq;
        console.log('onReady');
        seq = this.ctrl.getStatus();
        seq.on('end', (message) => {
          return this.onSequenceEnd(message);
        });
        return seq.run();
      }

      onSequenceEnd(message) {
        return console.log(message);
      }

    };

    CStatus.commandName = 'cstatus';

    CStatus.commandArgs = ['ip'];

    CStatus.commandShortDescription = 'query the machine common status';

    CStatus.options = [];

    return CStatus;

  }).call(this);

}).call(this);
