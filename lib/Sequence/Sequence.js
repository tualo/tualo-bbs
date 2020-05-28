(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Sequence;

  ({EventEmitter} = require('events'));

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  module.exports = Sequence = class Sequence extends EventEmitter {
    constructor(socket) {
      super();
      this.client = socket;
      this.client.closeEventName = 'expected';
      this.client.on('data', (data) => {
        return this.onData(data);
      });
      this.message = null;
    }

    run() {}

    end() {
      this.client.removeListener('data', this.onData);
      this.client.closeEventName = 'expected';
      this.emit('end', this.message);
      return this.client.end();
    }

    unexpected(message) {
      this.client.removeListener('data', this.onData);
      return this.emit('unexpected', message);
    }

    onData(data) {
      var message;
      if (process.env.DEBUG_BBS_SEQUENCE === '1') {
        console.log('##############################');
        console.log('<<<<', 'Sequence', 'onData', data);
        console.log('##############################');
      }
      message = MessageWrapper.getMessageObject(data);
      if (message === -1) {
        return;
      }
      return this.emit('message', message);
    }

    sendCloseService() {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUCLOSESERVICE();
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE();
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    }

    //@client.end()
    sendOpenService(type) {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUOPENSERVICE();
      message.setServiceID(type);
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE();
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    }

  };

}).call(this);
