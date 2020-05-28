(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2CUSTOPPRINTJOB, MSG2DCACK, Message, MessageWrapper, Sequence, StopPrintjob;

  ({EventEmitter} = require('events'));

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUSTOPPRINTJOB = require('../FP/MSG2CUSTOPPRINTJOB');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = StopPrintjob = class StopPrintjob extends Sequence {
    run() {
      this.stop_message = new MSG2CUSTOPPRINTJOB();
      this.once('message', (message) => {
        return this.onOpenService(message);
      });
      return this.sendOpenService(Message.SERVICE_BBS_PRINTJOB);
    }

    onOpenService(message) {
      if (process.env.DEBUG_BBS_STOPJOB === '1') {
        console.log('MSG2CUSTOPPRINTJOB', 'onOpenService', message.type_of_message, message.serviceID);
      }
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_BBS_PRINTJOB) {
        this.once('message', (message) => {
          return this.onStopPrintJob(message);
        });
        return this.stopPrintJob();
      } else {
        return this.unexpected(message);
      }
    }

    onCloseService(message) {
      if (process.env.DEBUG_BBS_STOPJOB === '1') {
        console.log('MSG2CUSTOPPRINTJOB', 'onCloseService', message.type_of_message);
      }
      if (message.type_of_message === Message.TYPE_ACK) { // and message.serviceID == Message.SERVICE_BBS_PRINTJOB
        return this.end();
      }
    }

    //else
    //  @unexpected message
    onStopPrintJob(message) {
      if (process.env.DEBUG_BBS_STOPJOB === '1') {
        console.log('MSG2CUSTOPPRINTJOB', 'onStopPrintJob', message, 'Message.TYPE_BBS_STOP_PRINTJOB', Message.TYPE_BBS_STOP_PRINTJOB);
      }
      //if message.type_of_message == Message.TYPE_BBS_STOP_PRINTJOB
      this.message = message;
      this.once('message', (message) => {
        return this.onCloseService(message);
      });
      return this.sendCloseService();
    }

    //else
    //  @unexpected message
    stopPrintJob() {
      var sendbuffer, sizemessage;
      if (process.env.DEBUG_BBS_STOPJOB === '1') {
        console.log('MSG2CUSTOPPRINTJOB', 'stopPrintJob');
      }
      sendbuffer = this.stop_message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE();
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    }

  };

}).call(this);
