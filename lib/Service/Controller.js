(function() {
  var Controller, EventEmitter, Net, StartPrintjob, Status, StatusLight, StopPrintjob;

  ({EventEmitter} = require('events'));

  Net = require('net');

  StatusLight = require('../Sequence/StatusLight');

  Status = require('../Sequence/Status');

  StartPrintjob = require('../Sequence/StartPrintjob');

  StopPrintjob = require('../Sequence/StopPrintjob');

  module.exports = Controller = class Controller extends EventEmitter {
    constructor() {
      super();
      this.timeout = 60000;
      this.ping_timeout = 45000;
      this.ip = "127.0.0.1";
      this.port = 4444; // fixed
      this.client = null;
      this.closingService = false;
    }

    //console.log @
    setPort(val) {
      return this.port = val;
    }

    setIP(val, port) {
      this.ip = val;
      if (port) {
        return this.port = port;
      }
    }

    resetPingTimer() {
      return null;
    }

    //@stopPingTimer()
    //@ping_timer = setTimeout @ping.bind(@), @ping_timeout
    stopPingTimer() {
      return null;
    }

    //if @ping_timer
    //  clearTimeout @ping_timer
    //@ping_timer = setTimeout @ping.bind(@), @ping_timeout
    ping() {
      return null;
    }

    //if @client?
    //  @getStatusLight()
    resetTimeoutTimer() {
      return null;
    }

    //@resetPingTimer()
    //@stopTimeoutTimer()
    //@timeout_timer = setTimeout @close.bind(@), @timeout
    stopTimeoutTimer() {
      return null;
    }

    //if @timeout_timer
    //  clearTimeout @timeout_timer
    //@timeout_timer = setTimeout @close.bind(@), @timeout
    open() {
      var me;
      me = this;
      if (this.client === null) {
        if (process.env.DEBUG_BBS_CONTROLLER === '1') {
          console.log('IP PORT', this.ip, this.port);
        }
        this.client = Net.createConnection(this.port, this.ip, () => {
          return this.onConnect();
        });
        this.closeEventName = 'unexpected_closed';
        this.client.setTimeout(3000);
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
          //console.log 'controller close',me.closeEventName
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
    }

    onConnect() {
      if (process.env.DEBUG_BBS_CONTROLLER === '1') {
        console.log('onConnect');
      }
      //@resetTimeoutTimer()
      this.client.setNoDelay(true);
      this.client.on('close', () => {
        return this.onClose();
      });
      this.client.on('end', () => {
        return this.onEnd();
      });
      return this.emit('ready');
    }

    getStatusLight() {
      this.seq = new StatusLight(this.client);
      this.seq.on('close', (message) => {
        return this.onStatusLight(message);
      });
      return this.seq;
    }

    onStatusLight(message) {
      //@resetTimeoutTimer()
      this.seq.removeAllListeners();
      return this.emit('statusLight', message);
    }

    getStatus() {
      var seq;
      seq = new Status(this.client);
      seq.on('close', (message) => {
        return this.onStatus(message);
      });
      return seq;
    }

    onStatus(message) {
      //@resetTimeoutTimer()
      return this.emit('status', message);
    }

    getStartPrintjob() {
      var seq;
      seq = new StartPrintjob(this.client);
      seq.on('close', (message) => {
        return this.onStartPrintjob(message);
      });
      return seq;
    }

    onStartPrintjob(message) {
      //@resetTimeoutTimer()
      return this.emit('startPrintJob', message);
    }

    getStopPrintjob() {
      var seq;
      seq = new StopPrintjob(this.client);
      seq.on('close', (message) => {
        return this.onStopPrintjob(message);
      });
      return seq;
    }

    onStopPrintjob(message) {
      //@resetTimeoutTimer()
      return this.emit('stopPrintJob', message);
    }

    onEnd() {
      //@emit "end"
      if (process.env.DEBUG_BBS_CONTROLLER === '1') {
        console.log('onEnd');
      }
      if (typeof this.client !== 'undefined' && this.client !== null) {
        this.lasteventname = this.client.closeEventName;
        this.client.destroy();
        return this.client = null;
      }
    }

    onClose() {
      //@stopTimeoutTimer()
      this.emit("closed", this.lasteventname);
      return this.client = null;
    }

    close() {
      if (typeof this.client !== 'undefined' && this.client !== null) {
        return this.client.end();
      }
    }

  };

}).call(this);
