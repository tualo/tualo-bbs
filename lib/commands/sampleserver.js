(function() {
  var Command, MSG2CUPREPARESIZE, MSG2CURETURNSTATUSLIGHT, MSG2DCACK, MSG2HSNEXTIMPRINT, Message, MessageWrapper, Net, Sampleserver, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Net = require('net');

  MessageWrapper = require('../FP/MessageWrapper');

  Message = require('../FP/Message');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CURETURNSTATUSLIGHT = require('../FP/MSG2CURETURNSTATUSLIGHT');

  MSG2HSNEXTIMPRINT = require('../FP/MSG2HSNEXTIMPRINT');

  module.exports = Sampleserver = (function(superClass) {
    extend(Sampleserver, superClass);

    function Sampleserver() {
      return Sampleserver.__super__.constructor.apply(this, arguments);
    }

    Sampleserver.commandName = 'sampleserver';

    Sampleserver.commandArgs = ['port'];

    Sampleserver.commandShortDescription = 'sample port';

    Sampleserver.options = [];

    Sampleserver.prototype.sendImprints = function() {
      if (this.nextImprintMessage) {
        this.imprints = Net.createConnection(this.nextImprintMessage.imprint_channel_port, this.nextImprintMessage.imprint_channel_ip, (function(_this) {
          return function() {
            return _this.onImprinstConnect();
          };
        })(this));
        this.imprints.setTimeout(5000);
        this.imprints.on('error', function(err) {
          return console.log('imprints error', err);
        });
        return this.imprints.on('close', function() {
          return console.log('imprints closed');
        });
      }
    };

    Sampleserver.prototype.onImprinstConnect = function() {
      var fn, msg, sendbuffer;
      msg = new MSG2DCACK();
      msg.setMessageInterface(Message.INTERFACE_CI);
      msg.setMessageType(Message.TYPE_OPEN_SERVICE);
      msg.setServiceID(Message.SERVICE_NEXT_IMPRINT);
      sendbuffer = msg.toFullByteArray();
      this.imprints.write(sendbuffer);
      fn = function() {
        return this.nextImprints(100);
      };
      return setTimeout(fn.bind(this), 1200);
    };

    Sampleserver.prototype.nextImprints = function(count) {
      var fn, msg, sendbuffer;
      if (this.nextImprintMessage) {
        if (count > 0) {
          msg = new MSG2HSNEXTIMPRINT();
          msg.setMailLength(2206);
          msg.setMailHeight(1103);
          msg.setMailThickness(12);
          msg.setMailWeight(97);
          msg.setJobId(this.nextImprintMessage.job_id);
          msg.setCustomerId(1);
          msg.setMachineNo(210);
          msg.setImprintNo(Math.round(((new Date()).getTime() - (new Date('2016-01-01')).getTime()) / 1000) - 14200000);
          msg.setEndorsementId(1);
          msg.setTownCircleID(1);
          sendbuffer = msg.toFullByteArray();
          this.imprints.write(sendbuffer);
          fn = function() {
            return this.nextImprints(count - 1);
          };
          return setTimeout(fn.bind(this), 500);
        } else {
          msg = new MSG2DCACK();
          msg.setMessageInterface(Message.INTERFACE_CI);
          msg.setMessageType(Message.TYPE_CLOSE_SERVICE);
          msg.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          sendbuffer = msg.toFullByteArray();
          this.imprints.write(sendbuffer);
          fn = function() {};
          return setTimeout(fn.bind(this), 500);
        }
      }
    };

    Sampleserver.help = function() {
      return "";
    };

    Sampleserver.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Sampleserver.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Sampleserver.prototype.action = function(options, args) {
      this.imprintNUM = 100;
      this.isPrinting = 0;
      this.timeout = 60000 * 15;
      this.client = null;
      if (args.port) {
        options = {
          allowHalfOpen: false,
          pauseOnConnect: false
        };
        this.server = Net.createServer(options, (function(_this) {
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
        return this.server.listen(args.port, (function(_this) {
          return function() {
            return _this.onServerBound();
          };
        })(this));
      }
    };

    Sampleserver.prototype.onServerError = function(err) {
      return console.error(err);
    };

    Sampleserver.prototype.onServerClose = function() {
      return console.log('close');
    };

    Sampleserver.prototype.onServerBound = function() {
      this.address = this.server.address();
      console.log('server', this.address);
      return this.resetTimeoutTimer();
    };

    Sampleserver.prototype.onClientConnect = function(client) {
      this.client = client;
      this.client.on('data', (function(_this) {
        return function(data) {
          return _this.onClientData(data);
        };
      })(this));
      this.client.on('end', (function(_this) {
        return function(data) {
          return _this.onClientData(data);
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

    Sampleserver.prototype.onClientData = function(data) {
      var message, response, sendbuffer;
      if (data != null) {
        console.log('<<<', data);
        message = MessageWrapper.getMessageObject(data);
        if (message === -1 || (message.type_of_message === 4 && message.interface_of_message === 5)) {
          data = data.slice(10);
          if (data.length >= 8) {
            message = MessageWrapper.getMessageObject(data);
          } else {
            return;
          }
        }
        console.log('<message<', message);
        if (message.interface_of_message === 0 && message.serviceID === 1000) {
          console.log('open print service');
          response = new MSG2DCACK;
          response.interface_of_message = message.interface_of_message;
          response.setServiceID(message.serviceID);
          sendbuffer = response.toFullByteArray();
          console.log('>>>', sendbuffer);
          return this.client.write(sendbuffer);
        } else if (message.interface_of_message === 0 && message.type_of_message === 4098) {
          console.log('close service');
          response = new MSG2DCACK;
          response.interface_of_message = message.interface_of_message;
          response.setServiceID(message.serviceID);
          sendbuffer = response.toFullByteArray();
          console.log('>>>', sendbuffer);
          return this.client.write(sendbuffer);
        } else if (message.interface_of_message === 0 && message.serviceID === 1003) {
          console.log('open status service');
          response = new MSG2DCACK;
          response.interface_of_message = message.interface_of_message;
          response.setServiceID(message.serviceID);
          sendbuffer = response.toFullByteArray();
          console.log('>>>', sendbuffer);
          return this.client.write(sendbuffer);
        } else if (message.interface_of_message === 9 && message.type_of_message === 4336) {
          console.log('start print job', message);
          response = new MSG2DCACK;
          response.interface_of_message = 0;
          response.type_of_message = message.type_of_message;
          response.setServiceID(1000);
          sendbuffer = response.toFullByteArray();
          console.log('>>> ***', sendbuffer);
          this.client.write(sendbuffer);
          this.nextImprintMessage = message;
          this.isPrinting = 1;
          return this.sendImprints();
        } else if (message.interface_of_message === 9 && message.type_of_message === 4337) {
          console.log('stop print job', message);
          response = new MSG2DCACK;
          response.interface_of_message = 0;
          response.setServiceID(1002);
          sendbuffer = response.toFullByteArray();
          this.isPrinting = 0;
          console.log('>>> ***', sendbuffer);
          this.client.write(sendbuffer);
          this.nextImprintMessage = null;
          return this.sendImprints();
        } else if (message.interface_of_message === 9 && message.type_of_message === 4339) {
          response = new MSG2CURETURNSTATUSLIGHT;
          response.interface_of_message = message.interface_of_message;
          response.setSystemUID(999);
          response.setAvailableScale(3);
          response.setPrintJobActive(0);
          response.setPrintJobID(0);
          if (this.isPrinting === 1) {
            response.setPrintJobID(this.nextImprintMessage.job_id);
            response.setPrintJobActive(this.isPrinting);
          }
          sendbuffer = response.toFullByteArray();
          console.log('>*>*>', sendbuffer);
          return this.client.write(sendbuffer);
        } else {
          return console.log('client data', message);
        }
      }
    };

    Sampleserver.prototype.onClientClose = function() {
      return this.client = null;
    };

    Sampleserver.prototype.onClientError = function(err) {
      return console.error('client error', err);
    };

    Sampleserver.prototype.close = function() {
      if (this.client !== null) {
        this.client.close();
      }
      return this.server.close();
    };

    return Sampleserver;

  })(Command);

}).call(this);
