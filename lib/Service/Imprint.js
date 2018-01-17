(function() {
  var EventEmitter, Imprint, MSG2CUPREPARESIZE, MSG2DCACK, MSG2HSNEXTIMPRINT, Message, MessageWrapper, freeport, net, os,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2HSNEXTIMPRINT = require('../FP/MSG2HSNEXTIMPRINT');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  MSG2DCACK = require('../FP/MSG2DCACK');

  net = require('net');

  os = require('os');

  freeport = require('freeport');

  module.exports = Imprint = (function(superClass) {
    extend(Imprint, superClass);

    function Imprint(machine_ip) {
      this.machine_ip = machine_ip;
      this.timeout = 60 * 60 * 60000;
      this.port = 14445;
      this.server = null;
      this.client = null;
    }

    Imprint.prototype.getPort = function() {
      return this.address.port;
    };

    Imprint.prototype.getIP = function() {
      var ifaces, m_ip, res;
      res = "127.0.0.1";
      ifaces = os.networkInterfaces();
      m_ip = this.machine_ip.split('.');
      Object.keys(ifaces).forEach(function(ifname) {
        var alias;
        alias = 0;
        ifaces[ifname].forEach(function(iface) {
          var p;
          if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
          }
          if (alias >= 1) {
            if (process.env.DEBUG_BBS_IMPRINT === '1') {
              console.log(ifname + ':' + alias, iface.address);
            }
          } else {
            if (process.env.DEBUG_BBS_IMPRINT === '1') {
              console.log(ifname, iface.address);
            }
          }
          p = iface.address.split('.');
          if (m_ip[0] === p[0] && m_ip[1] === p[1] && m_ip[2] === p[2]) {
            return res = iface.address;
          }
        });
        return alias += 1;
      });
      return res;
    };

    Imprint.prototype.resetTimeoutTimer = function() {
      return this.stopTimeoutTimer();
    };

    Imprint.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        return clearTimeout(this.timeout_timer);
      }
    };

    Imprint.prototype.reopen = function() {
      if (this.server !== null) {
        this.server.close();
        this.server = null;
      }
      return this.open();
    };

    Imprint.prototype.open = function() {
      var options;
      if (this.server === null) {
        options = {
          family: 'IPv4',
          host: '0.0.0.0',
          allowHalfOpen: false,
          pauseOnConnect: false
        };
        this.server = net.createServer(options, (function(_this) {
          return function(client) {
            return _this.onClientConnect(client);
          };
        })(this));
        this.server.on('error', (function(_this) {
          return function(err) {
            return _this.onServerError(err);
          };
        })(this));
        this.server.on('close', (function(_this) {
          return function() {
            return _this.onServerClose();
          };
        })(this));
        return this.server.listen(0, '0.0.0.0', (function(_this) {
          return function() {
            return _this.onServerBound();
          };
        })(this));
      }
    };

    Imprint.prototype.onServerError = function(err) {
      return console.error(err);
    };

    Imprint.prototype.debugConnections = function() {
      return this.server.getConnections(function(err, count) {
        return console.log('IMPRINT SERVER', 'count connections', err, count);
      });
    };

    Imprint.prototype.onServerBound = function() {
      this.address = this.server.address();
      this.port = this.address.port;
      this.ip = this.address.address;
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        setInterval(this.debugConnections.bind(this), 3000);
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.log(this.address);
      }
      this.resetTimeoutTimer();
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.log('imprint', 'server created');
      }
      return this.emit("open");
    };

    Imprint.prototype.onClientConnect = function(client) {
      this.client = client;
      this.client.on('data', (function(_this) {
        return function(data) {
          return _this.onClientData(data);
        };
      })(this));
      this.client.on('end', (function(_this) {
        return function(data) {
          return _this.onClientEnd(data);
        };
      })(this));
      this.client.on('error', (function(_this) {
        return function(err) {
          return _this.onClientError(err);
        };
      })(this));
      return this.client.on('close', (function(_this) {
        return function() {
          return _this.onClientClose();
        };
      })(this));
    };

    Imprint.prototype.onClientEnd = function(data) {
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.log('imprint client end');
      }
      return this.onClientData(data);
    };

    Imprint.prototype.onClientData = function(data) {
      var ack, message, sendbuffer;
      if (data) {
        this.resetTimeoutTimer();
        if (process.env.DEBUG_BBS_IMPRINT === '1') {
          console.log('imprint client data < ', data.toString('hex'));
        }
        message = MessageWrapper.getMessageObject(data);
        if (process.env.DEBUG_BBS_IMPRINT === '1') {
          console.log('imprint message', message);
        }
        if (message.type_of_message === Message.TYPE_BBS_NEXT_IMPRINT) {
          this.emit('imprint', message);
          ack = new MSG2DCACK;
          ack.setApplictiondata();
          sendbuffer = ack.toFullByteArray();
          this.client.write(sendbuffer);
          if (process.env.DEBUG_BBS_IMPRINT === '1') {
            return console.log('>>>SEND ACK', sendbuffer);
          }
        } else if (message.type_of_message === Message.SERVICE_NEXT_IMPRINT) {
          if (process.env.DEBUG_BBS_IMPRINT === '1') {
            console.log('imprint', 'SERVICE_NEXT_IMPRINT');
          }
          this.emit('acting');
          ack = new MSG2DCACK;
          ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          ack.setApplictiondata();
          return this.client.write(ack.toFullByteArray());
        } else if (message.type_of_message === Message.TYPE_OPEN_SERVICE) {
          if (process.env.DEBUG_BBS_IMPRINT === '1') {
            console.log('imprint', 'TYPE_OPEN_SERVICE');
          }
          this.emit('acting');
          ack = new MSG2DCACK;
          ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          ack.setApplictiondata();
          sendbuffer = ack.toFullByteArray();
          return this.client.write(sendbuffer);
        } else if (message.type_of_message === 4098) {
          this.emit('acting');
          ack = new MSG2DCACK;
          ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          ack.setApplictiondata();
          sendbuffer = ack.toFullByteArray();
          return this.client.write(sendbuffer);
        } else {
          if (process.env.DEBUG_BBS_IMPRINT === '1') {
            return console.log('message', 'not expected imprint messages');
          }
        }
      }
    };

    Imprint.prototype.onClientClose = function() {
      if (this.client.destroyed === false) {
        this.client.destroy();
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        return console.error('onClientClose()');
      }
    };

    Imprint.prototype.onClientError = function(err) {
      if (this.client.destroyed === false) {
        this.client.destroy();
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        return console.error('client error', err);
      }
    };

    Imprint.prototype.closeClient = function() {
      if (this.client != null) {
        if (this.client.destroyed === false) {
          this.client.end();
        }
      }
      if ((this.client != null) && this.client.destroyed === false) {
        if (process.env.DEBUG_BBS_IMPRINT === '1') {
          return console.log('closeClient', 'open');
        }
      } else {
        if (process.env.DEBUG_BBS_IMPRINT === '1') {
          return console.log('closeClient', 'not open');
        }
      }
    };

    Imprint.prototype.close = function() {
      if (this.client != null) {
        this.client.end();
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.error('server ------>   close()');
      }
      return this.server.close();
    };

    Imprint.prototype.onServerClose = function() {
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.error('onServerClose');
      }
      this.stopTimeoutTimer();
      return this.emit("closed");
    };

    return Imprint;

  })(EventEmitter);

}).call(this);
