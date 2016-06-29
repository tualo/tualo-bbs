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
      var me;
      if (args.port) {
        me = this;
        io.on('connection', function(socket) {
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
            var ctrl, e, error;
            try {
              if (me.imprint) {
                me.imprint.close();
              }
            } catch (error) {
              e = error;
            }
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
            me.imprint = new bbs.Imprint(args.machine_ip);
            me.imprint.on('imprint', function(message) {
              return socket.emit('imprint', message);
            });
            me.imprint.on('open', function() {
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
                  seq.setImprintChannelPort(me.imprint.getPort());
                  seq.setImprintChannelIP(me.imprint.getIP());
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
            return me.imprint.open();
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
