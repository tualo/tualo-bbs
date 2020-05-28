(function() {
  var MSG2CUPREPARESIZE, Message;

  Message = require('./Message');

  module.exports = MSG2CUPREPARESIZE = class MSG2CUPREPARESIZE extends Message {
    constructor() {
      super();
      this.size = 0;
      this.setMessageInterface(Message.INTERFACE_UN);
      this.setMessageType(Message.TYPE_PREPARE_SIZE);
    }

    setSize(val) {
      return this.size = val;
    }

    readApplictiondata(data) {
      data.position = 0;
      return this.size = data.readUInt16BE();
    }

    setApplictiondata(data) {
      var position;
      position = 0;
      this.app_data = new Buffer(2);
      return this.app_data.writeUInt16BE(this.size, position);
    }

    getBuffer() {
      var buf;
      this.setApplictiondata();
      buf = new Buffer(10);
      buf.writeUInt16BE(this.interface_of_message, 0);
      buf.writeUInt16BE(this.type_of_message, 2);
      buf.writeUInt32BE(0x00010000, 4);
      this.app_data.copy(buf, 8);
      return buf;
    }

  };

}).call(this);
