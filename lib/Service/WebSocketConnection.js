(function() {
  var EventEmitter, WebSocketConnection, bbs, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  bbs = require('../main');

  path = require('path');

  fs = require('fs');

  module.exports = WebSocketConnection = (function(superClass) {
    extend(WebSocketConnection, superClass);

    function WebSocketConnection(ws, jobfile, machine_ip) {
      this.ws = ws;
      this.jobfile = jobfile;
      this.imprint = new bbs.Imprint(machine_ip);
      this.imprint.open();
      this.imprint.on('imprint', this.onImprint.bind(this));
      this.ws.on('close', (function(_this) {
        return function(message) {
          if (_this.imprint) {
            return _this.imprint.close();
          }
        };
      })(this));
      this.ws.on('message', this.onWebSocketClientIncomingMessage.bind(this));
    }

    WebSocketConnection.prototype.onImprint = function(message) {
      var me, ws;
      me = this;
      ws = this.ws;
      return ws.send(me.getWSMessage('imprint', message));
    };

    WebSocketConnection.prototype.getWSMessage = function(evt, data) {
      return JSON.stringify({
        event: evt,
        data: data
      });
    };

    WebSocketConnection.prototype.onWebSocketClientIncomingMessage = function(message) {
      var o;
      o = JSON.parse(message);
      if (o.event) {
        return this.processIncomingMessage(o.event, o.data);
      }
    };

    WebSocketConnection.prototype.processIncomingMessage = function(event, message) {
      var me;
      me = this;
      if (typeof me['process_' + event] === 'function') {
        return me['process_' + event](message);
      }
    };

    WebSocketConnection.prototype.process_start = function(message) {
      var _start, doneFN, fnDone, me, ws;
      me = this;
      ws = this.ws;
      if (me.imprint === null) {
        return;
      }
      _start = function() {
        console.log('start message', message);
        ws.send(me.getWSMessage('start', message));
        return me.startJob(message);
      };
      fnDone = function() {};
      doneFN = (function(_this) {
        return function(doneMessage) {
          var fnStopJob;
          me.currentJob('');
          if (message.print_job_active === 1) {
            fnStopJob = function(dMessage) {
              return process.nextTick(_start);
            };
            return me.controller('getStopPrintjob', message, fnStopJob, fnDone);
          } else {
            return process.nextTick(_start);
          }
        };
      })(this);
      return me.controller('getStatusLight', message, doneFN, fnDone);
    };

    WebSocketConnection.prototype.process_stop = function(message) {
      var closeFN, doneFN, me, ws;
      me = this;
      ws = this.ws;
      closeFN = function() {};
      doneFN = (function(_this) {
        return function(doneMessage) {
          me.currentJob('');
          return ws.send(me.getWSMessage('stop', message));
        };
      })(this);
      return me.controller('getStopPrintjob', message, doneFN, closeFN);
    };

    WebSocketConnection.prototype.process_poi = function(message) {
      return console.log('TODO');
    };

    WebSocketConnection.prototype.process_status = function(message) {
      var me, ws;
      me = this;
      ws = this.ws;
      if (me.start_without_printing === true) {
        message = {
          available_scale: 0,
          system_uid: 999,
          print_job_active: 1,
          print_job_id: me.job_id,
          interface_of_message: 9,
          type_of_message: 4340
        };
        ws.send(me.getWSMessage('status', message));
        return;
      }
      if (me.imprint === null) {
        message = {
          no_machine: true,
          available_scale: 0,
          system_uid: 999,
          print_job_active: 0,
          print_job_id: me.job_id,
          interface_of_message: 9,
          type_of_message: 4340
        };
        ws.send(me.getWSMessage('status', message));
        return;
      }
      return me.getStatus(message);
    };

    WebSocketConnection.prototype.currentJob = function(job) {
      console.log('set job: ', job);
      return fs.writeFile(this.jobfile, job, function(err) {
        if (err) {
          throw err;
        }
      });
    };

    WebSocketConnection.prototype.controller = function(sequenceFN, msg, onClosed, onDone, runseq) {
      var args, ctrl;
      args = this.args;
      ctrl = new bbs.Controller();
      console.log('controller', msg);
      ctrl.setIP(msg.machine.ip, msg.machine.port);
      ctrl.on('closed', function(msg) {
        console.log('controller', sequenceFN, 'ctrl close');
        return onClosed(msg);
      });
      ctrl.on('ready', function() {
        var seq;
        seq = ctrl[sequenceFN]();
        if (typeof runseq === 'function') {
          runseq(seq);
        }
        seq.on('end', function(endMsg) {
          console.log('controller', sequenceFN, 'sequence end');
          if (typeof onDone === 'function') {
            onDone(endMsg);
          }
          return ctrl.close();
        });
        return seq.run();
      });
      return ctrl.open();
    };

    WebSocketConnection.prototype.stopJob = function(msg) {
      var closeFN, doneFN, me, ws;
      me = this;
      ws = this.ws;
      closeFN = (function(_this) {
        return function(message) {
          me.currentJob('');
          console.log('stopJob', 'closeFN');
          return ws.send(me.getWSMessage('stop', doneMessage));
        };
      })(this);
      doneFN = (function(_this) {
        return function(message) {
          me.currentJob('');
          console.log('stopJob', 'doneFN');
          return ws.send(me.getWSMessage('stop', message));
        };
      })(this);
      return this.controller('getStopPrintjob', msg, closeFN, doneFN);
    };

    WebSocketConnection.prototype.startJob = function(message) {
      var closeFN, doneFN, me, runSeq, ws;
      me = this;
      ws = this.ws;
      closeFN = (function(_this) {
        return function(doneMessage) {
          me.currentJob(message.job_id);
          console.log('startJob', 'closeFN');
          return ws.send(me.getWSMessage('start', doneMessage));
        };
      })(this);
      doneFN = (function(_this) {
        return function(doneMessage) {
          console.log('startJob', 'doneFN');
          me.currentJob(message.job_id);
          return ws.send(me.getWSMessage('start', doneMessage));
        };
      })(this);
      runSeq = function(seq) {
        var adv, endorsement1, endorsement2;
        seq.init();
        me.job_id = message.job_id;
        if (typeof message.addressfield === 'string') {
          me.addressfield = message.addressfield;
        }
        seq.setJobId(message.job_id);
        seq.setWeightMode(message.weight_mode);
        me.customerNumber = message.customerNumber;
        seq.setCustomerNumber(message.customerNumber);
        if (message.waregroup != null) {
          me.waregroup = message.waregroup;
        }
        seq.setPrintOffset(message.label_offset);
        seq.setDateAhead(message.date_offset);
        seq.setPrintDate(message.print_date);
        seq.setPrintEndorsement(message.print_endorsement);
        endorsement1 = '';
        if (message.endorsement1) {
          endorsement1 = message.endorsement1;
        }
        endorsement2 = '';
        if (message.endorsement2) {
          endorsement2 = message.endorsement2;
        }
        adv = '';
        if (message.advert) {
          if (message.advert.length > 30) {
            adv = message.advert;
          }
        }
        seq.setEndorsementText1(endorsement1);
        seq.setEndorsementText2(endorsement2);
        if (adv.length > 30) {
          seq.setAdvertHex(adv);
        }
        seq.setImprintChannelPort(me.imprint.getPort());
        return seq.setImprintChannelIP(me.imprint.getIP());
      };
      console.log("@controller 'getStartPrintjob'", message);
      return this.controller('getStartPrintjob', message, closeFN, doneFN, runSeq);
    };

    WebSocketConnection.prototype.getStatus = function(msg) {
      var closeFN, doneFN, me, ws;
      me = this;
      ws = this.ws;
      closeFN = (function(_this) {
        return function(message) {
          return console.log('getStatus', 'closeFN');
        };
      })(this);
      doneFN = (function(_this) {
        return function(message) {
          console.log('getStatus', 'doneFN');
          return ws.send(me.getWSMessage('status', message));
        };
      })(this);
      return this.controller('getStatusLight', msg, closeFN, doneFN);
    };

    return WebSocketConnection;

  })(EventEmitter);

}).call(this);
