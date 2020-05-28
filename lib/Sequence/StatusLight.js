(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUGETSTATUSLIGHT, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2DCACK, Message, MessageWrapper, Sequence, StatusLight;

  ({EventEmitter} = require('events'));

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUGETSTATUSLIGHT = require('../FP/MSG2CUGETSTATUSLIGHT');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = StatusLight = class StatusLight extends Sequence {
    run() {
      this.once('message', (message) => {
        return this.onOpenService(message);
      });
      return this.sendOpenService(Message.SERVICE_STATUS_LIGHT);
    }

    onOpenService(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log(message);
      }
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_STATUS_LIGHT) {
        this.once('message', (message) => {
          return this.onGetStatusLight(message);
        });
        if (process.env.DEBUG_BBS_STATUS === '1') {
          console.log('sendBBSStatusLight');
        }
        return this.sendBBSStatusLight();
      }
    }

    //else
    //  @unexpected message
    onCloseService(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log('onCloseService', message, Message.SERVICE_STATUS_LIGHT);
      }
      //if message.type_of_message == Message.TYPE_ACK# and message.serviceID == Message.SERVICE_STATUS_LIGHT
      return this.end();
    }

    //else
    //  @unexpected message
    onGetStatusLight(message) {
      if (process.env.DEBUG_BBS_STATUS === '1') {
        console.log('onGetStatusLight', message, Message.TYPE_BBS_RETURN_STATUS_LIGHT);
      }
      if (message.type_of_message === Message.TYPE_BBS_RETURN_STATUS_LIGHT) {
        this.message = message;
        this.once('message', (message) => {
          return this.onCloseService(message);
        });
        return this.sendCloseService();
      } else {

      }
    }

    //    @unexpected message
    sendBBSStatusLight() {
      var message, sendbuffer, sizemessage;
      message = new MSG2CUGETSTATUSLIGHT();
      sendbuffer = message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE();
      sizemessage.setSize(sendbuffer.length);
      this.client.write(sizemessage.getBuffer());
      return this.client.write(sendbuffer);
    }

  };

}).call(this);
