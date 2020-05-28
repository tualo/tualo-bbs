(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUGETSTATUS, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Sequence, Status;

  ({EventEmitter} = require('events'));

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUGETSTATUS = require('../FP/MSG2CUGETSTATUS');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = Status = class Status extends Sequence {
    run() {
      this.once('message', (message) => {
        return this.onOpenService(message);
      });
      return this.sendOpenService(Message.SERVICE_STATUS);
    }

    onOpenService(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log(message);
      }
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_STATUS) {
        this.once('message', (message) => {
          return this.onGetStatus(message);
        });
        if (process.env.DEBUG_BBS_STATUS === '1') {
          console.log('sendBBSStatusLight');
        }
        return this.sendBBSStatus();
      }
    }

    //else
    //  @unexpected message
    onCloseService(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log('onCloseService', message, Message.SERVICE_STATUS);
      }
      //if message.type_of_message == Message.TYPE_ACK# and message.serviceID == Message.SERVICE_STATUS_LIGHT
      return this.end();
    }

    //else
    //  @unexpected message
    onGetStatus(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log('onGetStatus', message, Message.TYPE_BBS_GET_STATUS_RESPONSE);
      }
      if (message.type_of_message === Message.TYPE_BBS_GET_STATUS_RESPONSE) {
        this.message = message;
        this.once('message', (message) => {
          return this.onCloseService(message);
        });
        return this.sendCloseService();
      } else {

      }
    }

    //    @unexpected message
    sendBBSStatus() {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUGETSTATUS();
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE();
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    }

  };

}).call(this);
