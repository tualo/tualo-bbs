(function() {
  var EventEmitter, Imprint, MSG2CUPREPARESIZE, MSG2DCACK, MSG2HSNEXTIMPRINT, Message, MessageWrapper, freeport, net, os;

  ({EventEmitter} = require('events'));

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2HSNEXTIMPRINT = require('../FP/MSG2HSNEXTIMPRINT');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  MSG2DCACK = require('../FP/MSG2DCACK');

  net = require('net');

  os = require('os');

  freeport = require('freeport');

  module.exports = Imprint = class Imprint extends EventEmitter {
    constructor(machine_ip) {
      super();
      this.machine_ip = machine_ip;
      this.timeout = 60 * 60 * 60000;
      this.port = 14445;
      this.server = null;
      this.client = null;
    }

    getPort() {
      return this.address.port;
    }

    getIP() {
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
    }

    //setPort: (val) ->
    //  @port = val
    resetTimeoutTimer() {
      return this.stopTimeoutTimer();
    }

    //@timeout_timer = setTimeout @close.bind(@), @timeout
    stopTimeoutTimer() {
      if (this.timeout_timer) {
        return clearTimeout(this.timeout_timer);
      }
    }

    //@timeout_timer = setTimeout @close.bind(@), @timeout
    reopen() {
      if (this.server !== null) {
        this.server.close();
        this.server = null;
      }
      return this.open();
    }

    open() {
      var options;
      if (this.server === null) {
        //freeport (err,port) =>
        //@port = port

        // half on is it correct there?
        options = {
          family: 'IPv4',
          host: '0.0.0.0',
          allowHalfOpen: false,
          pauseOnConnect: false
        };
        this.server = net.createServer(options, (client) => {
          return this.onClientConnect(client);
        });
        this.server.on('error', (err) => {
          return this.onServerError(err);
        });
        this.server.on('close', () => {
          return this.onServerClose();
        });
        //@server.listen 0, @getIP(), () => @onServerBound()
        return this.server.listen(0, '0.0.0.0', () => {
          return this.onServerBound();
        });
      }
    }

    onServerError(err) {
      return console.error(err);
    }

    debugConnections() {
      return this.server.getConnections(function(err, count) {
        return console.log('IMPRINT SERVER', 'count connections', err, count);
      });
    }

    onServerBound() {
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
    }

    onClientConnect(client) {
      //console.log 'imprint','client connect'
      //if @client==null
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

    //else
    //  console.error 'onClientConnect','there is a client allready'
    onClientEnd(data) {
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.log('imprint client end');
      }
      return this.onClientData(data);
    }

    onClientData(data) {
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
          ack = new MSG2DCACK();
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
          ack = new MSG2DCACK();
          ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          ack.setApplictiondata();
          return this.client.write(ack.toFullByteArray());
        } else if (message.type_of_message === Message.TYPE_OPEN_SERVICE) {
          if (process.env.DEBUG_BBS_IMPRINT === '1') {
            console.log('imprint', 'TYPE_OPEN_SERVICE');
          }
          this.emit('acting');
          ack = new MSG2DCACK();
          ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          ack.setApplictiondata();
          sendbuffer = ack.toFullByteArray();
          //sizemessage = new MSG2CUPREPARESIZE
          //sizemessage.setSize sendbuffer.length
          //@client.write sizemessage.getBuffer()
          return this.client.write(sendbuffer);
        //@client.write ack.app_data
        } else if (message.type_of_message === 4098) {
          this.emit('acting');
          ack = new MSG2DCACK();
          ack.setServiceID(Message.SERVICE_NEXT_IMPRINT);
          ack.setApplictiondata();
          sendbuffer = ack.toFullByteArray();
          //sizemessage = new MSG2CUPREPARESIZE
          //sizemessage.setSize sendbuffer.length
          //@client.write sizemessage.getBuffer()
          return this.client.write(sendbuffer);
        } else {
          //@client.end()
          //@client.write ack.app_data
          if (process.env.DEBUG_BBS_IMPRINT === '1') {
            return console.log('message', 'not expected imprint messages');
          }
        }
      }
    }

    onClientClose() {
      //@client = null
      if (this.client.destroyed === false) {
        this.client.destroy();
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        return console.error('onClientClose()');
      }
    }

    onClientError(err) {
      if (this.client.destroyed === false) {
        this.client.destroy();
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        return console.error('client error', err);
      }
    }

    closeClient() {
      if (this.client != null) {
        if (this.client.destroyed === false) {
          this.client.end();
        } //!=null
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
    }

    close() {
      if (this.client != null) {
        this.client.end(); //!=null
      }
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.error('server ------>   close()');
      }
      return this.server.close();
    }

    onServerClose() {
      if (process.env.DEBUG_BBS_IMPRINT === '1') {
        console.error('onServerClose');
      }
      this.stopTimeoutTimer();
      return this.emit("closed");
    }

  };

}).call(this);
