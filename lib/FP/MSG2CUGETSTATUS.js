(function() {
  var MSG2CUGETSTATUS, Message;

  Message = require('./Message');

  module.exports = MSG2CUGETSTATUS = class MSG2CUGETSTATUS extends Message {
    constructor() {
      super();
      this.b_unkown = 1;
      this.statusID = 0x191b;
      this.setMessageInterface(Message.INTERFACE_DO);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS);
    }

    setStatusID(id) {
      return this.statusID = id;
    }

    readApplictiondata(data) {
      var position;
      position = -1;
      this.b_unkown = data.readUInt8(position += 1);
      return this.serviceID = data.readUInt16BE(position += 2);
    }

    setApplictiondata() {
      var position;
      this.app_data = new Buffer(3);
      position = -1;
      this.app_data.writeUInt8(this.b_unkown, position += 1);
      return this.app_data.writeUInt16BE(this.statusID, position += 2);
    }

  };

}).call(this);
