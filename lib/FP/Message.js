(function() {
  var EventEmitter, Message, MessageBuffer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  MessageBuffer = require('./MessageBuffer');

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

    Message.TYPE_BBS_STOP_PRINTJOB = 0x10f1;

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
      this.app_data = new Buffer(0);
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

    Message.prototype.setApplictiondata = function() {
      return this.app_data = new Buffer(0);
    };

    Message.prototype.toFullByteArray = function() {
      var res;
      this.setApplictiondata();
      res = new Buffer(8 + this.app_data.length);
      res.writeUInt16BE(this.interface_of_message, 0);
      res.writeUInt16BE(this.type_of_message, 2);
      res.writeUInt32BE(this.app_data.length, 4);
      this.app_data.copy(res, 8);
      return res;
    };

    return Message;

  })(EventEmitter);

}).call(this);
