(function() {
  var MSG2CUOPENSERVICE, Message, MessageBuffer;

  Message = require('./Message');

  MessageBuffer = require('./MessageBuffer');

  module.exports = MSG2CUOPENSERVICE = class MSG2CUOPENSERVICE extends Message {
    constructor() {
      super();
      this.type = 'MSG2CUOPENSERVICE';
      this.serviceID = 0;
      this.errorCode = 0;
      this.info = "";
      this.setMessageInterface(Message.INTERFACE_SO);
      this.setMessageType(Message.TYPE_OPEN_SERVICE);
    }

    setServiceID(id) {
      return this.serviceID = id;
    }

    readApplictiondata(data) {
      return this.serviceID = data.readUInt16BE(0);
    }

    setApplictiondata() {
      this.app_data = new Buffer(2);
      return this.app_data.writeUInt16BE(this.serviceID, 0);
    }

  };

}).call(this);
