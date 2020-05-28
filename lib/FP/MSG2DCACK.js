(function() {
  var MSG2DCACK, Message;

  Message = require('./Message');

  module.exports = MSG2DCACK = class MSG2DCACK extends Message {
    constructor() {
      super();
      this.serviceID = 0;
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_ACK);
    }

    setServiceID(id) {
      return this.serviceID = id;
    }

    setApplictiondata() {
      this.app_data = new Buffer(2);
      return this.app_data.writeUInt16BE(this.serviceID);
    }

    readApplictiondata(data) {
      return this.serviceID = data.readUInt16BE(0);
    }

  };

}).call(this);
