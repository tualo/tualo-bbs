(function() {
  var MSG2CUGETSTATUSRESPONSE, Message;

  Message = require('./Message');

  module.exports = MSG2CUGETSTATUSRESPONSE = class MSG2CUGETSTATUSRESPONSE extends Message {
    constructor() {
      super();
      this.b_unkown = 1;
      this.statusID = 0x191b;
      this.version = new Buffer(0);
      this.setMessageInterface(Message.INTERFACE_DO);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS_RESPONSE);
    }

    setStatusID(id) {
      return this.statusID = id;
    }

    readApplictiondata(data) {
      var position;
      position = -1;
      this.b_unkown = data.readUInt8(position += 1);
      this.serviceID = data.readUInt16BE(position += 2);
      this.version_length = data.readUInt32BE(position += 4);
      return this.version = data.slice(position);
    }

    setApplictiondata() {
      var position;
      this.app_data = new Buffer(7 + version.length);
      position = -1;
      this.app_data.writeUInt8(this.b_unkown, position += 1);
      this.app_data.writeUInt16BE(this.statusID, position += 2);
      this.app_data.writeUInt32BE(version.length, position += 4);
      return version.copy(this.app_data, position);
    }

  };

}).call(this);
