(function() {
  var MSG2CUGETSTATUS, MSG2CUGETSTATUSLIGHT, MSG2CUGETSTATUSRESPONSE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2CURETURNSTATUSLIGHT, MSG2CUSTARTPRINTJOB, MSG2CUSTOPPRINTJOB, MSG2DCACK, MSG2DCNAK, MSG2HSNEXTIMPRINT, Message, MessageBuffer, MessageWrapper;

  MessageBuffer = require('./MessageBuffer');

  Message = require('./Message');

  MSG2DCACK = require('./MSG2DCACK');

  MSG2DCNAK = require('./MSG2DCNAK');

  MSG2HSNEXTIMPRINT = require('./MSG2HSNEXTIMPRINT');

  MSG2CUSTOPPRINTJOB = require('./MSG2CUSTOPPRINTJOB');

  MSG2CUSTARTPRINTJOB = require('./MSG2CUSTARTPRINTJOB');

  MSG2CURETURNSTATUSLIGHT = require('./MSG2CURETURNSTATUSLIGHT');

  MSG2CUPREPARESIZE = require('./MSG2CUPREPARESIZE');

  MSG2CUOPENSERVICE = require('./MSG2CUOPENSERVICE');

  MSG2CUGETSTATUSRESPONSE = require('./MSG2CUGETSTATUSRESPONSE');

  MSG2CUGETSTATUSLIGHT = require('./MSG2CUGETSTATUSLIGHT');

  MSG2CUGETSTATUS = require('./MSG2CUGETSTATUS');

  MSG2CUOPENSERVICE = require('./MSG2CUOPENSERVICE');

  module.exports = MessageWrapper = (function() {
    function MessageWrapper() {}

    MessageWrapper.getMessageObject = function(data) {
      var message_interface, message_size, message_type, msg, size, temp_data;
      message_type = 0;
      message_interface = 0;
      message_size = 0;
      msg = null;
      temp_data = new Buffer(data.length - 8);
      if (data.length >= 8) {
        data.position = 0;
        message_interface = data.readUInt16BE(0);
        data.position += 2;
        message_type = data.readUInt16BE(2);
        data.position += 2;
        message_size = data.readUInt32BE(4);
        data.position += 4;
        if (message_interface === 5) {
          if (message_type === Message.TYPE_ACK) {
            size = data.readUInt16BE(4);
            data.position += 4;
            msg = new MSG2CUPREPARESIZE;
            data = data.slice(10);
            if (data.length >= 8) {
              data.position = 0;
              message_interface = data.readUInt16BE(0);
              data.position += 2;
              message_type = data.readUInt16BE(2);
              data.position += 2;
              message_size = data.readUInt32BE(4);
              data.position += 4;
            } else {
              return -1;
            }
          }
        }
        console.log('message_type', message_type);
        console.log('message_interface', message_interface);
        if (message_type === Message.TYPE_ACK) {
          if (message_interface === 0) {
            msg = new MSG2DCACK;
          }
        }
        if (message_type === Message.TYPE_NAK) {
          msg = new MSG2DCNAK;
        }
        if (message_type === Message.TYPE_OPEN_SERVICE) {
          msg = new MSG2CUOPENSERVICE;
        }
        if (message_type === Message.TYPE_CLOSE_SERVICE) {
          msg = new MSG2CUCLOSESERVICE;
        }
        if (message_type === Message.TYPE_BBS_RETURN_STATUS_LIGHT) {
          msg = new MSG2CURETURNSTATUSLIGHT;
        }
        if (message_type === Message.TYPE_BBS_GET_STATUS_LIGHT) {
          msg = new MSG2CUGETSTATUSLIGHT;
        }
        if (message_type === Message.TYPE_BBS_START_PRINTJOB) {
          msg = new MSG2CUSTARTPRINTJOB;
        }
        if (message_type === Message.TYPE_BBS_STOP_PRINT_JOB) {
          msg = new MSG2CUSTOPPRINTJOB;
        }
        if (message_type === Message.TYPE_PREPARE_SIZE) {
          msg = new MSG2CUPREPARESIZE;
        }
        if (message_type === Message.TYPE_BBS_GET_STATUS) {
          msg = new MSG2CUGETSTATUS;
        }
        if (message_type === Message.TYPE_BBS_GET_STATUS_RESPONSE) {
          msg = new MSG2CUGETSTATUSRESPONSE;
        }
        if (message_type === Message.TYPE_BBS_NEXT_IMPRINT) {
          msg = new MSG2HSNEXTIMPRINT;
        }
        if (message_type === Message.TYPE_BBS_NEXT_IMPRINT) {
          msg = new MSG2HSNEXTIMPRINT;
        }
        if (msg === null) {
          msg = new MSG2DCNAK();
          console.error('unknown message type ' + message_type.toString(16));
        }
        msg.setMessageType(message_type);
        msg.setMessageInterface(message_interface);
        temp_data = data.slice(data.position);
        msg.readApplictiondata(temp_data);
      } else {
        throw new Error("Incorrect Message length");
      }
      return msg;
    };

    return MessageWrapper;

  })();

}).call(this);
