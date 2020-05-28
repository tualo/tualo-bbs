(function() {
  var Command, MSG2CUPREPARESIZE, MSG2CURETURNSTATUSLIGHT, MSG2DCACK, MSG2HSNEXTIMPRINT, Message, MessageWrapper, Net, Sampleserver, fs, path;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  Net = require('net');

  MessageWrapper = require('../FP/MessageWrapper');

  Message = require('../FP/Message');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CURETURNSTATUSLIGHT = require('../FP/MSG2CURETURNSTATUSLIGHT');

  MSG2HSNEXTIMPRINT = require('../FP/MSG2HSNEXTIMPRINT');

  module.exports = Sampleserver = (function() {
    class Sampleserver extends Command {
      sendImprints() {
        if (this.nextImprintMessage) {
          this.imprints = Net.createConnection(this.nextImprintMessage.imprint_channel_port, this.nextImprintMessage.imprint_channel_ip, () => {
            return this.onImprinstConnect();
          });
          this.imprints.setTimeout(5000);
          this.imprints.on('error', function(err) {
            return console.log('imprints error', err);
          });
          return this.imprints.on('close', function() {
            return console.log('imprints closed');
          });
        }
      }

      onImprinstConnect() {
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
      }

      nextImprints(count) {
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
            //Math.round( ( (new Date()).getTime()-(new Date('2016-01-01')).getTime() )/1000 ) - 14200000
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
            //@imprints.end()
            //fn = () ->
            //  console.log 'rerun'
            //  @onImprinstConnect()
            //setTimeout fn.bind(@),1500
            return setTimeout(fn.bind(this), 500);
          }
        }
      }

      static help() {
        return ``;
      }

      resetTimeoutTimer() {
        this.stopTimeoutTimer();
        return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
      }

      stopTimeoutTimer() {
        if (this.timeout_timer) {
          clearTimeout(this.timeout_timer);
        }
        return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
      }

      action(options, args) {
        this.imprintNUM = 100;
        this.isPrinting = 0;
        this.timeout = 60000 * 15;
        this.client = null;
        if (args.port) {
          options = {
            allowHalfOpen: false,
            pauseOnConnect: false
          };
          this.server = Net.createServer(options, (client) => {
            return this.onClientConnect(client);
          });
          this.server.on('error', (err) => {
            return this.onServerError(err);
          });
          this.server.on('close', () => {
            return this.onServerClose();
          });
          return this.server.listen(args.port, '127.0.0.1', () => {
            return this.onServerBound();
          });
        }
      }

      onServerError(err) {
        return console.error(err);
      }

      onServerClose() {
        return console.log('close');
      }

      debugConnections() {
        return this.server.getConnections(function(err, count) {
          return console.log('SAMPLE SERVER', 'count connections', err, count);
        });
      }

      onServerBound() {
        this.address = this.server.address();
        //console.log('server',@address)
        //setInterval @debugConnections.bind(@),3000
        return this.resetTimeoutTimer();
      }

      onClientConnect(client) {
        this.client = client;
        this.client.on('data', (data) => {
          return this.onClientData(data);
        });
        this.client.on('end', (data) => {
          return this.onClientEnd(data);
        });
        this.client.on('error', (err) => {
          return this.onClientError(err);
        });
        return this.client.on('close', () => {
          return this.onClientClose();
        });
      }

      onClientEnd(data) {
        return this.onClientData(data);
      }

      //@client.end()
      onClientData(data) {
        var message, response, sendbuffer, sizemessage;
        if (data != null) {
          //console.log '<<<', data
          message = MessageWrapper.getMessageObject(data);
          if (message === -1 || (message.type_of_message === 4 && message.interface_of_message === 5)) {
            data = data.slice(10);
            if (data.length >= 8) {
              message = MessageWrapper.getMessageObject(data);
            } else {
              return;
            }
          }
          //console.log '<message<', message
          if (message.interface_of_message === 0 && message.serviceID === 1000) {
            console.log('open print service');
            response = new MSG2DCACK();
            response.interface_of_message = message.interface_of_message;
            response.setServiceID(message.serviceID);
            sendbuffer = response.toFullByteArray();
            //console.log '>>>', sendbuffer
            sendbuffer = response.toFullByteArray();
            sizemessage = new MSG2CUPREPARESIZE();
            sizemessage.setSize(sendbuffer.length);
            this.client.write(sizemessage.getBuffer());
            return this.client.write(sendbuffer);
          } else if (message.interface_of_message === 0 && message.type_of_message === 4098) {
            console.log('close service');
            response = new MSG2DCACK();
            response.interface_of_message = message.interface_of_message;
            response.setServiceID(message.serviceID);
            sendbuffer = response.toFullByteArray();
            //console.log '>>>', sendbuffer
            sizemessage = new MSG2CUPREPARESIZE();
            sizemessage.setSize(sendbuffer.length);
            this.client.write(sizemessage.getBuffer());
            return this.client.write(sendbuffer);
          } else if (message.interface_of_message === 0 && message.serviceID === 1003) {
            // open service
            console.log('open status service');
            response = new MSG2DCACK();
            response.interface_of_message = message.interface_of_message;
            response.setServiceID(message.serviceID);
            sendbuffer = response.toFullByteArray();
            //console.log '>>>', sendbuffer
            sizemessage = new MSG2CUPREPARESIZE();
            sizemessage.setSize(sendbuffer.length);
            this.client.write(sizemessage.getBuffer());
            return this.client.write(sendbuffer);
          } else if (message.interface_of_message === 9 && message.type_of_message === 4336) {
            console.log('start print job', message);
            response = new MSG2DCACK();
            response.interface_of_message = 0; //message.interface_of_message
            response.type_of_message = message.type_of_message;
            response.setServiceID(1000);
            //console.log '>>> ***', sendbuffer
            sendbuffer = response.toFullByteArray();
            sizemessage = new MSG2CUPREPARESIZE();
            sizemessage.setSize(sendbuffer.length);
            this.client.write(sizemessage.getBuffer());
            this.client.write(sendbuffer);
            this.nextImprintMessage = message;
            this.isPrinting = 1;
            return this.sendImprints();
          // 000810010000000203e9
          // 000910f20000003c0000000100000001000000dc000000000000000326390e0a050607e013390e0a050607e00000000000000000000008b0000004d80000000c00000061
          // 0008100200000000
          } else if (message.interface_of_message === 9 && message.type_of_message === 4337) {
            console.log('stop print job', message);
            response = new MSG2DCACK();
            response.interface_of_message = 0; //message.interface_of_message
            response.setServiceID(1002);
            sendbuffer = response.toFullByteArray();
            this.isPrinting = 0;
            //console.log '>>> ***', sendbuffer
            this.client.write(sendbuffer);
            return this.nextImprintMessage = null;
          //@client.end()
          //@sendImprints()
          } else if (message.interface_of_message === 9 && message.type_of_message === 4339) {
            console.log('MSG2CURETURNSTATUSLIGHT', message);
            response = new MSG2CURETURNSTATUSLIGHT();
            response.interface_of_message = message.interface_of_message;
            response.setSystemUID(999);
            response.setAvailableScale(3);
            response.setPrintJobActive(0);
            response.setPrintJobID(0);
            if (this.isPrinting === 1) {
              response.setPrintJobID(this.nextImprintMessage.job_id);
              response.setPrintJobActive(this.isPrinting);
            }
            //response.setServiceID message.serviceID
            console.log('MSG2CURETURNSTATUSLIGHT response', response);
            sendbuffer = response.toFullByteArray();
            //console.log '>*>*>', sendbuffer
            sizemessage = new MSG2CUPREPARESIZE();
            sizemessage.setSize(sendbuffer.length);
            this.client.write(sizemessage.getBuffer());
            return this.client.write(sendbuffer);
          } else {
            return console.log('client data', message);
          }
        }
      }

      onClientClose() {}

      //if @client.destroyed==false
      //  @client.destroy()
      onClientError(err) {}

      //if @client.destroyed==false
      //  @client.destroy()
      //console.error 'client error', err
      close() {
        if (this.client.destroyed === false) {
          this.client.destroy();
        }
        return this.server.close();
      }

    };

    Sampleserver.commandName = 'sampleserver';

    Sampleserver.commandArgs = ['port'];

    Sampleserver.commandShortDescription = 'sample port';

    Sampleserver.options = [];

    return Sampleserver;

  }).call(this);

}).call(this);
