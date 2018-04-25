(function() {
  var Command, HttpServer, app, bbs, fs, http, mysql, path, spawn, sss, stats,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  spawn = require('child_process').spawn;

  app = require('express')();

  http = require('http').Server(app);

  bbs = require('../main');

  mysql = require('mysql');

  sss = require('simple-stats-server');

  stats = sss();

  module.exports = HttpServer = (function(superClass) {
    extend(HttpServer, superClass);

    function HttpServer() {
      return HttpServer.__super__.constructor.apply(this, arguments);
    }

    HttpServer.commandName = 'httpserver';

    HttpServer.commandArgs = ['port', 'machine_ip', 'machine_port', 'hostsystem', 'hostdb', 'dbuser', 'dbpass', 'jobfile'];

    HttpServer.commandShortDescription = 'running the bbs machine controll service';

    HttpServer.options = [];

    HttpServer.help = function() {
      return "";
    };

    HttpServer.prototype.action = function(options, args) {
      var me, opts;
      if (args.port) {
        this.args = args;
        me = this;
        me.waregroup = 'Standardsendungen';
        me.jobfile = args.jobfile || '/opt/grab/job.txt';
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          console.log(this.args);
        }
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

    HttpServer.prototype.startMySQL = function() {
      return this.startBBS();
    };

    HttpServer.prototype.startBBS = function() {
      var args, me;
      me = this;
      me.jobCount = 0;
      me.customerNumber = '|';
      me.start_without_printing = false;
      me.job_id = 0;
      me.addressfield = 'L';
      me.pool = this.connection;
      args = this.args;
      me.lastState = {
        print_job_active: 0
      };
      me.forcestatus = true;
      me.times = {
        programmstart: (new Date()).getTime(),
        laststatus: (new Date()).getTime(),
        laststop: (new Date()).getTime(),
        laststart: (new Date()).getTime()
      };
      me.imprint = null;
      if (args.machine_ip !== '0') {
        me.imprint = new bbs.Imprint(args.machine_ip);
        me.imprint.on('imprint', me.onImprint.bind(me));
        me.imprint.open();
      } else {
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          console.log('does not use a machine');
        }
      }
      return this.openExpressServer();
    };

    HttpServer.prototype.refreshForStopTimer = function() {
      if (this.lastimprinttimer != null) {
        clearTimeout(this.lastimprinttimer);
      }
      if (process.env.BBS_DONTSTOPJOB === '1') {
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          return console.log('d');
        }
      } else {
        return this.lastimprinttimer = setTimeout(this.refreshStopJob.bind(this), 120000);
      }
    };

    HttpServer.prototype.refreshStopJob = function() {
      var closeFN, doneFN, errorFN, me, message;
      me = this;
      if (me.lastState.print_job_active === 1) {
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          console.log('STOP PRINTJOB BY TIMEOUT');
        }
        message = {};
        errorFN = (function(_this) {
          return function(errMessage) {
            if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
              console.log('refreshStopJob', 'errorFN', errMessage);
            }
            me.lastError = errMessage;
            return me.getStatus(true);
          };
        })(this);
        closeFN = (function(_this) {
          return function(message) {
            if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
              return console.log('refreshStopJob', 'closeFN');
            }
          };
        })(this);
        doneFN = (function(_this) {
          return function(message) {
            _this.currentJob('');
            _this.setCustomerFile('');
            me.lastError = null;
            if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
              console.log('refreshStopJob', 'doneFN');
            }
            me.getStatus(true);
            return me.times.laststop = (new Date()).getTime();
          };
        })(this);
        return this.controller('getStopPrintjob', closeFN, doneFN, errorFN);
      }
    };

    HttpServer.prototype.onImprint = function(imprint) {
      var cp, fn, me, message, sql;
      imprint.job_id = this.currentJobID;
      this.lastimprint = imprint;
      this.lastimprinttime = (new Date()).getTime();
      this.refreshForStopTimer();
      message = imprint;
      this.jobCount += 1;
      me = this;
      sql = 'insert into bbs_data\n(\n  id,\n  kundennummer,\n  kostenstelle,\n  height,\n  length,\n  thickness,\n  weight,\n  inserttime,\n  job_id,\n  machine_no,\n  login,\n  waregroup,\n  addressfield\n) values (\n  {id},\n  {kundennummer},\n  {kostenstelle},\n  {height},\n  {length},\n  {thickness},\n  {weight},\n  now(),\n  {job_id},\n  {machine_no},\n  \'{login}\',\n  \'{waregroup}\',\n  \'{addressfield}\'\n)\non duplicate key update\n  kundennummer=values(kundennummer),\n  kostenstelle=values(kostenstelle),\n  height=values(height),\n  length=values(length),\n  thickness=values(thickness),\n  weight=values(weight),\n  inserttime=values(inserttime),\n  job_id=values(job_id),\n  machine_no=values(machine_no),\n  login=values(login),\n  waregroup=values(waregroup),\n  addressfield=values(addressfield)';
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
        var closeFN, doneFN, errorFN;
        me.lastSQLError = null;
        if (err) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('ERROR on MYSQL Connection');
          }
          console.trace(err);
          me.lastSQLError = err.message;
          errorFN = (function(_this) {
            return function(errMessage) {
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                return console.log('stopJob', 'errorFN', errMessage);
              }
            };
          })(this);
          closeFN = (function(_this) {
            return function(message) {
              me.currentJob('');
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                return console.log('stopJob', 'closeFN', 'on MYSQL Connection');
              }
            };
          })(this);
          doneFN = (function(_this) {
            return function(message) {
              me.currentJob('');
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                return console.log('stopJob', 'doneFN', 'on MYSQL Connection');
              }
            };
          })(this);
          return me.controller('getStopPrintjob', closeFN, doneFN, errorFN);
        } else {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('write db');
          }
          return connection.query(sql, function(err, rows, fields) {
            me.lastSQLError = null;
            if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
              console.log('write db returned');
            }
            if (err) {
              me.lastSQLError = err.message;
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                console.trace(err);
              }
              if (err.code !== 'ER_DUP_KEY') {
                errorFN = (function(_this) {
                  return function(errMessage) {
                    if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                      return console.log('stopJob', 'errorFN', errMessage);
                    }
                  };
                })(this);
                closeFN = (function(_this) {
                  return function(message) {
                    me.currentJob('');
                    if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                      return console.log('stopJob', 'closeFN', 'db write error');
                    }
                  };
                })(this);
                doneFN = (function(_this) {
                  return function(message) {
                    me.currentJob('');
                    if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                      return console.log('stopJob', 'doneFN', 'db write error');
                    }
                  };
                })(this);
                me.controller('getStopPrintjob', closeFN, doneFN, errorFN);
              }
            }
            return connection.release();
          });
        }
      };
      me.pool.getConnection(fn);
      if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
        return console.log('imprint--------------', imprint);
      }
    };

    HttpServer.prototype.openExpressServer = function() {
      var bodyParser, express;
      this.getStatusTimed();
      express = require('express');
      bodyParser = require('body-parser');
      app = express();
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({
        extended: true
      }));
      app.get('/', (function(_this) {
        return function(req, res) {
          var result;
          result = {
            success: true
          };
          result.machine_ip = _this.args.machine_ip;
          result.machine_port = _this.args.machine_port;
          result.lastimprint = _this.lastimprint;
          result.jobCount = _this.jobCount;
          result.lastError = _this.lastError;
          result.lastState = _this.lastState;
          result.lastSQLError = _this.lastSQLError;
          result.lastStartJobMessage = _this.lastStartJobMessage;
          return res.send(JSON.stringify(result));
        };
      })(this));
      app.get('/status', this.expressStatus.bind(this));
      app.all('/startjob', this.expressStartJob.bind(this));
      app.get('/stopjob', this.expressStopJob.bind(this));
      app.get('/restartimprint', this.restartImprint.bind(this));
      app.all('/hotswitch', this.expressHotSwitch.bind(this));
      app.all('/reboot', this.expressReboot.bind(this));
      return app.listen(this.args.port, '0.0.0.0');
    };

    HttpServer.prototype.restartImprint = function(req, res) {
      var me;
      me = this;
      console.log('restartImprint', 'start');
      me.imprint.reopen();
      res.send(JSON.stringify({
        success: true,
        msg: 'imprint restarted'
      }));
      if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
        return console.log('restartImprint', 'done');
      }
    };

    HttpServer.prototype.expressReboot = function(req, res) {
      var fn, me;
      me = this;
      fn = function() {
        var rebootProc;
        return rebootProc = spawn('reboot', []);
      };
      res.send(JSON.stringify({
        success: true,
        msg: "rebooting"
      }));
      return setTimeout(fn.bind(me), 3000);
    };

    HttpServer.prototype.expressStatus = function(req, res) {
      var closeFN, doneFN, errorFN, me;
      me = this;
      errorFN = (function(_this) {
        return function(errMessage) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('expressStatus', 'errorFN', errMessage);
          }
          me.lastError = errMessage;
          return res.send(JSON.stringify({
            success: false,
            msg: errMessage.code
          }));
        };
      })(this);
      closeFN = function(message) {
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          return console.log('expressStatus', 'closeFN');
        }
      };
      doneFN = function(message) {
        me.lastError = null;
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          console.log('expressStatus', 'doneFN');
        }
        return res.send(JSON.stringify({
          success: true,
          msg: message
        }));
      };
      return this.controller('getStatusLight', closeFN, doneFN, errorFN);
    };

    HttpServer.prototype.expressStopJob = function(req, res) {
      var closeFN, doneFN, errorFN, me, message;
      me = this;
      message = {};
      errorFN = (function(_this) {
        return function(errMessage) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('stopJob', 'errorFN', errMessage);
          }
          me.lastError = errMessage;
          res.send(JSON.stringify({
            success: false,
            msg: errMessage.code
          }));
          return me.getStatus(true);
        };
      })(this);
      closeFN = (function(_this) {
        return function(message) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            return console.log('stopJob', 'closeFN');
          }
        };
      })(this);
      doneFN = (function(_this) {
        return function(message) {
          _this.currentJob('');
          _this.setCustomerFile('');
          me.lastError = null;
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('stopJob', 'doneFN');
          }
          res.send(JSON.stringify({
            success: true,
            msg: message
          }));
          me.times.laststop = (new Date()).getTime();
          return me.getStatus(true);
        };
      })(this);
      return this.controller('getStopPrintjob', closeFN, doneFN, errorFN);
    };

    HttpServer.prototype.expressHotSwitch = function(req, res) {
      var bodymessage, e, error, k, me, message, v;
      me = this;
      message = {};
      bodymessage = {};
      try {
        bodymessage = JSON.parse(req.body.message);
        if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
          console.log('########################');
          console.log('########################');
          console.log(bodymessage);
          console.log('########################');
          console.log('########################');
        }
      } catch (error) {
        e = error;
        console.log(e);
      }
      message = {
        job_id: 1,
        weight_mode: 3,
        customerNumber: '69000|0',
        kundennummer: '69000',
        kostenstelle: 0,
        waregroup: 'Standardsendungen',
        label_offset: 0,
        date_offset: 0,
        stamp: 1,
        addressfield: 'L',
        print_date: 1,
        print_endorsement: 1,
        endorsement1: 'endors',
        endorsement2: 'endors',
        advert: '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
      };
      for (k in message) {
        v = message[k];
        if (bodymessage.hasOwnProperty(k)) {
          message[k] = bodymessage[k];
        }
      }
      me.lastStartJobMessage = message;
      me.currentJob(message.job_id);
      me.setCustomerFile(message.customerNumber);
      me.customerNumber = message.customerNumber;
      me.jobCount = 0;
      return res.send(JSON.stringify({
        success: true,
        msg: message
      }));
    };

    HttpServer.prototype.expressStartJob = function(req, res) {
      var bodymessage, closeFN, doneFN, e, error, error1, errorFN, k, me, message, runSeq, v;
      me = this;
      try {
        if (me.lastState.print_job_active === 1) {
          return res.send(JSON.stringify({
            success: false,
            msg: "Es wird bereits ein Druckauftrag ausgeführt"
          }));
        } else {
          bodymessage = {};
          try {
            bodymessage = JSON.parse(req.body.message);
            if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
              console.log('########################');
              console.log('########################');
              console.log(bodymessage);
              console.log('########################');
              console.log('########################');
            }
          } catch (error) {
            e = error;
            console.log(e);
          }
          message = {
            job_id: 1,
            weight_mode: 3,
            customerNumber: '69000|0',
            kundennummer: '69000',
            kostenstelle: 0,
            waregroup: 'Standardsendungen',
            label_offset: 0,
            date_offset: 0,
            stamp: 1,
            addressfield: 'L',
            print_date: 1,
            print_endorsement: 1,
            endorsement1: 'endors',
            endorsement2: 'endors',
            advert: '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
          };
          if (bodymessage.hasOwnProperty('start_without_printing')) {
            if (bodymessage.start_without_printing * 1 === 1) {
              me.currentJob(message.job_id);
              me.setCustomerFile(message.customerNumber);
              res.send(JSON.stringify({
                success: true,
                msg: 'Nur Transportieren kann einstellt werden.'
              }));
              return;
            }
          }
          for (k in message) {
            v = message[k];
            if (bodymessage.hasOwnProperty(k)) {
              message[k] = bodymessage[k];
            }
          }
          me.lastStartJobMessage = message;
          errorFN = (function(_this) {
            return function(errMessage) {
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                console.log('startJob', 'errorFN', errMessage);
              }
              me.lastError = errMessage;
              res.send(JSON.stringify({
                success: false,
                msg: errMessage.code
              }));
              return me.getStatus(true);
            };
          })(this);
          closeFN = (function(_this) {
            return function(doneMessage) {
              me.currentJob(message.job_id);
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                return console.log('startJob', 'closeFN');
              }
            };
          })(this);
          doneFN = (function(_this) {
            return function(doneMessage) {
              if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
                console.log('startJob', 'doneFN');
              }
              me.jobCount = 0;
              me.lastError = null;
              me.currentJob(message.job_id);
              me.setCustomerFile(message.customerNumber);
              res.send(JSON.stringify({
                success: true,
                msg: message
              }));
              me.refreshForStopTimer();
              me.times.laststart = (new Date()).getTime();
              return me.getStatus();
            };
          })(this);
          runSeq = function(seq) {
            var endorsement1, endorsement2;
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
            seq.setEndorsementText1(endorsement1);
            seq.setEndorsementText2(endorsement2);
            seq.setImprintChannelPort(me.imprint.getPort());
            return seq.setImprintChannelIP(me.imprint.getIP());
          };
          return this.controller('getStartPrintjob', closeFN, doneFN, errorFN, runSeq);
        }
      } catch (error1) {
        e = error1;
        return res.send(JSON.stringify({
          success: false,
          msg: e.message
        }));
      }
    };

    HttpServer.prototype.currentJob = function(job) {
      this.currentJobID = job;
      if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
        console.log('set job: ', job);
      }
      return fs.writeFile(this.jobfile, job, function(err) {
        if (err) {
          throw err;
        }
      });
    };

    HttpServer.prototype.setCustomerFile = function(kn) {
      return fs.exists('/opt/grab/customer.txt', function(exists) {
        if (exists) {
          return fs.writeFile('/opt/grab/customer.txt', kn, function(err) {
            if (err) {
              return console.log(err);
            }
          });
        }
      });
    };

    HttpServer.prototype.onDBError = function(err) {
      if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
        console.log('####################');
        console.log('onDBError');
        console.trace(err);
      }
      return setTimeout(process.exit, 5000);
    };

    HttpServer.prototype.controller = function(sequenceFN, onClosed, onDone, onError, runseq) {
      var args, ctrl, deferFN, me;
      me = this;
      args = this.args;
      if (me.queryIsRunning) {
        deferFN = function() {
          return me.controller.apply(me, [sequenceFN, onClosed, onDone, onError, runseq]);
        };
        return setTimeout(deferFN, 1500);
      } else {
        me.queryIsRunning = true;
        ctrl = new bbs.Controller();
        ctrl.setIP(args.machine_ip, args.machine_port);
        ctrl.on('error', function(msg) {
          me.queryIsRunning = false;
          if (typeof onError === 'function') {
            return onError(msg);
          }
        });
        ctrl.on('closed', function(msg) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('controller', sequenceFN, 'ctrl close');
          }
          return onClosed(msg);
        });
        ctrl.on('ready', function() {
          var seq;
          me.queryIsRunning = false;
          seq = ctrl[sequenceFN]();
          if (typeof runseq === 'function') {
            runseq(seq);
          }
          seq.on('end', function(endMsg) {
            if (typeof onDone === 'function') {
              onDone(endMsg);
            }
            return ctrl.close();
          });
          return seq.run();
        });
        return ctrl.open();
      }
    };

    HttpServer.prototype.getStatus = function(force) {
      if (process.env.DEBUG_BBS_STATUSTIMINGS === '1') {
        console.log('getStatus called');
      }
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (force === true) {
        this.forcestatus = true;
      }
      return this.getStatusTimed();
    };

    HttpServer.prototype.getStatusTimed = function() {
      var closeFN, doneFN, errorFN, me, n, runit;
      me = this;
      runit = false;
      if (process.env.DEBUG_BBS_STATUSTIMINGS === '1') {
        n = (new Date()).getTime();
        console.log('TIMINGS', new Date());
        console.log('me.times.laststatus', (n - me.times.laststatus) / 1000, 'sec');
        console.log('me.times.laststart', (n - me.times.laststart) / 1000, 'sec');
        console.log('me.times.laststop', (n - me.times.laststop) / 1000, 'sec');
        console.log('me.times.programmstart', (n - me.times.programmstart) / 1000, 'sec');
        console.log('~~~~~~~~~~~~~');
      }
      if (typeof me.lastState === 'object') {
        if (me.lastState.print_job_active === 0) {
          runit = true;
        }
      } else {
        runit = true;
      }
      if (me.forcestatus === true) {
        runit = true;
        me.forcestatus = false;
      }
      errorFN = (function(_this) {
        return function(errMessage) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('getStatus (timed)', 'onError', 'next ping in *5s', errMessage);
          }
          return me.lastError = errMessage;
        };
      })(this);
      closeFN = (function(_this) {
        return function(message) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('getStatus (timed)', 'closeFN');
          }
          return me.timer = setTimeout(me.getStatus.bind(me), 5000);
        };
      })(this);
      doneFN = (function(_this) {
        return function(message) {
          if (process.env.DEBUG_BBS_HTTPSERVER === '1') {
            console.log('getStatus (timed)', 'doneFN', 'next ping in 5s');
          }
          me.lastError = null;
          me.lastState = message;
          if (message.print_job_active === 0) {
            me.imprint.closeClient();
          }
          return me.times.laststatus = (new Date()).getTime();
        };
      })(this);
      if (runit === true) {
        return this.controller('getStatusLight', closeFN, doneFN, errorFN, null);
      }
    };

    return HttpServer;

  })(Command);

}).call(this);
