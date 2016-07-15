(function() {
  var Command, Server, app, bbs, fs, http, io, mysql, path, sss, stats,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  app = require('express')();

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

    Server.commandArgs = ['port', 'machine_ip', 'hostsystem', 'hostdb'];

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
        opts = {
          host: this.args.hostsystem,
          user: 'sorter',
          password: 'sorter',
          database: this.args.hostdb,
          connectionLimit: 100,
          wait_timeout: 28800,
          connect_timeout: 1000
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

    Server.prototype.startBBS = function() {
      var args, imprint, me, pool;
      me = this;
      me.customerNumber = '|';
      pool = this.connection;
      args = this.args;
      imprint = new bbs.Imprint(args.machine_ip);
      imprint.open();
      io.on('connection', function(socket) {
        socket.on('disconnect', function() {
          return imprint.removeAllListeners();
        });
        imprint.on('acting', function() {});
        imprint.on('imprint', function(message) {
          var cp, fn, sql;
          sql = 'insert into bbs_data\n(\n  id,\n  kundennummer,\n  kostenstelle,\n  height,\n  length,\n  thickness,\n  weight,\n  inserttime,\n  job_id,\n  machine_no,\n  login,\n  waregroup\n) values (\n  {id},\n  {kundennummer},\n  {kostenstelle},\n  {height},\n  {length},\n  {thickness},\n  {weight},\n  now(),\n  {job_id},\n  {machine_no},\n  \'{login}\',\n  \'{waregroup}\'\n)\non duplicate key update\n\n  kundennummer=values(kundennummer),\n  kostenstelle=values(kostenstelle),\n  height=values(height),\n  length=values(length),\n  thickness=values(thickness),\n  weight=values(weight),\n  inserttime=values(inserttime),\n  job_id=values(job_id),\n  machine_no=values(machine_no),\n  login=values(login),\n  waregroup=values(waregroup)';
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
          sql = sql.replace('{login}', 'sorter');
          fn = function(err, connection) {
            var ctrl;
            if (err) {
              console.log(err);
              ctrl = new bbs.Controller();
              ctrl.setIP(args.machine_ip);
              ctrl.on('closed', function(msg) {
                return socket.emit('closed', msg);
              });
              ctrl.on('ready', function() {
                var seq;
                seq = ctrl.getStopPrintjob();
                seq.run();
                fn = function() {
                  ctrl.client.closeEventName = 'expected';
                  socket.emit('stop', {});
                  console.log('CLOSING (stop)!!!!');
                  return ctrl.close();
                };
                setTimeout(fn, 2000);
                fs.exists('/opt/grab/customer.txt', function(exists) {
                  if (exists) {
                    return fs.writeFile('/opt/grab/customer.txt', '', function(err) {
                      if (err) {
                        return console.log(err);
                      }
                    });
                  }
                });
                return seq.run();
              });
              return ctrl.open();
            } else {
              return connection.query(sql, function(err, rows, fields) {
                if (err) {
                  console.log(err);
                  if (err.code !== 'ER_DUP_KEY') {
                    ctrl = new bbs.Controller();
                    ctrl.setIP(args.machine_ip);
                    ctrl.on('closed', function(msg) {
                      return socket.emit('closed', msg);
                    });
                    ctrl.on('ready', function() {
                      var seq;
                      seq = ctrl.getStopPrintjob();
                      seq.run();
                      fn = function() {
                        ctrl.client.closeEventName = 'expected';
                        socket.emit('stop', {});
                        console.log('CLOSING (stop)!!!!');
                        return ctrl.close();
                      };
                      setTimeout(fn, 2000);
                      fs.exists('/opt/grab/customer.txt', function(exists) {
                        if (exists) {
                          return fs.writeFile('/opt/grab/customer.txt', '', function(err) {
                            if (err) {
                              return console.log(err);
                            }
                          });
                        }
                      });
                      return seq.run();
                    });
                    ctrl.open();
                  }
                }
                return connection.release();
              });
            }
          };
          pool.getConnection(fn);
          return socket.emit('imprint', message);
        });
        socket.on('status', function() {
          var ctrl;
          ctrl = new bbs.Controller();
          ctrl.setIP(args.machine_ip);
          ctrl.on('closed', function(msg) {
            return socket.emit('closed', msg);
          });
          ctrl.on('ready', function() {
            var seq;
            seq = ctrl.getStatusLight();
            seq.on('end', function(message) {
              socket.emit('status', message);
              return ctrl.close();
            });
            return seq.run();
          });
          return ctrl.open();
        });
        socket.on('stop', function() {
          var ctrl;
          ctrl = new bbs.Controller();
          ctrl.setIP(args.machine_ip);
          ctrl.on('closed', function(msg) {
            return socket.emit('closed', msg);
          });
          ctrl.on('ready', function() {
            var fn, seq;
            seq = ctrl.getStopPrintjob();
            seq.run();
            fn = function() {
              ctrl.client.closeEventName = 'expected';
              socket.emit('stop', {});
              console.log('CLOSING (stop)!!!!');
              return ctrl.close();
            };
            setTimeout(fn, 2000);
            fs.exists('/opt/grab/customer.txt', function(exists) {
              if (exists) {
                return fs.writeFile('/opt/grab/customer.txt', '', function(err) {
                  if (err) {
                    return console.log(err);
                  }
                });
              }
            });
            return seq.run();
          });
          return ctrl.open();
        });
        socket.on('serverStatus', function(message) {
          return stats.check('memory', function(obj) {
            return socket.emit('serverStatus', obj);
          });
        });
        return socket.on('start', function(message) {
          var _start, ctrl;
          _start = function() {
            var ctrl;
            ctrl = new bbs.Controller();
            ctrl.setIP(args.machine_ip);
            ctrl.on('closed', function(msg) {
              return socket.emit('closed', msg);
            });
            ctrl.on('ready', function() {
              var adv, endorsement1, endorsement2, seq;
              seq = ctrl.getStartPrintjob();
              seq.init();
              seq.setJobId(message.job_id);
              seq.setWeightMode(message.weight_mode);
              me.customerNumber = message.customerNumber;
              seq.setCustomerNumber(message.customerNumber);
              fs.exists('/opt/grab/customer.txt', function(exists) {
                if (exists) {
                  return fs.writeFile('/opt/grab/customer.txt', message.customerNumber, function(err) {
                    if (err) {
                      return console.log(err);
                    }
                  });
                }
              });
              if (message.waregroup != null) {
                me.waregroup = message.waregroup;
              }
              seq.setPrintOffset(message.label_offset);
              seq.setDateAhead(message.date_offset);
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
              seq.setImprintChannelPort(imprint.getPort());
              seq.setImprintChannelIP(imprint.getIP());
              seq.on('end', function() {
                socket.emit('start', {});
                console.log('CLOSING (stop)!!!!');
                return ctrl.close();
              });
              return seq.run();
            });
            return ctrl.open();
          };
          ctrl = new bbs.Controller();
          ctrl.setIP(args.machine_ip);
          ctrl.on('closed', function(msg) {
            return socket.emit('closed', msg);
          });
          ctrl.on('ready', function() {
            var seq;
            seq = ctrl.getStatusLight();
            seq.on('end', function(message) {
              socket.emit('status', message);
              ctrl.close();
              if (message.print_job_active === 1) {
                ctrl = new bbs.Controller();
                ctrl.setIP(args.machine_ip);
                ctrl.on('closed', function(msg) {
                  return socket.emit('closed', msg);
                });
                ctrl.on('ready', function() {
                  var fn;
                  seq = ctrl.getStopPrintjob();
                  fn = function() {
                    socket.emit('stop', {});
                    return ctrl.close();
                  };
                  setTimeout(fn, 2000);
                  fs.exists('/opt/grab/customer.txt', function(exists) {
                    if (exists) {
                      return fs.writeFile('/opt/grab/customer.txt', '', function(err) {
                        if (err) {
                          return console.log(err);
                        }
                      });
                    }
                  });
                  return seq.run();
                });
                return ctrl.open();
              } else {
                return _start();
              }
            });
            return seq.run();
          });
          return ctrl.open();
        });
      });
      return http.listen(args.port, '0.0.0.0', function() {
        return console.log('listening on *:' + args.port);
      });
    };

    return Server;

  })(Command);

}).call(this);
