(function() {
  var Command, Server, app, bbs, fs, http, io, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  app = require('express')();

  http = require('http').Server(app);

  io = require('socket.io')(http);

  bbs = require('../main');

  module.exports = Server = (function(superClass) {
    extend(Server, superClass);

    function Server() {
      return Server.__super__.constructor.apply(this, arguments);
    }

    Server.commandName = 'server';

    Server.commandArgs = ['port', 'machine_ip'];

    Server.commandShortDescription = 'running the bbs machine controll service';

    Server.options = [];

    Server.help = function() {
      return "";
    };

    Server.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Server.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Server.prototype.action = function(options, args) {
      var connection, imprint, me, mysql, opts;
      if (args.port) {
        me = this;
        me.waregroup = 'Standardsendungen';
        mysql = require('mysql');
        opts = {
          host: 'localhost',
          user: 'sorter',
          password: 'sorter',
          database: 'sorter'
        };
        connection = mysql.createConnection(opts);
        connection.connect();
        imprint = new bbs.Imprint(args.machine_ip);
        imprint.open();
        io.on('connection', function(socket) {
          imprint.on('imprint', function(message) {
            var cp, sql;
            sql = 'insert into bbs_data\n(\n  id,\n  kundennummer,\n  kostenstelle,\n  height,\n  length,\n  thickness,\n  weight,\n  inserttime,\n  job_id,\n  machine_no,\n  login,\n  waregroup\n) values (\n  {id},\n  {kundennummer},\n  {kostenstelle},\n  {height},\n  {length},\n  {thickness},\n  {weight},\n  now(),\n  {job_id},\n  {machine_no},\n  \'{login}\',\n  \'{waregroup}\'\n)';
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
            connection.query(sql, function(err, rows, fields) {
              return console.log(err);
            });
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
                console.log('sending', message);
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
              fn = function() {
                ctrl.client.closeEventName = 'expected';
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
          });
          return socket.on('start', function(message) {
            var _start, ctrl;
            console.log(message);
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
                  return ctrl.close();
                });
                return seq.run();
              });
              return ctrl.open();
            };
            console.log('---->');
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
                console.log('---->', message);
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
      }
    };

    return Server;

  })(Command);

}).call(this);
