(function() {
  var Command, Controller, Net, Status, fs, path;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = Status = (function() {
    class Status extends Command {
      static help() {
        return ``;
      }

      action(options, args) {
        if (args.ip) {
          this.ctrl = new Controller();
          this.ctrl.setPort(args.port);
          this.ctrl.setIP(args.ip);
          this.ctrl.on('ready', () => {
            return this.onReady();
          });
          this.ctrl.on('closed', () => {
            return this.onCtrlClosed();
          });
          return this.ctrl.open();
        }
      }

      onCtrlClosed() {
        console.log('onCtrlClosed', 'removeAllListeners');
        this.ctrl.removeAllListeners();
        delete this.ctrl;
        return process.exit();
      }

      onReady() {
        var seq;
        console.log('onReady');
        seq = this.ctrl.getStatusLight();
        seq.on('end', (message) => {
          return this.onSequenceEnd(message);
        });
        return seq.run();
      }

      onSequenceEnd(message) {
        return console.log(message);
      }

    };

    Status.commandName = 'status';

    Status.commandArgs = ['ip', 'port'];

    Status.commandShortDescription = 'query the machine status';

    Status.options = [];

    return Status;

  }).call(this);

}).call(this);
