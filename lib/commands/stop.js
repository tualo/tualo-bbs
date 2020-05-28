(function() {
  var Command, Controller, Imprint, Net, Stop, fs, path;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  Imprint = require('../Service/Imprint');

  Controller = require('../Service/Controller');

  Net = require('net');

  module.exports = Stop = (function() {
    class Stop extends Command {
      static help() {
        return ``;
      }

      action(options, args) {
        this.args = args;
        if (this.args.ip) {
          this.imprint = new Imprint(this.args.ip);
          this.imprint.on('open', () => {
            return this.onImprintOpen();
          });
          return this.imprint.open();
        }
      }

      onImprintOpen() {
        this.ctrl = new Controller();
        this.ctrl.setIP(this.args.ip);
        this.ctrl.on('ready', () => {
          return this.onReady();
        });
        this.ctrl.on('closed', () => {
          return this.onCtrlClosed();
        });
        return this.ctrl.open();
      }

      onCtrlClosed() {
        console.log('onCtrlClosed', 'removeAllListeners');
        this.ctrl.removeAllListeners();
        return process.exit();
      }

      onReady() {
        var seq;
        seq = this.ctrl.getStopPrintjob();
        //seq.init()
        //seq.setJobId 1
        //console.log @imprint
        //seq.setImprintChannelPort 4445
        //seq.setImprintChannelIP @imprint.getIP()
        seq.on('end', (message) => {
          return this.onSequenceEnd(message);
        });
        return seq.run();
      }

      onSequenceEnd(message) {
        return console.log(message);
      }

    };

    Stop.commandName = 'stop';

    Stop.commandArgs = ['ip'];

    Stop.commandShortDescription = 'starts a print job on the machine';

    Stop.options = [];

    return Stop;

  }).call(this);

}).call(this);
