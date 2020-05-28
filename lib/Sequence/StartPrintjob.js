(function() {
  var EventEmitter, MSG2CUCLOSESERVICE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2CUSTARTPRINTJOB, MSG2DCACK, Message, MessageWrapper, Sequence, StartPrintjob;

  ({EventEmitter} = require('events'));

  Message = require('../FP/Message');

  MessageWrapper = require('../FP/MessageWrapper');

  MSG2DCACK = require('../FP/MSG2DCACK');

  MSG2CUOPENSERVICE = require('../FP/MSG2CUOPENSERVICE');

  MSG2CUSTARTPRINTJOB = require('../FP/MSG2CUSTARTPRINTJOB');

  MSG2CUCLOSESERVICE = require('../FP/MSG2CUCLOSESERVICE');

  MSG2CUPREPARESIZE = require('../FP/MSG2CUPREPARESIZE');

  Sequence = require('./Sequence');

  module.exports = StartPrintjob = class StartPrintjob extends Sequence {
    setJobId(val) {
      return this.start_message.setJobId(parseInt(val));
    }

    setCustomerId(val) {
      return this.start_message.setCustomerId(parseInt(val));
    }

    setPrintDate(val) {
      return this.start_message.setPrintDate(parseInt(val));
    }

    setDateAhead(val) {
      return this.start_message.setDateAhead(parseInt(val));
    }

    setWeightMode(val) {
      return this.start_message.setWeightMode(parseInt(val));
    }

    setPrintOffset(val) {
      return this.start_message.setPrintOffset(parseInt(val));
    }

    setImageId(val) {
      return this.start_message.setImageId(parseInt(val));
    }

    setPrintEndorsement(val) {
      return this.start_message.setPrintEndorsement(parseInt(val));
    }

    setEndorsementID(val) {
      return this.start_message.setEndorsementID(parseInt(val));
    }

    setEndorsementText1(val) {
      return this.start_message.setEndorsementText1(val);
    }

    setEndorsementText2(val) {
      return this.start_message.setEndorsementText2(val);
    }

    setAdvert(val) {
      return this.start_message.setAdvert(val);
    }

    setAdvertHex(val) {
      var e;
      try {
        console.log('StartPrintjob setAdvertHex', val);
        return this.start_message.setAdvert(Buffer.from(val.replace(/\s/g, '+'), 'base64'));
      } catch (error) {
        e = error;
        console.log('StartPrintjob setAdvertHex error', val);
        return this.start_message.setAdvert(new Buffer(val.replace(/\s/g, '+'), 'base64'));
      }
    }

    setTownCircleID(val) {
      return this.start_message.setTownCircleID(parseInt(val));
    }

    setTownCircle(val) {
      return this.start_message.setTownCircle(val);
    }

    setCustomerNumber(val) {
      return this.start_message.setCustomerNumber(val);
    }

    setImprintChannelIP(val) {
      return this.start_message.setImprintChannelIP(val);
    }

    setImprintChannelPort(val) {
      return this.start_message.setImprintChannelPort(parseInt(val));
    }

    init() {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'init');
      }
      return this.start_message = new MSG2CUSTARTPRINTJOB();
    }

    run() {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'run');
      }
      this.once('message', (message) => {
        return this.onOpenService(message);
      });
      return this.sendOpenService(Message.SERVICE_BBS_PRINTJOB);
    }

    onOpenService(message) {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'onOpenService', message);
      }
      if (message.type_of_message === Message.TYPE_ACK && message.serviceID === Message.SERVICE_BBS_PRINTJOB) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'expected', message);
        }
        this.once('message', (message) => {
          return this.onStartPrintJob(message);
        });
        return this.startPrintJob();
      } else {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'unexpected', message);
        }
        return this.unexpected(message);
      }
    }

    onCloseService(message) {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'onCloseService', message);
      }
      if (message.type_of_message === Message.TYPE_ACK) { // and message.serviceID == Message.SERVICE_BBS_PRINTJOB
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'expected', message);
        }
        return this.end();
      } else {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'unexpected', message);
        }
        return this.unexpected(message);
      }
    }

    onStartPrintJob(message) {
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log('StartPrintjob', 'onStartPrintJob', message);
      }
      if (message.type_of_message === Message.TYPE_BBS_START_PRINTJOB) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'TYPE_BBS_START_PRINTJOB', message);
          console.log('TYPE_BBS_START_PRINTJOB');
        }
        this.message = message;
        this.once('message', (message) => {
          return this.onCloseService(message);
        });
        this.sendCloseService();
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          return console.log('ok closing');
        }
      } else if (message.type_of_message === Message.TYPE_ACK) {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'TYPE_ACK', message);
          console.log('TYPE_ACK');
        }
        this.once('message', (message) => {
          return this.onCloseService(message);
        });
        return this.sendCloseService();
      } else {
        if (process.env.DEBUG_BBS_STARTJOB === '1') {
          console.log('StartPrintjob', 'something went wrong', message.type_of_message);
        }
        return this.unexpected(message);
      }
    }

    //else
    //  @unexpected message
    startPrintJob() {
      var sendbuffer, sizemessage;
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log("start message>", this.start_message);
      }
      sendbuffer = this.start_message.toFullByteArray();
      sizemessage = new MSG2CUPREPARESIZE();
      sizemessage.setSize(sendbuffer.length);
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log("sizemessage> ", sizemessage.getBuffer().toString('hex'));
      }
      this.client.write(sizemessage.getBuffer());
      if (process.env.DEBUG_BBS_STARTJOB === '1') {
        console.log("sendbuffer> ", sendbuffer.toString('hex'));
        console.log("image> ", this.start_message.advert.toString('hex'));
        console.log("image> ", this.start_message.advert.toString('base64'));
      }
      return this.client.write(sendbuffer);
    }

  };

}).call(this);
