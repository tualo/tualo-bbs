(function() {
  var EventEmitter, MSG2CUGETSTATUS, MSG2CUGETSTATUSLIGHT, MSG2CUGETSTATUSRESPONSE, MSG2CUOPENSERVICE, MSG2CUPREPARESIZE, MSG2CURETURNSTATUSLIGHT, MSG2CUSTARTPRINTJOB, MSG2CUSTOPPRINTJOB, MSG2DCACK, MSG2DCNAK, MSG2HSNEXTIMPRINT, Message, MessageBuffer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  MessageBuffer = require('./MessageBuffer');

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

  module.exports = Message = (function(superClass) {
    extend(Message, superClass);

    Message.INTERFACE_SO = 0;

    Message.INTERFACE_CI = 8;

    Message.INTERFACE_DI = 9;

    Message.INTERFACE_UN = 5;

    Message.INTERFACE_DO = 1;

    Message.SERVICE_BBS_PRINTJOB = 0x03e8;

    Message.SERVICE_NEXT_IMPRINT = 0x03e9;

    Message.SERVICE_TIME_SYNC = 0x03ea;

    Message.SERVICE_STATUS_LIGHT = 0x03eb;

    Message.SERVICE_STATUS = 0x0391;

    Message.TYPE_PREPARE_SIZE = 0x0004;

    Message.TYPE_LENGTH = 0x9001;

    Message.TYPE_ACK = 0x0001;

    Message.TYPE_NAK = 0x0000;

    Message.TYPE_OPEN_SERVICE = 0x1001;

    Message.TYPE_CLOSE_SERVICE = 0x1002;

    Message.TYPE_BBS_UNKOWN1 = 0x03eb;

    Message.TYPE_BBS_START_PRINTJOB = 0x10f0;

    Message.TYPE_BBS_STOP_PRINT_JOB = 0x10f1;

    Message.TYPE_BBS_NEXT_IMPRINT = 0x10f2;

    Message.TYPE_BBS_GET_STATUS_LIGHT = 0x10f3;

    Message.TYPE_BBS_GET_STATUS = 0x1040;

    Message.TYPE_BBS_GET_STATUS_RESPONSE = 0x1041;

    Message.TYPE_BBS_RETURN_STATUS_LIGHT = 0x10f4;

    Message.TYPE_BBS_TIME_SYNC = 0x10f5;

    Message.WEIGHT_MODE_STATIC = 0;

    Message.WEIGHT_MODE_FIRST_DYNAMIC = 1;

    Message.WEIGHT_MODE_DYNAMIC = 2;

    Message.WEIGHT_MODE_WITHOUT = 3;

    Message.PRINT_DATE_ON = 1;

    Message.PRINT_DATE_OFF = 0;

    Message.PRINT_ENDORSEMENT_ON = 1;

    Message.PRINT_ENDORSEMENT_OFF = 0;

    function Message(options) {
      this.interface_of_message = 0;
      this.type_of_message = 0;
      this.bytes_of_application_data = 0;
      this.app_data = new MessageBuffer;
    }

    Message.prototype.setMessageInterface = function(num) {
      return this.interface_of_message = num;
    };

    Message.prototype.setMessageType = function(num) {
      return this.type_of_message = num;
    };

    Message.prototype.readApplictiondata = function(buffer) {
      return this.app_data = buffer;
    };

    Message.getMessageObject = function(data) {
      var message_interface, message_size, message_type, msg, temp_data;
      message_type = 0;
      message_interface = 0;
      message_size = 0;
      msg = null;
      temp_data = new MessageBuffer;
      if (data.length >= 8) {
        data.position = 0;
        message_interface = data.readShort();
        data.position++;
        message_type = data.readShort();
        data.position++;
        message_size = data.readUInt();
        data.position += 2;
        if (message_type === Message.TYPE_ACK) {
          if (message_interface === 0) {
            msg = new MSG2DCACK;
          } else {
            msg = new MSG2CUPREPARESIZE;
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

    return Message;

  })(EventEmitter);

}).call(this);
