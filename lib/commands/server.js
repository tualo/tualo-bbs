(function() {
  var Command, Server, WebSocket, app, bbs, fs, http, io, mysql, path, sss, stats,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  app = require('express')();

  WebSocket = require('ws');

  http = require('http').Server(app);

  io = require('socket.io')(http);

  bbs = require('../main');

  mysql = require('mysql');

  sss = require('simple-stats-server');

  stats = sss();

  module.exports = Server = (function(superClass) {
    extend(Server, superClass);

    function Server() {
      return Server.__super__.constructor.apply(this, arguments);
    }

    Server.commandName = 'server';

    Server.commandArgs = ['port', 'machine_ip', 'machine_port', 'hostsystem', 'hostdb', 'dbuser', 'dbpass', 'jobfile'];

    Server.commandShortDescription = 'running the bbs machine controll service';

    Server.options = [];

    Server.help = function() {
      return "";
    };

    Server.prototype.action = function(options, args) {
      var me, opts;
      if (args.port) {
        this.args = args;
        me = this;
        me.waregroup = 'Standardsendungen';
        me.jobfile = args.jobfile || '/opt/grab/job.txt';
        console.log(this.args);
        opts = {
          host: this.args.hostsystem,
          user: this.args.dbuser,
          password: this.args.dbpass,
          database: this.args.hostdb,
          connectionLimit: 100,
          wait_timeout: 120,
          connect_timeout: 10
        };
        this.connection = mysql.createPool(opts);
        this.connection.on('error', (function(_this) {
          return function(err) {
            return _this.onDBError;
          };
        })(this));
        return this.startMySQL();
      }
    };

    Server.prototype.startMySQL = function() {
      return this.startBBS();
    };

    Server.prototype.onDBError = function(err) {
      console.log('####################');
      console.log('onDBError');
      console.trace(err);
      return setTimeout(process.exit, 5000);
    };

    Server.prototype.currentJob = function(job) {
      console.log('set job: ', job);
      return fs.writeFile(this.jobfile, job, function(err) {
        if (err) {
          throw err;
        }
      });
    };

    Server.prototype.controller = function(sequenceFN, onClosed, onDone, runseq) {
      var args, ctrl;
      args = this.args;
      ctrl = new bbs.Controller();
      ctrl.setIP(args.machine_ip, args.machine_port);
      ctrl.on('closed', function(msg) {
        console.log('controller', sequenceFN, 'ctrl close');
        return onClosed(msg);
      });
      ctrl.on('ready', function() {
        var seq;
        console.log('controller', sequenceFN, 'ready');
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

    Server.prototype.stopJob = function(socket) {
      var closeFN, doneFN;
      closeFN = (function(_this) {
        return function(message) {
          _this.currentJob('');
          console.log('stopJob', 'closeFN');
          return socket.emit('closed', message);
        };
      })(this);
      doneFN = (function(_this) {
        return function(message) {
          _this.currentJob('');
          console.log('stopJob', 'doneFN');
          return socket.emit('stop', message);
        };
      })(this);
      return this.controller('getStopPrintjob', closeFN, doneFN);
    };

    Server.prototype.startJob = function(socket, message) {
      var closeFN, doneFN, me, runSeq;
      me = this;
      closeFN = (function(_this) {
        return function(doneMessage) {
          me.currentJob(message.job_id);
          console.log('startJob', 'closeFN');
          return socket.emit('closed', doneMessage);
        };
      })(this);
      doneFN = (function(_this) {
        return function(doneMessage) {
          console.log('startJob', 'doneFN');
          me.currentJob(message.job_id);
          return socket.emit('start', doneMessage);
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
      return this.controller('getStartPrintjob', closeFN, doneFN, runSeq);
    };

    Server.prototype.getStatus = function(socket) {
      var closeFN, doneFN;
      closeFN = (function(_this) {
        return function(message) {
          console.log('getStatus', 'closeFN');
          return socket.emit('close', message);
        };
      })(this);
      doneFN = (function(_this) {
        return function(message) {
          console.log('getStatus', 'doneFN', message);
          return socket.emit('status', message);
        };
      })(this);
      return this.controller('getStatusLight', closeFN, doneFN);
    };

    Server.prototype.startBBS = function() {
      var args, me, pool;
      me = this;
      me.customerNumber = '|';
      me.start_without_printing = false;
      me.job_id = 0;
      me.addressfield = 'L';
      pool = this.connection;
      args = this.args;
      me.imprint = null;
      if (args.machine_ip !== '0') {
        me.imprint = new bbs.Imprint(args.machine_ip);
        me.imprint.open();
      } else {
        console.log('does not use a machine');
      }
      io.on('connection', function(socket) {
        socket.on('disconnect', function() {
          if (me.imprint !== null) {
            return me.imprint.removeAllListeners();
          }
        });
        if (me.imprint !== null) {
          me.imprint.on('acting', function() {});
          me.imprint.on('imprint', function(message) {
            var cp, fn, sql;
            sql = 'insert into bbs_data\n(\n  id,\n  kundennummer,\n  kostenstelle,\n  height,\n  length,\n  thickness,\n  weight,\n  inserttime,\n  job_id,\n  machine_no,\n  login,\n  waregroup,\n  addressfield\n) values (\n  {id},\n  {kundennummer},\n  {kostenstelle},\n  {height},\n  {length},\n  {thickness},\n  {weight},\n  now(),\n  {job_id},\n  {machine_no},\n  \'{login}\',\n  \'{waregroup}\',\n  \'{addressfield}\'\n)\non duplicate key update\n\n  kundennummer=values(kundennummer),\n  kostenstelle=values(kostenstelle),\n  height=values(height),\n  length=values(length),\n  thickness=values(thickness),\n  weight=values(weight),\n  inserttime=values(inserttime),\n  job_id=values(job_id),\n  machine_no=values(machine_no),\n  login=values(login),\n  waregroup=values(waregroup),\n  addressfield=values(addressfield)';
            cp = me.customerNumber.split('|');
            sql = sql.replace('{id}', message.machine_no * 100000000 + message.imprint_no);
            sql = sql.replace('{kundennummer}', cp[0]);
            sql = sql.replace('{kostenstelle}', cp[1]);
            sql = sql.replace('{height}', message.mail_height);
            sql = sql.replace('{length}', message.mail_length);
            sql = sql.replace('{thickness}', message.mail_thickness);
            sql = sql.replace('{weight}', message.mail_weight);
            sql = sql.replace('{job_id}', message.job_id);
            sql = sql.replace('{machine_no}', message.machine_no);
            sql = sql.replace('{waregroup}', me.waregroup);
            sql = sql.replace('{addressfield}', me.addressfield);
            sql = sql.replace('{login}', 'sorter');
            fn = function(err, connection) {
              if (err) {
                console.log('ERROR on MYSQL Connection');
                console.log(err);
                return me.stopJob(socket);
              } else {
                console.log('write db');
                return connection.query(sql, function(err, rows, fields) {
                  console.log('write db returned');
                  if (err) {
                    console.log(err.code);
                  }
                  if (err) {
                    console.log(err);
                    if (err.code !== 'ER_DUP_KEY') {
                      me.stopJob(socket);
                    }
                  }
                  return connection.release();
                });
              }
            };
            pool.getConnection(fn);
            return socket.emit('imprint', message);
          });
        }
        socket.on('service', function(message) {
          if (message.type === 'status') {
            if (message.name === 'grab') {
              me.checkGrabService(socket, message);
            }
            if (message.name === 'ocrsd') {
              me.checkOCRService(socket, message);
            }
          }
          if (message.type === 'stop') {
            if (message.name === 'ocrsd' || message.name === 'grab') {
              return me.statusService(socket, message);
            }
          }
        });
        socket.on('status', function() {
          var message;
          if (me.start_without_printing === true) {
            message = {
              available_scale: 0,
              system_uid: 999,
              print_job_active: 1,
              print_job_id: me.job_id,
              interface_of_message: 9,
              type_of_message: 4340
            };
            socket.emit('status', message);
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
            socket.emit('status', message);
            return;
          }
          return me.getStatus(socket);
        });
        socket.on('stop', function() {
          if (me.start_without_printing === true) {
            me.start_without_printing = false;
            socket.emit('stop', {});
            return;
          }
          if (me.imprint === null) {
            socket.emit('stop', {});
            return;
          }
          return me.stopJob(socket);
        });
        socket.on('serverStatus', function(message) {
          return stats.check('memory', function(obj) {
            return socket.emit('serverStatus', obj);
          });
        });
        socket.on('start_without_printing', function(message) {
          me.start_without_printing = true;
          me.customerNumber = message.customerNumber;
          me.currentJob(message.jobid);
          if (message.waregroup != null) {
            me.waregroup = message.waregroup;
          }
          me.job_id = message.job_id;
          return socket.emit('start_without_printing', {});
        });
        return socket.on('start', function(message) {
          var _start, doneFN, fnDone;
          if (me.imprint === null) {
            return;
          }
          _start = function() {
            console.log('start message', message);
            return me.startJob(socket, message);
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
                return me.controller('getStopPrintjob', fnStopJob, fnDone);
              } else {
                return process.nextTick(_start);
              }
            };
          })(this);
          return me.controller('getStatusLight', doneFN, fnDone);
        });
      });
      console.log('args.port', args.port);
      return http.listen(args.port, function() {
        return console.log('listening on *:' + args.port);
      });
    };

    Server.prototype.startStopService = function(socket, cmd) {
      var proc, spawn;
      spawn = require('child_process').spawn;
      proc = spawn('serice', [cmd.name, cmd.type]);
      return proc.on('close', function(code) {
        var val;
        val = {
          service: cmd.name
        };
        return socket.emit(cmd.type, val);
      });
    };

    Server.prototype.statusService = function(socket, cmd) {
      var ls, spawn;
      spawn = require('child_process').spawn;
      ls = spawn('service', [cmd.name, 'status']);
      ls.stdout.on('data', function(data) {
        var val;
        if (data.toString().indexOf('(running)') >= 0) {
          val = {
            state: 'running',
            service: cmd.name,
            type: 'status'
          };
          socket.emit('service', val);
        }
        if (data.toString().indexOf('inactive') >= 0) {
          val = {
            state: 'inactive',
            service: cmd.name,
            type: 'status'
          };
          return socket.emit('service', val);
        }
      });
      return ls.stderr.on('data', function(data) {
        var val;
        val = {
          state: 'error',
          service: cmd.name,
          type: 'status'
        };
        return socket.emit('service', val);
      });
    };

    return Server;

  })(Command);

}).call(this);
